const mysql = require('mysql2/promise');

// Test script to verify SPA status-based login functionality
async function testSpaStatusLogin() {
    let connection;

    try {
        // Database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678',
            database: 'lsa_spa_management'
        });

        console.log('🔍 Testing SPA Status-Based Login Management');
        console.log('='.repeat(60));

        // Check current spa statuses
        const [spas] = await connection.execute(`
            SELECT 
                s.id,
                s.name,
                s.status,
                s.owner_fname,
                s.owner_lname,
                s.email,
                au.username,
                au.email as admin_email,
                au.role
            FROM spas s
            LEFT JOIN admin_users au ON au.spa_id = s.id
            ORDER BY s.id
        `);

        console.log(`📊 Found ${spas.length} spas in database:\n`);

        spas.forEach((spa, index) => {
            console.log(`${index + 1}. ${spa.name}`);
            console.log(`   ID: ${spa.id}`);
            console.log(`   Status: ${spa.status}`);
            console.log(`   Owner: ${spa.owner_fname} ${spa.owner_lname}`);
            console.log(`   Owner Email: ${spa.email}`);
            console.log(`   Admin Username: ${spa.username || 'Not set'}`);
            console.log(`   Admin Email: ${spa.admin_email || 'Not set'}`);
            console.log(`   Role: ${spa.role || 'Not set'}`);
            console.log('');
        });

        // Test different status scenarios
        console.log('\n🧪 Testing Status Scenarios:');
        console.log('='.repeat(40));

        const testStatuses = [
            { status: 'pending', description: 'Should deny login with pending message' },
            { status: 'rejected', description: 'Should allow login with limited access (resubmit + profile only)' },
            { status: 'unverified', description: 'Should allow login with payment access (payment + profile only)' },
            { status: 'verified', description: 'Should allow full access to all features' },
            { status: 'blacklisted', description: 'Should deny login with blacklist message' }
        ];

        for (const testStatus of testStatuses) {
            console.log(`\n📝 Status: ${testStatus.status.toUpperCase()}`);
            console.log(`   Expected: ${testStatus.description}`);

            // Count spas with this status
            const [statusCount] = await connection.execute(
                'SELECT COUNT(*) as count FROM spas WHERE status = ?',
                [testStatus.status]
            );

            console.log(`   Current count: ${statusCount[0].count} spa(s)`);
        }

        // Create test data if needed
        console.log('\n🔧 Creating Test Data:');
        console.log('='.repeat(30));

        const testSpaData = [
            {
                name: 'Test Pending Spa',
                status: 'pending',
                username: 'test_pending',
                password: 'test123'
            },
            {
                name: 'Test Rejected Spa',
                status: 'rejected',
                username: 'test_rejected',
                password: 'test123'
            },
            {
                name: 'Test Unverified Spa',
                status: 'unverified',
                username: 'test_unverified',
                password: 'test123'
            },
            {
                name: 'Test Verified Spa',
                status: 'verified',
                username: 'test_verified',
                password: 'test123'
            },
            {
                name: 'Test Blacklisted Spa',
                status: 'blacklisted',
                username: 'test_blacklisted',
                password: 'test123'
            }
        ];

        for (const testSpa of testSpaData) {
            // Check if spa already exists
            const [existingSpa] = await connection.execute(
                'SELECT id FROM spas WHERE name = ?',
                [testSpa.name]
            );

            let spaId;

            if (existingSpa.length === 0) {
                // Create new spa
                const [spaResult] = await connection.execute(`
                    INSERT INTO spas (
                        name, reference_number, phone, 
                        owner_fname, owner_lname, email,
                        address, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    testSpa.name,
                    `T${Math.floor(Math.random() * 10000)}`,
                    '+94771234567',
                    'Test',
                    'Owner',
                    `${testSpa.username}@test.com`,
                    'Test Address',
                    testSpa.status
                ]);

                spaId = spaResult.insertId;
                console.log(`✅ Created spa: ${testSpa.name} (ID: ${spaId})`);
            } else {
                spaId = existingSpa[0].id;

                // Update status
                await connection.execute(
                    'UPDATE spas SET status = ? WHERE id = ?',
                    [testSpa.status, spaId]
                );
                console.log(`🔄 Updated spa: ${testSpa.name} (ID: ${spaId}) status to ${testSpa.status}`);
            }

            // Check if admin user exists
            const [existingUser] = await connection.execute(
                'SELECT id FROM admin_users WHERE username = ?',
                [testSpa.username]
            );

            if (existingUser.length === 0) {
                // Create admin user for the spa
                await connection.execute(`
                    INSERT INTO admin_users (
                        username, email, password_hash, role, spa_id, full_name, phone, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    testSpa.username,
                    `${testSpa.username}@test.com`,
                    testSpa.password, // Using plain text for testing
                    'admin_spa',
                    spaId,
                    `${testSpa.name} Admin`,
                    '+94771234567',
                    1
                ]);

                console.log(`✅ Created admin user: ${testSpa.username}`);
            } else {
                // Update existing user
                await connection.execute(`
                    UPDATE admin_users 
                    SET password_hash = ?, spa_id = ?, is_active = 1 
                    WHERE username = ?
                `, [testSpa.password, spaId, testSpa.username]);

                console.log(`🔄 Updated admin user: ${testSpa.username}`);
            }
        }

        console.log('\n🎉 Test data setup completed!');
        console.log('\n📝 Test Credentials:');
        console.log('='.repeat(30));

        testSpaData.forEach((spa, index) => {
            console.log(`${index + 1}. ${spa.status.toUpperCase()} Status:`);
            console.log(`   Username: ${spa.username}`);
            console.log(`   Password: ${spa.password}`);
            console.log(`   Login URL: http://localhost:5173/login`);
            console.log('');
        });

        console.log('🧪 Testing Instructions:');
        console.log('1. Go to http://localhost:5173/login');
        console.log('2. Try logging in with each test credential above');
        console.log('3. Verify the expected behavior for each status');
        console.log('');
        console.log('Expected Behaviors:');
        console.log('- PENDING: Should show "Application Pending" message and deny login');
        console.log('- REJECTED: Should login but only show "Resubmit Application" and "Spa Profile" tabs');
        console.log('- UNVERIFIED: Should login but only show "Payment Plans" and "Spa Profile" tabs');
        console.log('- VERIFIED: Should login with full access to all tabs');
        console.log('- BLACKLISTED: Should show "Account Suspended" message and deny login');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testSpaStatusLogin();