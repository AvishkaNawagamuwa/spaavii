const axios = require('axios');

// Test script to verify SPA status-based login functionality
async function testStatusBasedLogin() {
    console.log('🧪 Testing SPA Status-Based Login Functionality');
    console.log('='.repeat(60));

    const BASE_URL = 'http://localhost:3001';

    // Test credentials for different statuses
    const testCredentials = [
        { username: 'test_pending', password: 'test123', expectedStatus: 'pending', shouldLogin: false },
        { username: 'test_rejected', password: 'test123', expectedStatus: 'rejected', shouldLogin: true },
        { username: 'test_unverified', password: 'test123', expectedStatus: 'unverified', shouldLogin: true },
        { username: 'test_verified', password: 'test123', expectedStatus: 'verified', shouldLogin: true },
        { username: 'test_blacklisted', password: 'test123', expectedStatus: 'blacklisted', shouldLogin: false }
    ];

    console.log('🔗 Frontend URL: http://localhost:5174/login');
    console.log('🔗 Backend URL: http://localhost:3001\n');

    for (const [index, cred] of testCredentials.entries()) {
        console.log(`${index + 1}. Testing ${cred.expectedStatus.toUpperCase()} Status:`);
        console.log(`   Username: ${cred.username}`);
        console.log(`   Password: ${cred.password}`);

        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                username: cred.username,
                password: cred.password
            });

            if (response.status === 200) {
                const data = response.data;

                if (cred.shouldLogin) {
                    console.log(`   ✅ Login SUCCESSFUL (as expected)`);
                    console.log(`   📊 Status: ${data.user.spa_status}`);
                    console.log(`   🎯 Access Level: ${data.user.access_level}`);
                    console.log(`   📋 Allowed Tabs: ${data.user.allowed_tabs?.join(', ')}`);
                    console.log(`   💬 Message: ${data.user.status_message}`);

                    // Test navigation endpoint
                    if (data.user.spa_id) {
                        try {
                            const navResponse = await axios.get(`${BASE_URL}/api/auth/navigation/${data.user.spa_id}`, {
                                headers: { 'Authorization': `Bearer ${data.token}` }
                            });

                            if (navResponse.data.success) {
                                console.log(`   🧭 Navigation Items: ${navResponse.data.navigation.length} item(s)`);
                                navResponse.data.navigation.forEach(item => {
                                    console.log(`      - ${item.label}`);
                                });
                            }
                        } catch (navError) {
                            console.log(`   ⚠️  Navigation test failed: ${navError.message}`);
                        }
                    }
                } else {
                    console.log(`   ❌ Login SUCCEEDED but should have been DENIED`);
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                const data = error.response.data;

                if (!cred.shouldLogin) {
                    console.log(`   ✅ Login DENIED (as expected)`);
                    console.log(`   📊 Status: ${data.spa_status}`);
                    console.log(`   💬 Message: ${data.message}`);
                } else {
                    console.log(`   ❌ Login DENIED but should have been ALLOWED`);
                    console.log(`   💬 Message: ${data.message}`);
                }
            } else if (error.response && error.response.status === 401) {
                console.log(`   ❌ Invalid credentials`);
            } else {
                console.log(`   ❌ Network error: ${error.message}`);
            }
        }

        console.log('');
    }

    console.log('🎯 Expected Behaviors Summary:');
    console.log('=====================================');
    console.log('✅ PENDING: Should deny login with "Application Pending" message');
    console.log('✅ REJECTED: Should allow login with limited tabs (Resubmit + Profile)');
    console.log('✅ UNVERIFIED: Should allow login with payment tabs (Payment + Profile)');
    console.log('✅ VERIFIED: Should allow login with full access (all tabs except Resubmit)');
    console.log('✅ BLACKLISTED: Should deny login with "Account Suspended" message');

    console.log('\n🌐 Manual Testing:');
    console.log('==================');
    console.log('1. Open http://localhost:5174/login in your browser');
    console.log('2. Try logging in with each test credential');
    console.log('3. Verify the dashboard shows appropriate tabs based on status');
    console.log('4. Check status indicator at top of dashboard');
}

// Run the test
testStatusBasedLogin().catch(error => {
    console.error('❌ Test failed:', error.message);
});