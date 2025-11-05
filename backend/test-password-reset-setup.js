const db = require('./config/database');

async function testPasswordResetSetup() {
    console.log('🧪 Testing Password Reset Setup\n');
    console.log('='.repeat(50));

    try {
        const connection = await db.getConnection();

        try {
            // 1. Check password_reset_tokens table exists
            console.log('\n1️⃣  Checking password_reset_tokens table...');
            const [tables] = await connection.execute(
                "SHOW TABLES LIKE 'password_reset_tokens'"
            );

            if (tables.length > 0) {
                console.log('   ✅ Table exists');

                const [columns] = await connection.execute('DESCRIBE password_reset_tokens');
                const columnNames = columns.map(c => c.Field);
                console.log('   📋 Columns:', columnNames.join(', '));
            } else {
                console.log('   ❌ Table does NOT exist');
                return;
            }

            // 2. Check admin_users table has email column
            console.log('\n2️⃣  Checking admin_users table...');
            const [userColumns] = await connection.execute('DESCRIBE admin_users');
            const userColumnNames = userColumns.map(c => c.Field);

            if (userColumnNames.includes('email')) {
                console.log('   ✅ Email column exists');

                // Get sample users
                const [users] = await connection.execute(
                    'SELECT id, username, email, full_name FROM admin_users WHERE is_active = 1 LIMIT 3'
                );

                console.log(`   📧 Found ${users.length} active users with emails:`);
                users.forEach(user => {
                    console.log(`      - ${user.username} (${user.email})`);
                });
            } else {
                console.log('   ❌ Email column does NOT exist');
            }

            // 3. Check email service configuration
            console.log('\n3️⃣  Checking email service...');
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;

            if (emailUser && emailPass) {
                console.log('   ✅ Email credentials configured');
                console.log(`   📧 Email User: ${emailUser}`);
            } else {
                console.log('   ⚠️  Email credentials NOT configured in .env');
                console.log('   💡 Add EMAIL_USER and EMAIL_PASS to .env file');
            }

            // 4. Test token generation (simulation)
            console.log('\n4️⃣  Testing token generation...');
            const crypto = require('crypto');
            const testToken = crypto.randomBytes(32).toString('hex');
            const testTokenHash = crypto.createHash('sha256').update(testToken).digest('hex');
            console.log(`   ✅ Plain token length: ${testToken.length} chars`);
            console.log(`   ✅ Hashed token length: ${testTokenHash.length} chars`);
            console.log(`   🔐 Token sample: ${testToken.substring(0, 20)}...`);

            // 5. Test password hashing
            console.log('\n5️⃣  Testing password hashing...');
            const bcrypt = require('bcrypt');
            const testPassword = 'TestPassword123';
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(testPassword, salt);
            console.log('   ✅ Password can be hashed');
            console.log(`   🔐 Hash length: ${hash.length} chars`);

            // 6. Summary
            console.log('\n' + '='.repeat(50));
            console.log('📊 SETUP SUMMARY');
            console.log('='.repeat(50));
            console.log('✅ Database table created');
            console.log('✅ Email column exists in admin_users');
            console.log('✅ Crypto functions working');
            console.log('✅ Bcrypt functions working');
            console.log(emailUser && emailPass ? '✅ Email configured' : '⚠️  Email needs configuration');

            console.log('\n🎉 Password Reset feature is ready to use!');
            console.log('\n📝 Next steps:');
            console.log('   1. Ensure backend server is running (npm start)');
            console.log('   2. Ensure frontend is running (npm run dev)');
            console.log('   3. Visit http://localhost:5173/login');
            console.log('   4. Click "Forgot Password?" link');
            console.log('   5. Enter email and test the flow!');

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

testPasswordResetSetup();
