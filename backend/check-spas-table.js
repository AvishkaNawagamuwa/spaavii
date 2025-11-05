const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSpasTable() {
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
        const [columns] = await connection.execute('DESCRIBE spas');

        console.log('📋 SPAs Table Structure:');
        console.log('========================');
        columns.forEach(col => {
            console.log(`${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkSpasTable();
