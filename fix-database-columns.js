const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
});

async function addMissingColumns() {
    try {
        console.log('🔧 Adding missing terminated_at column...');

        // Check if terminated_at column exists
        const [existingColumns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'lsa_spa_management' 
            AND TABLE_NAME = 'therapists' 
            AND COLUMN_NAME = 'terminated_at'
        `);

        if (existingColumns.length === 0) {
            // Add terminated_at column only if it doesn't exist
            await db.execute(`
                ALTER TABLE therapists 
                ADD COLUMN terminated_at DATE AFTER resign_date
            `);
            console.log('✅ Successfully added terminated_at column');
        } else {
            console.log('✅ terminated_at column already exists');
        }

        // Check the updated structure
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'lsa_spa_management' 
            AND TABLE_NAME = 'therapists' 
            AND COLUMN_NAME IN ('resign_date', 'terminated_at')
            ORDER BY ORDINAL_POSITION
        `);

        console.log('\n📋 Date columns now available:');
        columns.forEach(col => {
            console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.end();
    }
}

addMissingColumns();