const bcrypt = require('bcrypt');

async function generateSQL() {
    console.log('\n=== Role-Based Access Control Migration SQL Generator ===\n');

    // Generate hashed password for "Avishka@123"
    const password = 'Avishka@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Generated Password Hash for "Avishka@123":');
    console.log(hashedPassword);
    console.log('\n');

    console.log('=== Copy and run these SQL commands in your MySQL client ===\n');
    console.log('-- Use the database');
    console.log('USE lsa_spa_management;\n');

    console.log('-- Step 1: Update admin_users table to support new roles');
    console.log("ALTER TABLE admin_users");
    console.log("MODIFY COLUMN role ENUM('admin_lsa', 'admin_spa', 'government_officer', 'super_admin', 'admin', 'financial_officer') NOT NULL;\n");

    console.log('-- Step 2: Create or Update Super Admin account');
    console.log(`INSERT INTO admin_users (`);
    console.log(`    username,`);
    console.log(`    email,`);
    console.log(`    password_hash,`);
    console.log(`    role,`);
    console.log(`    full_name,`);
    console.log(`    phone,`);
    console.log(`    is_active`);
    console.log(`) VALUES (`);
    console.log(`    'Avishka',`);
    console.log(`    'avishka@lsa.gov.lk',`);
    console.log(`    '${hashedPassword}',`);
    console.log(`    'super_admin',`);
    console.log(`    'Avishka Nawagamuwa',`);
    console.log(`    '+94771234567',`);
    console.log(`    1`);
    console.log(`)`);
    console.log(`ON DUPLICATE KEY UPDATE`);
    console.log(`    role = 'super_admin',`);
    console.log(`    password_hash = '${hashedPassword}';\n`);

    console.log('-- Step 3: Verify the changes');
    console.log('SELECT id, username, role, email, full_name, is_active, created_at');
    console.log('FROM admin_users');
    console.log("WHERE username = 'Avishka';\n");

    console.log('\n=== Super Admin Credentials ===');
    console.log('Username: Avishka');
    console.log('Password: Avishka@123');
    console.log('Role: super_admin');
    console.log('\n=== End of SQL commands ===\n');
}

generateSQL().catch(console.error);
