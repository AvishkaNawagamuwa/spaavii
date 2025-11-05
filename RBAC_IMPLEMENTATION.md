# Role-Based Access Control (RBAC) Implementation

## Overview
This implementation adds a comprehensive role-based access control system to the AdminLSA dashboard with three distinct user roles:

1. **Super Admin** - Full system access (only one account)
2. **Admin** - Access to all features except Account Management
3. **Financial Officer** - Access only to Financial tab

## Database Changes

### Updated admin_users Table
The `role` column now supports the following values:
- `super_admin` - System Super Administrator
- `admin` - Regular Administrator
- `financial_officer` - Financial Officer
- `admin_lsa` - (existing) LSA Admin
- `admin_spa` - (existing) SPA Admin
- `government_officer` - (existing) Government Officer

## Super Admin Account

**Username:** Avishka  
**Password:** Avishka@123  
**Role:** super_admin

This is the only super admin account in the system and has full access to all features.

## Access Control Matrix

| Tab / Section          | Super Admin | Admin | Financial Officer |
| ---------------------- | ----------- | ----- | ----------------- |
| Dashboard              | ✅           | ✅     | ❌                 |
| Manage Spas            | ✅           | ✅     | ❌                 |
| Manage Therapists      | ✅           | ✅     | ❌                 |
| Financial              | ✅           | ✅     | ✅                 |
| Third-Party Login      | ✅           | ✅     | ❌                 |
| Notification History   | ✅           | ✅     | ❌                 |
| Account Settings       | ✅           | ✅     | ❌                 |
| **Account Management** | ✅           | ❌     | ❌                 |

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
node migrations/add-admin-roles.js
```

This will:
- Update the admin_users table to support new roles
- Create the Super Admin account (Avishka/Avishka@123)

### 2. Start the Backend Server

```bash
cd backend
npm start
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

## Features

### Account Management Tab (Super Admin Only)

The Account Management tab allows Super Admins to:

1. **Create New Accounts**
   - Create Admin accounts
   - Create Financial Officer accounts
   - Set username, password, email, full name, and phone

2. **View All Accounts**
   - See all Admin and Financial Officer accounts
   - View account details, status, and last login
   - Filter by role
   - Search by username, name, or email

3. **Manage Accounts**
   - Activate/Deactivate accounts
   - Reset passwords
   - Delete accounts (soft delete)
   - View account statistics

4. **Statistics Dashboard**
   - Total accounts count
   - Admin count
   - Financial Officer count
   - Active/Inactive counts

### Role-Based Navigation

The navigation menu dynamically adjusts based on the user's role:

- **Super Admin**: Sees all 8 tabs including Account Management
- **Admin**: Sees 7 tabs (no Account Management)
- **Financial Officer**: Sees only the Financial tab

### Financial Officer Experience

When a Financial Officer logs in:
- Automatically redirected to the Financial tab
- Only sees the Financial tab in navigation
- Cannot access other sections

## API Endpoints

### Account Management Routes

All routes require Super Admin authentication via `admin-id` header.

#### GET /api/lsa/account-management/accounts
Get all admin and financial officer accounts

#### POST /api/lsa/account-management/create
Create new admin or financial officer account

**Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "admin|financial_officer",
  "full_name": "string",
  "phone": "string"
}
```

#### PUT /api/lsa/account-management/update/:id
Update account details

**Body:**
```json
{
  "email": "string",
  "full_name": "string",
  "phone": "string",
  "is_active": boolean
}
```

#### DELETE /api/lsa/account-management/delete/:id
Delete (soft delete) an account

#### POST /api/lsa/account-management/reset-password/:id
Reset account password

**Body:**
```json
{
  "new_password": "string"
}
```

#### GET /api/lsa/account-management/stats
Get account statistics

## Security Features

1. **Role Verification**: Middleware verifies user role before allowing access
2. **Super Admin Protection**: Cannot modify or delete super admin accounts
3. **Password Hashing**: All passwords are hashed using bcrypt
4. **Token-Based Authentication**: JWT tokens for secure sessions
5. **Soft Delete**: Accounts are deactivated rather than deleted

## Files Modified/Created

### Backend
- `backend/migrations/add-admin-roles.js` - Database migration script
- `backend/routes/accountManagementRoutes.js` - Account management API routes
- `backend/server.js` - Added account management routes
- `backend/routes/authRoutes.js` - Updated for new roles

### Frontend
- `frontend/src/pages/AdminLSA/AccountManagement.jsx` - Account Management component
- `frontend/src/pages/AdminLSA/AdminLSA.jsx` - Updated with role-based navigation

## Testing

### Test Users

After running the migration, you can test with:

1. **Super Admin**
   - Username: `Avishka`
   - Password: `Avishka@123`
   - Can access all features

2. **Create Test Accounts**
   - Login as Super Admin
   - Go to Account Management tab
   - Create Admin and Financial Officer accounts for testing

### Test Scenarios

1. **Super Admin Login**
   - Login with Avishka account
   - Verify all 8 tabs are visible
   - Create a new Admin account
   - Create a new Financial Officer account

2. **Admin Login**
   - Login with created Admin account
   - Verify only 7 tabs are visible (no Account Management)
   - Verify can access all other features

3. **Financial Officer Login**
   - Login with created Financial Officer account
   - Verify only Financial tab is visible
   - Verify cannot access other tabs

## Troubleshooting

### Migration Issues

If the migration fails:
1. Check database connection in `.env` file
2. Ensure database exists: `lsa_spa_management`
3. Check user permissions

### Login Issues

If login fails after migration:
1. Clear browser localStorage
2. Verify database migration completed successfully
3. Check console for error messages

### Role Access Issues

If roles are not working correctly:
1. Clear browser cache and localStorage
2. Verify user role is saved in localStorage after login
3. Check backend logs for authentication errors

## Future Enhancements

Potential improvements:
1. Permission granularity (e.g., read-only access)
2. Audit logging for account changes
3. Email notifications for account creation
4. Two-factor authentication
5. Session management dashboard
6. Role change history tracking

## Support

For issues or questions, please contact the development team.
