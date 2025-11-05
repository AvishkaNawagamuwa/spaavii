# 🚀 Role-Based Access Control - Quick Start Guide

## ✨ What Was Implemented

A complete role-based access control system has been added to your AdminLSA dashboard with three user roles:

### 👥 User Roles

1. **Super Admin** (Avishka)
   - ✅ Full system access
   - ✅ Can create Admin and Financial Officer accounts
   - ✅ Access to ALL tabs including Account Management
   - ⚠️ Only ONE Super Admin in the system

2. **Admin**
   - ✅ Access to all features EXCEPT Account Management
   - ✅ Cannot create new admin accounts
   - ✅ Can manage SPAs, therapists, financials, etc.

3. **Financial Officer**
   - ✅ Access ONLY to Financial tab
   - ❌ Cannot access other features

## 🔧 Setup Instructions

### Step 1: Run SQL Commands

**You need to run the SQL commands in your MySQL database.** Since the automatic migration couldn't connect, here's the manual approach:

#### Option A: Using phpMyAdmin
1. Open phpMyAdmin
2. Select the `lsa_spa_management` database
3. Go to the SQL tab
4. Copy and paste the following SQL:

```sql
USE lsa_spa_management;

-- Update admin_users table to support new roles
ALTER TABLE admin_users
MODIFY COLUMN role ENUM('admin_lsa', 'admin_spa', 'government_officer', 'super_admin', 'admin', 'financial_officer') NOT NULL;

-- Create Super Admin account
INSERT INTO admin_users (
    username,
    email,
    password_hash,
    role,
    full_name,
    phone,
    is_active
) VALUES (
    'Avishka',
    'avishka@lsa.gov.lk',
    '$2b$10$./sw/N6yzvGt84v.Lgk8ieLpWO/vvy6PPTd9OO/7p6g6h9JO7moim',
    'super_admin',
    'Avishka Nawagamuwa',
    '+94771234567',
    1
)
ON DUPLICATE KEY UPDATE
    role = 'super_admin',
    password_hash = '$2b$10$./sw/N6yzvGt84v.Lgk8ieLpWO/vvy6PPTd9OO/7p6g6h9JO7moim';

-- Verify the changes
SELECT id, username, role, email, full_name, is_active, created_at
FROM admin_users
WHERE username = 'Avishka';
```

4. Click "Go" to execute

#### Option B: Using MySQL Command Line
```bash
mysql -u root -p lsa_spa_management

# Then paste the SQL commands above
```

#### Option C: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open a new SQL tab
4. Paste the SQL commands
5. Execute

### Step 2: Verify Database Changes

After running the SQL, verify the Super Admin account was created:

```sql
SELECT id, username, role, email, full_name, is_active 
FROM admin_users 
WHERE username = 'Avishka';
```

You should see:
- Username: Avishka
- Role: super_admin
- Email: avishka@lsa.gov.lk
- Is Active: 1

### Step 3: Start Your Application

#### Start Backend
```bash
cd backend
npm start
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

## 🎯 Testing the Implementation

### Test 1: Super Admin Login

1. Go to login page
2. Enter credentials:
   - **Username:** `Avishka`
   - **Password:** `Avishka@123`
3. You should see ALL 8 tabs:
   - Dashboard
   - Manage Spas
   - Manage Therapists
   - Financial
   - Third-Party Login
   - Notification History
   - Account Settings
   - **Account Management** ⭐ (NEW!)

### Test 2: Create Admin Account

1. Login as Super Admin (Avishka)
2. Click on "Account Management" tab
3. Click "Create Account" button
4. Fill in the form:
   - Username: `testadmin`
   - Password: `Admin@123`
   - Role: Select "Admin"
   - Full Name: `Test Admin`
   - Email: `testadmin@lsa.gov.lk`
   - Phone: `+94771234568`
5. Click "Create Account"
6. You should see success message

### Test 3: Create Financial Officer Account

1. Still logged in as Super Admin
2. In Account Management tab
3. Click "Create Account" button
4. Fill in the form:
   - Username: `financeofficer`
   - Password: `Finance@123`
   - Role: Select "Financial Officer"
   - Full Name: `Finance Officer`
   - Email: `finance@lsa.gov.lk`
   - Phone: `+94771234569`
5. Click "Create Account"

### Test 4: Test Admin Login

1. Logout from Super Admin
2. Login with:
   - Username: `testadmin`
   - Password: `Admin@123`
3. Verify you see 7 tabs (NO Account Management tab)
4. Try to access all other features - should work fine

### Test 5: Test Financial Officer Login

1. Logout
2. Login with:
   - Username: `financeofficer`
   - Password: `Finance@123`
3. Verify you see ONLY the Financial tab
4. Should automatically be on Financial page
5. Other tabs should not be visible in navigation

## 📊 Account Management Features

When logged in as Super Admin, the Account Management tab allows you to:

### View Statistics
- Total Accounts
- Number of Admins
- Number of Financial Officers
- Active/Inactive counts

### Account Actions
1. **Create** - Create new Admin or Financial Officer accounts
2. **Activate/Deactivate** - Enable or disable accounts
3. **Reset Password** - Change password for any account
4. **Delete** - Soft delete accounts (sets inactive)

### Search & Filter
- Search by username, name, or email
- Filter by role (All, Admin, Financial Officer)

## 🔒 Security Features

✅ **Password Hashing** - All passwords encrypted with bcrypt  
✅ **Role Verification** - Middleware checks permissions  
✅ **Super Admin Protection** - Cannot delete or modify super admin  
✅ **Soft Delete** - Accounts deactivated, not permanently deleted  
✅ **JWT Authentication** - Secure token-based sessions  

## 📁 Files Created/Modified

### Backend Files
- ✅ `backend/migrations/add-admin-roles.js` - Database migration
- ✅ `backend/migrations/generate-sql.js` - SQL generator
- ✅ `backend/migrations/add-admin-roles.sql` - Manual SQL script
- ✅ `backend/routes/accountManagementRoutes.js` - Account API routes
- ✅ `backend/server.js` - Added account routes
- ✅ `backend/routes/authRoutes.js` - Updated for new roles

### Frontend Files
- ✅ `frontend/src/pages/AdminLSA/AccountManagement.jsx` - New component
- ✅ `frontend/src/pages/AdminLSA/AdminLSA.jsx` - Role-based navigation

### Documentation
- ✅ `RBAC_IMPLEMENTATION.md` - Full technical documentation
- ✅ `QUICK_START_GUIDE.md` - This file

## 🐛 Troubleshooting

### Issue: SQL commands won't execute
**Solution:** Make sure you selected the correct database (`lsa_spa_management`) before running the ALTER TABLE command.

### Issue: Can't login with Avishka account
**Solution:** 
1. Verify the account was created:
   ```sql
   SELECT * FROM admin_users WHERE username = 'Avishka';
   ```
2. If not found, run the INSERT statement again
3. Clear browser localStorage and try again

### Issue: Account Management tab not showing
**Solution:**
1. Clear browser cache and localStorage
2. Login again as Super Admin
3. Check browser console for errors

### Issue: Role-based navigation not working
**Solution:**
1. Open browser DevTools > Application > Local Storage
2. Check if 'user' object has correct 'role' property
3. If not, logout and login again

### Issue: Cannot create accounts (403 error)
**Solution:**
1. Make sure you're logged in as Super Admin
2. Check that the 'admin-id' header is being sent
3. Verify user.id is stored in localStorage

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Check backend terminal for error messages
3. Review the `RBAC_IMPLEMENTATION.md` for detailed API documentation
4. Verify database connection settings in `.env` file

## 🎉 Success Checklist

- [ ] SQL commands executed successfully
- [ ] Super Admin account created (Avishka/Avishka@123)
- [ ] Backend server running without errors
- [ ] Frontend running without errors
- [ ] Super Admin can login and see 8 tabs
- [ ] Account Management tab is accessible
- [ ] Can create Admin accounts
- [ ] Can create Financial Officer accounts
- [ ] Admin login works with 7 tabs visible
- [ ] Financial Officer login works with only Financial tab
- [ ] All account management features work (create, delete, reset password)

## 🚀 You're All Set!

Your role-based access control system is now ready to use. Start by logging in as Super Admin (Avishka/Avishka@123) and creating your team accounts!

---

**Remember:** 
- Only ONE Super Admin exists (Avishka)
- Admins cannot create other accounts
- Financial Officers only see Financial tab
- All passwords are securely hashed
- Account deletions are soft deletes (can be recovered)
