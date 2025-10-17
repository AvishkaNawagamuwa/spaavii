const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkWorkingHistory() {
    try {
        console.log('🔍 Checking working history data...\n');

        // Get therapists with working history
        const [therapists] = await db.execute(`
            SELECT 
                id, 
                name, 
                first_name, 
                last_name, 
                working_history, 
                resign_date, 
                resignation_reason,
                termination_reason,
                status,
                spa_id,
                created_at
            FROM therapists 
            ORDER BY id DESC 
            LIMIT 10
        `);

        therapists.forEach((therapist, index) => {
            console.log(`${index + 1}. ID: ${therapist.id}, Name: ${therapist.name || `${therapist.first_name} ${therapist.last_name}`}`);
            console.log(`   Status: ${therapist.status}`);
            console.log(`   Current SPA ID: ${therapist.spa_id}`);
            console.log(`   Registration: ${therapist.created_at}`);
            console.log(`   Resign Date: ${therapist.resign_date || 'N/A'}`);
            console.log(`   Resignation Reason: ${therapist.resignation_reason || 'N/A'}`);
            console.log(`   Termination Reason: ${therapist.termination_reason || 'N/A'}`);

            if (therapist.working_history) {
                try {
                    const history = JSON.parse(therapist.working_history);
                    console.log(`   Working History:`, JSON.stringify(history, null, 2));
                } catch (e) {
                    console.log(`   Working History (raw):`, therapist.working_history);
                }
            } else {
                console.log(`   Working History: NULL`);
            }
            console.log('   ' + '-'.repeat(80));
        });

        // Check if any therapists have proper working history structure
        const [historyCheck] = await db.execute(`
            SELECT 
                COUNT(*) as total_therapists,
                COUNT(working_history) as has_working_history,
                COUNT(resign_date) as has_resign_date
            FROM therapists
        `);

        console.log('\n📊 Summary:');
        console.log(`Total Therapists: ${historyCheck[0].total_therapists}`);
        console.log(`With Working History: ${historyCheck[0].has_working_history}`);
        console.log(`With Resign Date: ${historyCheck[0].has_resign_date}`);

    } catch (error) {
        console.error('❌ Error checking working history:', error);
    } finally {
        await db.end();
    }
}

checkWorkingHistory();