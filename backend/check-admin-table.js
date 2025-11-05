const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdminUsersTable() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lsa_spa_management'
        });

        console.log('✅ Connected to database\n');

        // Check table structure
        const [columns] = await connection.execute('DESCRIBE admin_users');

        console.log('📋 admin_users Table Structure:');
        console.log('========================');
        columns.forEach(col => {
            console.log(`${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'}`);
        });

        console.log('\n📊 Current Data:');
        console.log('========================');
        const [rows] = await connection.execute('SELECT * FROM admin_users');
        console.log(rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAdminUsersTable();
