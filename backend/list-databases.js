const mysql = require('mysql2/promise');
require('dotenv').config();

async function listDatabases() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connected to MySQL server\n');

        const [databases] = await connection.execute('SHOW DATABASES');

        console.log('📊 Available Databases:');
        console.log('========================');
        databases.forEach(db => {
            console.log(`- ${db.Database}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

listDatabases();
