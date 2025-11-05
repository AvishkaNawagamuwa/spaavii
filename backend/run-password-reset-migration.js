const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🔄 Running password reset migration...\n');

    try {
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'migrations', 'add-password-reset.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Get connection
        const connection = await db.getConnection();

        try {
            // Execute the SQL
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                if (statement.trim()) {
                    console.log('Executing:', statement.substring(0, 80) + '...');
                    await connection.execute(statement);
                    console.log('✅ Success\n');
                }
            }

            // Verify table was created
            const [tables] = await connection.execute(
                "SHOW TABLES LIKE 'password_reset_tokens'"
            );

            if (tables.length > 0) {
                console.log('✅ Table password_reset_tokens created successfully!');

                // Show table structure
                const [columns] = await connection.execute(
                    'DESCRIBE password_reset_tokens'
                );

                console.log('\n📋 Table Structure:');
                console.log('-------------------');
                columns.forEach(col => {
                    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? col.Key : ''}`);
                });

                console.log('\n🎉 Migration completed successfully!');
            } else {
                console.log('❌ Table creation failed');
            }

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

runMigration();
