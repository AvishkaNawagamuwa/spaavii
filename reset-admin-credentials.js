const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'spa_management',
    password: '1234',
    port: 5432,
});

async function resetAdminCredentials() {
    const client = await pool.connect();

    try {
        console.log('🔍 Checking current admin users...\n');

        // Get all admin users
        const result = await client.query(`
      SELECT id, username, spa_name, email, phone 
      FROM admin_users 
      ORDER BY id
    `);

        console.log('📋 Current Admin Users:');
        console.log('========================');
        result.rows.forEach(admin => {
            console.log(`ID: ${admin.id}`);
            console.log(`Username: ${admin.username}`);
            console.log(`SPA Name: ${admin.spa_name}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Phone: ${admin.phone}`);
            console.log('------------------------');
        });

        if (result.rows.length === 0) {
            console.log('❌ No admin users found!');
            return;
        }

        console.log('\n🔄 Resetting credentials for all admin users...\n');

        // Reset credentials for each admin
        for (const admin of result.rows) {
            const defaultUsername = admin.spa_name.toLowerCase().replace(/\s+/g, '');
            const defaultPassword = 'Admin@123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            await client.query(
                `UPDATE admin_users 
         SET username = $1, password = $2 
         WHERE id = $3`,
                [defaultUsername, hashedPassword, admin.id]
            );

            console.log(`✅ Reset credentials for: ${admin.spa_name}`);
            console.log(`   Username: ${defaultUsername}`);
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
    } finally {
        client.release();
        await pool.end();
    }
}

resetAdminCredentials();
