const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminCredentials() {
    let connection;

    try {
        // Create connection to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'spa_management'
        });

        console.log('🔍 Checking current admin users...\n');

        // Get all admin users with SPA details
        const [rows] = await connection.execute(`
      SELECT 
        au.id, 
        au.username, 
        au.email, 
        au.phone, 
        au.role,
        au.spa_id,
        s.name as spa_name 
      FROM admin_users au
      LEFT JOIN spas s ON au.spa_id = s.id
      WHERE au.role = 'admin_spa'
      ORDER BY au.id
    `);

        console.log('📋 Current Admin SPA Users:');
        console.log('========================');
        rows.forEach(admin => {
            console.log(`ID: ${admin.id}`);
            console.log(`Username: ${admin.username}`);
            console.log(`SPA Name: ${admin.spa_name || 'N/A'}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Phone: ${admin.phone}`);
            console.log('------------------------');
        });

        if (rows.length === 0) {
            console.log('❌ No admin SPA users found!');
            return;
        }

        console.log('\n🔄 Resetting credentials for all admin SPA users...\n');

        // Keep track of used usernames to handle duplicates
        const usedUsernames = {};

        // Reset credentials for each admin
        for (const admin of rows) {
            if (!admin.spa_name) {
                console.log(`⚠️  Skipping user ID ${admin.id} - No SPA name found`);
                continue;
            }

            let baseUsername = admin.spa_name.toLowerCase().replace(/\s+/g, '');
            let username = baseUsername;

            // Handle duplicate usernames by adding a number suffix
            if (usedUsernames[username]) {
                let counter = 2;
                while (usedUsernames[`${baseUsername}${counter}`]) {
                    counter++;
                }
                username = `${baseUsername}${counter}`;
            }

            usedUsernames[username] = true;

            const defaultPassword = 'Admin@123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            await connection.execute(
                `UPDATE admin_users 
         SET username = ?, password_hash = ? 
         WHERE id = ?`,
                [username, hashedPassword, admin.id]
            );

            console.log(`✅ Reset credentials for: ${admin.spa_name}`);
            console.log(`   Username: ${username}`);
            console.log(`   Password: ${defaultPassword}`);
            console.log('------------------------');
        }

        console.log('\n✨ All admin credentials have been reset!');
        console.log('\n📝 Default Login Format:');
        console.log('========================');
        console.log('Username: [spa_name in lowercase without spaces]');
        console.log('Password: Admin@123');
        console.log('\nExample:');
        console.log('If SPA Name is "sarath ponseka"');
        console.log('Username: sarathponseka');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

resetAdminCredentials();
