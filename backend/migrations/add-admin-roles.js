const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addAdminRoles() {
    let connection;

    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
            port: process.env.DB_PORT || 3306,
            database: 'lsa_spa_management'
        };

        console.log('🔄 Attempting to connect to database...');
        console.log('   Host:', dbConfig.host);
        console.log('   User:', dbConfig.user);
        console.log('   Database:', dbConfig.database);

        connection = await mysql.createConnection(dbConfig);

        console.log('✅ Connected to database');

        // Update admin_users table to support new roles
        await connection.execute(`
            ALTER TABLE admin_users 
            MODIFY COLUMN role ENUM('admin_lsa', 'admin_spa', 'government_officer', 'super_admin', 'admin', 'financial_officer') NOT NULL
        `);
        console.log('✅ Updated admin_users role column');

        // Create super admin account (Avishka/Avishka@123)
        const hashedPassword = await bcrypt.hash('Avishka@123', 10);

        // Check if super admin already exists
        const [existingAdmin] = await connection.execute(
            'SELECT id FROM admin_users WHERE username = ?',
            ['Avishka']
        );

        if (existingAdmin.length === 0) {
            await connection.execute(`
                INSERT INTO admin_users (
                    username, 
                    email, 
                    password_hash, 
                    role, 
                    full_name, 
                    phone, 
                    is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                'Avishka',
                'avishka@lsa.gov.lk',
                hashedPassword,
                'super_admin',
                'Avishka Nawagamuwa',
                '+94771234567',
                1
            ]);
            console.log('✅ Super Admin account created');
            console.log('   Username: Avishka');
            console.log('   Password: Avishka@123');
            console.log('   Role: super_admin');
        } else {
            // Update existing account to super_admin
            await connection.execute(
                'UPDATE admin_users SET role = ?, password_hash = ? WHERE username = ?',
                ['super_admin', hashedPassword, 'Avishka']
            );
            console.log('✅ Existing Avishka account updated to super_admin');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addAdminRoles();
