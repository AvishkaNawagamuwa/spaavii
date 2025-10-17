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
                message: 'Username and password are required'
            });
        }

        console.log('Login attempt for username:', username);

        // Get database connection
        const connection = await db.getConnection();

        try {
            // Query admin_users table for the user
            const [rows] = await connection.execute(
                'SELECT id, username, email, password_hash, role, full_name, phone, spa_id, is_active, last_login FROM admin_users WHERE username = ? AND is_active = 1',
                [username]
            );

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
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

module.exports = router;