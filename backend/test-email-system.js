const { sendRegistrationEmail, sendStatusUpdateEmail, testEmailConnection } = require('./utils/emailService');
require('dotenv').config();

async function testEmailSystem() {
    console.log('🧪 Testing Email System for SPA Registration...\n');

    // Test 1: Email connection
    console.log('1️⃣ Testing email server connection...');
    const connectionTest = await testEmailConnection();
    if (!connectionTest) {
        console.error('❌ Email connection failed. Please check your credentials.');
        return;
    }
    console.log('✅ Email connection successful!\n');

    // Test 2: Registration email
    console.log('2️⃣ Testing registration email...');
    const testEmail = 'yasiru2000@gmail.com'; // Using the email from your example
    const registrationResult = await sendRegistrationEmail(
        testEmail,
        'John Doe',
        'Test Luxury Spa',
        'testuser123',
        'securepass456',
        'LSA0001'
    );

    if (registrationResult.success) {
        console.log('✅ Registration email sent successfully!');
        console.log('📧 Message ID:', registrationResult.messageId);
    } else {
        console.error('❌ Registration email failed:', registrationResult.error);
    }
    console.log('');

    // Test 3: Approval email
    console.log('3️⃣ Testing approval email...');
    const approvalResult = await sendStatusUpdateEmail(
        testEmail,
        'John Doe',
        'Test Luxury Spa',
        'approved',
        'testuser123',
        'securepass456',
        'Your spa meets all our requirements'
    );

    if (approvalResult.success) {
        console.log('✅ Approval email sent successfully!');
        console.log('📧 Message ID:', approvalResult.messageId);
    } else {
        console.error('❌ Approval email failed:', approvalResult.error);
    }
    console.log('');

    // Test 4: Rejection email
    console.log('4️⃣ Testing rejection email...');
    const rejectionResult = await sendStatusUpdateEmail(
        testEmail,
        'John Doe',
        'Test Luxury Spa',
        'rejected',
        'testuser123',
        'securepass456',
        'Missing required documentation'
    );

    if (rejectionResult.success) {
        console.log('✅ Rejection email sent successfully!');
        console.log('📧 Message ID:', rejectionResult.messageId);
    } else {
        console.error('❌ Rejection email failed:', rejectionResult.error);
    }

    console.log('\n🎉 Email system testing completed!');
    console.log('\n📧 Email Configuration:');
    console.log('   From:', process.env.EMAIL_USER);
    console.log('   Service: Gmail');
    console.log('   Status: Ready for production');
}

// Run the test
testEmailSystem().catch(console.error);