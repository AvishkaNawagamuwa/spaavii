const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
});

async function fixWorkingHistoryForResigned() {
    try {
        console.log('🔧 Fixing working history for resigned/terminated therapists...\n');

        // Get all resigned therapists
        const [resignedTherapists] = await db.execute(`
            SELECT id, spa_id, name, first_name, last_name, working_history, resign_date
            FROM therapists 
            WHERE status = 'resigned'
        `);

        console.log(`Found ${resignedTherapists.length} resigned therapists`);

        for (const therapist of resignedTherapists) {
            const name = therapist.name || `${therapist.first_name} ${therapist.last_name}`;
            console.log(`\n📋 Fixing therapist: ${name} (ID: ${therapist.id})`);

            if (therapist.working_history && Array.isArray(therapist.working_history)) {
                // Update the current spa entry in working history
                const updatedHistory = therapist.working_history.map(entry => {
                    if (entry.spa_id === therapist.spa_id && !entry.end_date) {
                        console.log(`  - Updating working history for spa_id: ${entry.spa_id}`);
                        return {
                            ...entry,
                            end_date: therapist.resign_date || new Date().toISOString().split('T')[0],
                            status: 'resigned',
                            reason_for_leaving: 'Resigned'
                        };
                    }
                    return entry;
                });

                // Update working history in database
                await db.execute(
                    'UPDATE therapists SET working_history = ? WHERE id = ?',
                    [JSON.stringify(updatedHistory), therapist.id]
                );

                console.log(`  ✅ Updated working history`);
            } else {
                console.log(`  ⚠️ No working history or invalid format`);
            }
        }

        // Get all terminated therapists
        const [terminatedTherapists] = await db.execute(`
            SELECT id, spa_id, name, first_name, last_name, working_history, terminated_at, termination_reason
            FROM therapists 
            WHERE status = 'terminated'
        `);

        console.log(`\nFound ${terminatedTherapists.length} terminated therapists`);

        for (const therapist of terminatedTherapists) {
            const name = therapist.name || `${therapist.first_name} ${therapist.last_name}`;
            console.log(`\n📋 Fixing therapist: ${name} (ID: ${therapist.id})`);

            if (therapist.working_history && Array.isArray(therapist.working_history)) {
                // Update the current spa entry in working history
                const updatedHistory = therapist.working_history.map(entry => {
                    if (entry.spa_id === therapist.spa_id && !entry.end_date) {
                        console.log(`  - Updating working history for spa_id: ${entry.spa_id}`);
                        return {
                            ...entry,
                            end_date: therapist.terminated_at || new Date().toISOString().split('T')[0],
                            status: 'terminated',
                            reason_for_leaving: therapist.termination_reason || 'Terminated'
                        };
                    }
                    return entry;
                });

                // Update working history in database
                await db.execute(
                    'UPDATE therapists SET working_history = ? WHERE id = ?',
                    [JSON.stringify(updatedHistory), therapist.id]
                );

                console.log(`  ✅ Updated working history`);
            } else {
                console.log(`  ⚠️ No working history or invalid format`);
            }
        }

        console.log('\n🎉 Completed fixing working history!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.end();
    }
}

fixWorkingHistoryForResigned();