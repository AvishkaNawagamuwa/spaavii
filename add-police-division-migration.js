const mysql = require('mysql2/promise');

async function addPoliceDivisionColumn() {
    let connection;

    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('✅ Connected to database');

        // Check if column already exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'lsa_spa_management' 
            AND TABLE_NAME = 'spas' 
            AND COLUMN_NAME = 'police_division'
        `);

        if (columns.length > 0) {
            console.log('ℹ️  Column "police_division" already exists in spas table');
        } else {
            // Add the column
            await connection.execute(`
                ALTER TABLE spas 
                ADD COLUMN police_division VARCHAR(100) AFTER address
            `);
            console.log('✅ Successfully added "police_division" column to spas table');
        }

        // Verify the structure
        const [structure] = await connection.execute('DESCRIBE spas');
        console.log('\n📋 Current spas table structure:');
        structure.forEach(col => {
            if (col.Field === 'police_division') {
                console.log(`  ✨ ${col.Field} - ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
            } else {
                console.log(`   ${col.Field} - ${col.Type}`);
            }
        });

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the migration
addPoliceDivisionColumn();
