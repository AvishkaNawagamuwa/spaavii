const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Middleware to verify Super Admin or Admin role
const verifySuperAdminOrAdmin = async (req, res, next) => {
    try {
        const adminId = req.headers['admin-id'];

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Admin ID required'
            });
        }

        const [admin] = await db.execute(
            'SELECT id, username, role FROM admin_users WHERE id = ? AND is_active = 1',
            [adminId]
        );

        if (admin.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Invalid admin'
            });
        }

        if (!['super_admin', 'admin'].includes(admin[0].role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - Insufficient permissions'
            });
        }

        req.adminUser = admin[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Middleware to verify Super Admin only
const verifySuperAdmin = async (req, res, next) => {
    try {
        const adminId = req.headers['admin-id'];

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Admin ID required'
            });
        }

        const [admin] = await db.execute(
            'SELECT id, username, role FROM admin_users WHERE id = ? AND is_active = 1',
            [adminId]
        );

        if (admin.length === 0 || admin[0].role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - Super Admin access required'
            });
        }

        req.adminUser = admin[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * @route   GET /api/lsa/account-management/accounts
 * @desc    Get all admin and financial officer accounts (Super Admin only)
 * @access  Super Admin only
 */
router.get('/accounts', verifySuperAdmin, async (req, res) => {
    try {
        const [accounts] = await db.execute(`
            SELECT 
                id,
                username,
                email,
                role,
                full_name,
                phone,
                is_active,
                created_at,
                last_login
            FROM admin_users
            WHERE role IN ('admin', 'financial_officer')
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: accounts
        });

    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch accounts',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/lsa/account-management/create
 * @desc    Create new admin or financial officer account (Super Admin only)
 * @access  Super Admin only
 */
router.post('/create', verifySuperAdmin, async (req, res) => {
    try {
        const { username, password, email, role, full_name, phone } = req.body;

        // Validate required fields
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and role are required'
            });
        }

        // Validate role
        if (!['admin', 'financial_officer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either admin or financial_officer'
            });
        }

        // Check if username already exists
        const [existing] = await db.execute(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email already exists (if provided)
        if (email) {
            const [existingEmail] = await db.execute(
                'SELECT id FROM admin_users WHERE email = ?',
                [email]
            );

            if (existingEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create account
        const [result] = await db.execute(`
            INSERT INTO admin_users (
                username,
                email,
                password_hash,
                role,
                full_name,
                phone,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [
            username,
            email || `${username}@lsa.gov.lk`,
            hashedPassword,
            role,
            full_name || username,
            phone || ''
        ]);

        res.json({
            success: true,
            message: `${role === 'admin' ? 'Admin' : 'Financial Officer'} account created successfully`,
            data: {
                id: result.insertId,
                username,
                role
            }
        });

    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/lsa/account-management/update/:id
 * @desc    Update admin or financial officer account (Super Admin only)
 * @access  Super Admin only
 */
router.put('/update/:id', verifySuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, full_name, phone, is_active } = req.body;

        // Check if account exists and is not super_admin
        const [account] = await db.execute(
            'SELECT id, role FROM admin_users WHERE id = ?',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account[0].role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify super admin account'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(full_name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        await db.execute(
            `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Account updated successfully'
        });

    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update account',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/lsa/account-management/delete/:id
 * @desc    Delete admin or financial officer account (Super Admin only)
 * @access  Super Admin only
 */
router.delete('/delete/:id', verifySuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if account exists and is not super_admin
        const [account] = await db.execute(
            'SELECT id, role, username FROM admin_users WHERE id = ?',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account[0].role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete super admin account'
            });
        }

        // Soft delete by setting is_active to 0
        await db.execute(
            'UPDATE admin_users SET is_active = 0 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/lsa/account-management/reset-password/:id
 * @desc    Reset password for admin or financial officer (Super Admin only)
 * @access  Super Admin only
 */
router.post('/reset-password/:id', verifySuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        // Check if account exists and is not super_admin
        const [account] = await db.execute(
            'SELECT id, role FROM admin_users WHERE id = ?',
            [id]
        );

        if (account.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account[0].role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot reset super admin password'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.execute(
            'UPDATE admin_users SET password_hash = ? WHERE id = ?',
            [hashedPassword, id]
        );

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/lsa/account-management/stats
 * @desc    Get account statistics (Super Admin only)
 * @access  Super Admin only
 */
router.get('/stats', verifySuperAdmin, async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_accounts,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'financial_officer' THEN 1 ELSE 0 END) as financial_officer_count,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_count
            FROM admin_users
            WHERE role IN ('admin', 'financial_officer')
        `);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

module.exports = router;
