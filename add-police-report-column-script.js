const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPoliceReportColumn() {
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
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'therapists' AND COLUMN_NAME = 'police_report_path'`,
            ['lsa_spa_management']
        );

        if (columns.length > 0) {
            console.log('ℹ️  Column police_report_path already exists in therapists table');
        } else {
            // Add the column after therapist_image
            await connection.execute(
                `ALTER TABLE therapists 
                 ADD COLUMN police_report_path VARCHAR(500) AFTER therapist_image`
            );
            console.log('✅ Successfully added police_report_path column to therapists table');
        }

        // Show the updated structure
        const [structure] = await connection.execute('DESCRIBE therapists');
        console.log('\n📋 Updated therapists table structure:');
        console.table(structure);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

addPoliceReportColumn();
