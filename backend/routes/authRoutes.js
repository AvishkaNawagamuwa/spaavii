const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { getSpaStatusAndAccess } = require('../utils/spaStatusChecker');
const router = express.Router();

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username/Email and password are required'
            });
        }

        console.log('Login attempt for username/email:', username);

        // Get database connection
        const connection = await db.getConnection();

        try {
            // Query admin_users table for the user - including new admin roles
            // Check both username and email fields
            const [rows] = await connection.execute(
                'SELECT id, username, email, password_hash, role, full_name, phone, spa_id, is_active, last_login FROM admin_users WHERE (username = ? OR email = ?) AND is_active = 1',
                [username, username]
            );

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username/email or password'
                });
            }

            const user = rows[0];
            console.log('User found:', { id: user.id, username: user.username, role: user.role });
            console.log('Stored password hash:', user.password_hash);
            console.log('Provided password:', password);

            // For development/testing, allow simple password comparison
            // In production, you should hash passwords properly
            let isPasswordValid = false;

            // Check if password_hash starts with $2b$ (bcrypt format)
            if (user.password_hash.startsWith('$2b$')) {
                // This is a bcrypt hash, use bcrypt.compare
                try {
                    isPasswordValid = await bcrypt.compare(password, user.password_hash);
                    console.log('Bcrypt comparison result:', isPasswordValid);
                } catch (bcryptError) {
                    console.log('Bcrypt comparison failed:', bcryptError.message);
                    isPasswordValid = false;
                }
            } else {
                // This is plain text password (for development)
                isPasswordValid = (password === user.password_hash);
                console.log('Plain text comparison result:', isPasswordValid);
            }

            if (!isPasswordValid) {
                console.log('Password validation failed for user:', username);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            console.log('Login successful for user:', username);

            // For admin_spa role, check spa status before allowing login
            if (user.role === 'admin_spa' && user.spa_id) {
                console.log('Checking spa status for spa_id:', user.spa_id);

                const spaStatusCheck = await getSpaStatusAndAccess(user.spa_id);

                if (!spaStatusCheck.success) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error checking spa status'
                    });
                }

                if (!spaStatusCheck.canLogin) {
                    let statusMessage = spaStatusCheck.statusMessage;

                    // Customize message based on status
                    if (spaStatusCheck.spa.status === 'pending') {
                        statusMessage = 'Your spa registration is pending approval. Please wait for LSA verification.';
                    } else if (spaStatusCheck.spa.status === 'blacklisted') {
                        statusMessage = 'Your account has been suspended by the admin panel. Please contact LSA administration.';
                    }

                    return res.status(403).json({
                        success: false,
                        message: statusMessage,
                        spa_status: spaStatusCheck.spa.status,
                        access_denied: true
                    });
                }

                // Add spa status info to user object for frontend
                user.spa_status = spaStatusCheck.spa.status;
                user.access_level = spaStatusCheck.accessLevel;
                user.allowed_tabs = spaStatusCheck.allowedTabs;
                user.status_message = spaStatusCheck.statusMessage;
            }

            // Update last login time
            await connection.execute(
                'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id]
            );

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    spa_id: user.spa_id
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove password_hash from user object before sending
            delete user.password_hash;

            res.json({
                success: true,
                message: 'Login successful',
                user: user,
                token: token
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Test endpoint to verify server is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working!',
        timestamp: new Date().toISOString()
    });
});

// Logout endpoint (optional - mainly for token invalidation on client side)
router.post('/logout', (req, res) => {
    // In a real application, you might want to blacklist the token
    // For now, just return success - client should remove token
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Forgot Password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Password reset request for email:', email);

        // Get database connection
        const connection = await db.getConnection();

        try {
            // Check if user exists with this email
            const [rows] = await connection.execute(
                'SELECT id, username, email, full_name FROM admin_users WHERE email = ? AND is_active = 1',
                [email]
            );

            if (rows.length === 0) {
                // For security reasons, don't reveal if email exists or not
                return res.json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            }

            const user = rows[0];
            console.log('User found for password reset:', { id: user.id, email: user.email });

            // Generate reset token (random string)
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            // Set expiry time (1 hour from now)
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            // Store reset token in database
            await connection.execute(
                'INSERT INTO password_reset_tokens (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
                [user.id, user.email, tokenHash, expiresAt]
            );

            // Send email with reset link
            const { sendPasswordResetEmail } = require('../utils/emailService');
            const emailResult = await sendPasswordResetEmail(user.email, user.full_name, resetToken);

            if (emailResult.success) {
                res.json({
                    success: true,
                    message: 'Password reset email sent successfully'
                });
            } else {
                // Even if email fails, don't reveal it for security
                res.json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            }

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Reset Password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate input
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        console.log('Password reset attempt with token');

        // Hash the token to match what's in database
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Get database connection
        const connection = await db.getConnection();

        try {
            // Find valid reset token
            const [tokenRows] = await connection.execute(
                'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
                [tokenHash]
            );

            if (tokenRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            const resetRecord = tokenRows[0];
            console.log('Valid reset token found for user:', resetRecord.user_id);

            // Get user details
            const [userRows] = await connection.execute(
                'SELECT id, email, full_name FROM admin_users WHERE id = ?',
                [resetRecord.user_id]
            );

            if (userRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = userRows[0];

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            // Update user password
            await connection.execute(
                'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                [passwordHash, user.id]
            );

            // Mark token as used
            await connection.execute(
                'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
                [resetRecord.id]
            );

            console.log('Password updated successfully for user:', user.id);

            // Send confirmation email
            const { sendPasswordChangedEmail } = require('../utils/emailService');
            await sendPasswordChangedEmail(user.email, user.full_name);

            res.json({
                success: true,
                message: 'Password reset successfully'
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Get fresh user data from database
        const connection = await db.getConnection();

        try {
            const [rows] = await connection.execute(
                'SELECT id, username, email, role, full_name, phone, spa_id, is_active FROM admin_users WHERE id = ? AND is_active = 1',
                [decoded.id]
            );

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            res.json({
                success: true,
                user: rows[0]
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Get navigation items based on spa status
router.get('/navigation/:spa_id', async (req, res) => {
    try {
        const { spa_id } = req.params;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify the spa_id belongs to the authenticated user
        if (decoded.spa_id != spa_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this spa'
            });
        }

        const { getFilteredNavigation } = require('../utils/spaStatusChecker');
        const navigationData = await getFilteredNavigation(spa_id);

        if (!navigationData.success) {
            return res.status(500).json({
                success: false,
                message: navigationData.error
            });
        }

        res.json({
            success: true,
            navigation: navigationData.navItems,
            statusInfo: navigationData.statusInfo
        });

    } catch (error) {
        console.error('Navigation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving navigation items'
        });
    }
});

// Check spa status endpoint
router.get('/spa-status/:spa_id', async (req, res) => {
    try {
        const { spa_id } = req.params;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify the spa_id belongs to the authenticated user
        if (decoded.spa_id != spa_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this spa'
            });
        }

        const spaStatusCheck = await getSpaStatusAndAccess(spa_id);

        if (!spaStatusCheck.success) {
            return res.status(500).json({
                success: false,
                message: spaStatusCheck.error
            });
        }

        res.json({
            success: true,
            spa: spaStatusCheck.spa,
            accessLevel: spaStatusCheck.accessLevel,
            allowedTabs: spaStatusCheck.allowedTabs,
            statusMessage: spaStatusCheck.statusMessage,
            canLogin: spaStatusCheck.canLogin
        });

    } catch (error) {
        console.error('Spa status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking spa status'
        });
    }
});

// Change admin SPA credentials (username and password)
router.post('/change-credentials', async (req, res) => {
    try {
        const {
            user_id,
            current_password,
            new_username,
            new_password,
            confirm_password
        } = req.body;

        console.log('Change credentials request for user_id:', user_id);

        // Validate required fields
        if (!user_id || !current_password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and current password are required'
            });
        }

        // Check if at least one change is requested
        if (!new_username && !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide new username or new password to change'
            });
        }

        // Password validation if new password is provided
        if (new_password) {
            // Check if passwords match
            if (new_password !== confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirm password do not match'
                });
            }

            // Password strength validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!*])[A-Za-z\d@#$%!*]{8,}$/;
            if (!passwordRegex.test(new_password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@#$%!*)'
                });
            }
        }

        const connection = await db.getConnection();

        try {
            // Get current user data
            const [userRows] = await connection.execute(
                'SELECT id, username, password_hash, role FROM admin_users WHERE id = ? AND is_active = 1',
                [user_id]
            );

            if (userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }

            const user = userRows[0];

            // Verify current password
            let isPasswordValid = false;

            if (user.password_hash.startsWith('$2b$')) {
                // Bcrypt hash
                isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
            } else {
                // Plain text (for development)
                isPasswordValid = (current_password === user.password_hash);
            }

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Check if new username already exists (if username is being changed)
            if (new_username && new_username !== user.username) {
                const [existingUser] = await connection.execute(
                    'SELECT id FROM admin_users WHERE username = ? AND id != ?',
                    [new_username, user_id]
                );

                if (existingUser.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already exists. Please choose a different username.'
                    });
                }
            }

            // Prepare update query
            let updates = [];
            let values = [];

            if (new_username && new_username !== user.username) {
                updates.push('username = ?');
                values.push(new_username);
            }

            if (new_password) {
                // Hash the new password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(new_password, saltRounds);
                updates.push('password_hash = ?');
                values.push(hashedPassword);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No changes detected'
                });
            }

            // Add user_id to values
            values.push(user_id);

            // Execute update
            const updateQuery = `UPDATE admin_users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            await connection.execute(updateQuery, values);

            console.log('✅ Credentials updated successfully for user:', user_id);

            res.json({
                success: true,
                message: 'Credentials updated successfully. Please login with your new credentials.',
                updated: {
                    username: new_username ? true : false,
                    password: new_password ? true : false
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ Change credentials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update credentials',
            error: error.message
        });
    }
});

module.exports = router;