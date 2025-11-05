const db = require('./config/database');

async function checkTable() {
    console.log('🔍 Checking for password_reset_tokens table...\n');

    try {
        const connection = await db.getConnection();

        try {
            // Check if table exists
            const [tables] = await connection.execute(
                "SHOW TABLES LIKE 'password_reset_tokens'"
            );

            if (tables.length > 0) {
                console.log('✅ Table password_reset_tokens already exists!');

                // Show table structure
                const [columns] = await connection.execute(
                    'DESCRIBE password_reset_tokens'
                );

                console.log('\n📋 Table Structure:');
                console.log('-------------------');
                columns.forEach(col => {
                    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? col.Key : ''}`);
                });
            } else {
                console.log('❌ Table password_reset_tokens does NOT exist');
                console.log('Creating table now...\n');

                // Create table
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) UNIQUE NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        used BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
                        INDEX idx_token (token),
                        INDEX idx_email (email),
                        INDEX idx_expires (expires_at)
                    )
                `);

                console.log('✅ Table created successfully!');

                // Verify
                const [newTables] = await connection.execute(
                    "SHOW TABLES LIKE 'password_reset_tokens'"
                );

                if (newTables.length > 0) {
                    console.log('✅ Verification: Table exists');

                    const [columns] = await connection.execute(
                        'DESCRIBE password_reset_tokens'
                    );

                    console.log('\n📋 Table Structure:');
                    console.log('-------------------');
                    columns.forEach(col => {
                        console.log(`  ${col.Field} (${col.Type})`);
                    });
                }
            }

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

checkTable();
