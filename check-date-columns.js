const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
});

async function checkColumns() {
    try {
        const [columns] = await db.execute('DESCRIBE therapists');
        const dateColumns = columns.filter(col =>
            col.Field.includes('resign') ||
            col.Field.includes('terminate') ||
            col.Field.includes('_at') ||
            col.Field.includes('_date')
        );

        console.log('Date-related columns in therapists table:');
        dateColumns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

checkColumns();