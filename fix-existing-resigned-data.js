const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
});

async function fixExistingResignedTherapists() {
    try {
        console.log('🔧 Fixing existing resigned therapists...\n');

        // Get all resigned therapists without resign_date
        const [resignedTherapists] = await db.execute(`
            SELECT id, spa_id, name, first_name, last_name, working_history
            FROM therapists 
            WHERE status = 'resigned' AND resign_date IS NULL
        `);

        console.log(`Found ${resignedTherapists.length} resigned therapists without resign_date`);

        for (const therapist of resignedTherapists) {
            console.log(`\n📋 Fixing therapist: ${therapist.name || `${therapist.first_name} ${therapist.last_name}`} (ID: ${therapist.id})`);

            // Set resign_date to today (since we don't have the actual date)
            const currentDate = new Date().toISOString().split('T')[0];

            await db.execute(
                'UPDATE therapists SET resign_date = ? WHERE id = ?',
                [currentDate, therapist.id]
            );

            // Update working history if it exists
            if (therapist.working_history) {
                try {
                    const workingHistory = JSON.parse(therapist.working_history);

                    // Update the current spa entry in working history
                    const updatedHistory = workingHistory.map(entry => {
                        if (entry.spa_id === therapist.spa_id && !entry.end_date) {
                            console.log(`  - Updating working history for spa_id: ${entry.spa_id}`);
                            return {
                                ...entry,
                                end_date: currentDate,
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

                    console.log(`  ✅ Updated working history and resign_date`);
                } catch (e) {
                    console.log(`  ⚠️ Error parsing working history:`, e.message);
                    // Just update the resign_date
                    console.log(`  ✅ Updated resign_date only`);
                }
            } else {
                console.log(`  ✅ Updated resign_date (no working history)`);
            }
        }

        // Also fix terminated therapists
        const [terminatedTherapists] = await db.execute(`
            SELECT id, spa_id, name, first_name, last_name, working_history, termination_reason
            FROM therapists 
            WHERE status = 'terminated' AND terminated_at IS NULL
        `);

        console.log(`\nFound ${terminatedTherapists.length} terminated therapists without terminated_at`);

        for (const therapist of terminatedTherapists) {
            console.log(`\n📋 Fixing therapist: ${therapist.name || `${therapist.first_name} ${therapist.last_name}`} (ID: ${therapist.id})`);

            // Set terminated_at to today (since we don't have the actual date)
            const currentDate = new Date().toISOString().split('T')[0];

            await db.execute(
                'UPDATE therapists SET terminated_at = ? WHERE id = ?',
                [currentDate, therapist.id]
            );

            // Update working history if it exists
            if (therapist.working_history) {
                try {
                    const workingHistory = JSON.parse(therapist.working_history);

                    // Update the current spa entry in working history
                    const updatedHistory = workingHistory.map(entry => {
                        if (entry.spa_id === therapist.spa_id && !entry.end_date) {
                            console.log(`  - Updating working history for spa_id: ${entry.spa_id}`);
                            return {
                                ...entry,
                                end_date: currentDate,
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

                    console.log(`  ✅ Updated working history and terminated_at`);
                } catch (e) {
                    console.log(`  ⚠️ Error parsing working history:`, e.message);
                    console.log(`  ✅ Updated terminated_at only`);
                }
            } else {
                console.log(`  ✅ Updated terminated_at (no working history)`);
            }
        }

        console.log('\n🎉 Completed fixing existing therapist data!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.end();
    }
}

fixExistingResignedTherapists();