-- Role-Based Access Control Migration Script
-- Run this script in your MySQL client (phpMyAdmin, MySQL Workbench, or command line)

-- Use the database
USE lsa_spa_management;

-- Step 1: Update admin_users table to support new roles
ALTER TABLE admin_users 
MODIFY COLUMN role ENUM('admin_lsa', 'admin_spa', 'government_officer', 'super_admin', 'admin', 'financial_officer') NOT NULL;

-- Step 2: Create Super Admin account (Avishka/Avishka@123)
-- Password hash for "Avishka@123" using bcrypt with 10 rounds
INSERT INTO admin_users (
    username, 
    email, 
    password_hash, 
    role, 
    full_name, 
    phone, 
    is_active,
    created_at,
    updated_at
) VALUES (
    'Avishka',
    'avishka@lsa.gov.lk',
    '$2b$10$YourBcryptHashedPasswordHere', -- This will be replaced by the Node.js script
    'super_admin',
    'Avishka Nawagamuwa',
    '+94771234567',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE 
    role = 'super_admin',
    password_hash = '$2b$10$YourBcryptHashedPasswordHere';

-- Step 3: Verify the changes
SELECT id, username, role, email, full_name, is_active, created_at 
FROM admin_users 
WHERE role IN ('super_admin', 'admin', 'financial_officer')
ORDER BY created_at DESC;

-- Display role distribution
SELECT 
    role,
    COUNT(*) as count,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
FROM admin_users
GROUP BY role;
