const mysql = require('mysql2/promise');

async function checkTableStructure() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('✅ Connected to database');

        // Show current structure
        const [structure] = await connection.execute('DESCRIBE therapists');
        console.log('\n📋 Current therapists table structure:');
        console.table(structure);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTableStructure();
