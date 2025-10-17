const db = require('../config/database');

/**
 * SPA Status Checker Utility
 * Checks the spa status from database and determines what access level should be granted
 */

const SPA_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    UNVERIFIED: 'unverified',
    BLACKLISTED: 'blacklisted'
};

const ACCESS_LEVEL = {
    FULL_ACCESS: 'full_access',
    REJECTED_ACCESS: 'rejected_access',
    UNVERIFIED_ACCESS: 'unverified_access',
    NO_ACCESS: 'no_access'
};

/**
 * Get SPA status from database by spa_id
 * @param {number} spaId - The spa ID to check
 * @returns {Promise<Object>} - Returns spa status and access information
 */
async function getSpaStatusAndAccess(spaId) {
    try {
        if (!spaId) {
            return {
                success: false,
                error: 'Spa ID is required',
                accessLevel: ACCESS_LEVEL.NO_ACCESS
            };
        }

        const connection = await db.getConnection();

        try {
            // Query the spas table to get current status
            const [rows] = await connection.execute(
                'SELECT id, name, status, owner_fname, owner_lname, email, blacklist_reason FROM spas WHERE id = ?',
                [spaId]
            );

            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'SPA not found',
                    accessLevel: ACCESS_LEVEL.NO_ACCESS
                };
            }

            const spa = rows[0];
            const spaStatus = spa.status;

            // Determine access level and allowed tabs based on status
            let accessLevel;
            let allowedTabs = [];
            let statusMessage = '';

            switch (spaStatus) {
                case SPA_STATUS.PENDING:
                    accessLevel = ACCESS_LEVEL.NO_ACCESS;
                    allowedTabs = [];
                    statusMessage = 'Your application is pending approval. Please wait for LSA verification.';
                    break;

                case SPA_STATUS.REJECTED:
                    accessLevel = ACCESS_LEVEL.REJECTED_ACCESS;
                    allowedTabs = ['resubmit-application', 'spa-profile'];
                    statusMessage = 'Your application was rejected. You can resubmit your application or update your profile.';
                    break;

                case SPA_STATUS.UNVERIFIED:
                    accessLevel = ACCESS_LEVEL.UNVERIFIED_ACCESS;
                    allowedTabs = ['payment-plans', 'spa-profile'];
                    statusMessage = 'Please complete payment to verify your account.';
                    break;

                case SPA_STATUS.VERIFIED:
                    accessLevel = ACCESS_LEVEL.FULL_ACCESS;
                    allowedTabs = ['dashboard', 'payment-plans', 'notification-history', 'add-therapist', 'view-therapists', 'resign-terminate', 'spa-profile'];
                    statusMessage = 'Welcome! You have full access to all features.';
                    break;

                case SPA_STATUS.BLACKLISTED:
                    accessLevel = ACCESS_LEVEL.NO_ACCESS;
                    allowedTabs = [];
                    statusMessage = 'Your account has been suspended by the admin panel. Please contact LSA administration.';
                    break;

                default:
                    accessLevel = ACCESS_LEVEL.NO_ACCESS;
                    allowedTabs = [];
                    statusMessage = 'Unknown status. Please contact support.';
            }

            return {
                success: true,
                spa: {
                    id: spa.id,
                    name: spa.name,
                    status: spaStatus,
                    owner_name: `${spa.owner_fname} ${spa.owner_lname}`,
                    owner_email: spa.email,
                    blacklist_reason: spa.blacklist_reason
                },
                accessLevel,
                allowedTabs,
                statusMessage,
                canLogin: accessLevel !== ACCESS_LEVEL.NO_ACCESS
            };

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error checking spa status:', error);
        return {
            success: false,
            error: 'Database error while checking spa status',
            accessLevel: ACCESS_LEVEL.NO_ACCESS
        };
    }
}

/**
 * Check if a user can access a specific tab based on their spa status
 * @param {number} spaId - The spa ID
 * @param {string} tabId - The tab ID to check
 * @returns {Promise<boolean>} - Returns true if access is allowed
 */
async function canAccessTab(spaId, tabId) {
    try {
        const statusCheck = await getSpaStatusAndAccess(spaId);

        if (!statusCheck.success) {
            return false;
        }

        return statusCheck.allowedTabs.includes(tabId);
    } catch (error) {
        console.error('Error checking tab access:', error);
        return false;
    }
}

/**
 * Get all available navigation items filtered by spa status
 * @param {number} spaId - The spa ID
 * @returns {Promise<Object>} - Returns filtered navigation items
 */
async function getFilteredNavigation(spaId) {
    try {
        const statusCheck = await getSpaStatusAndAccess(spaId);

        if (!statusCheck.success) {
            return {
                success: false,
                error: statusCheck.error,
                navItems: []
            };
        }

        // Define all possible navigation items
        const allNavItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'FiHome' },
            { id: 'payment-plans', label: 'Payment Plans', icon: 'FiCreditCard' },
            { id: 'notification-history', label: 'Notification History', icon: 'FiBell' },
            { id: 'add-therapist', label: 'Add Therapist', icon: 'FiUserPlus' },
            { id: 'view-therapists', label: 'View Therapists', icon: 'FiUsers' },
            { id: 'resign-terminate', label: 'Manage Staff', icon: 'FiFilter' },
            { id: 'resubmit-application', label: 'Resubmit Application', icon: 'FiX' },
            { id: 'spa-profile', label: 'Spa Profile', icon: 'FiSettings' }
        ];

        // Filter navigation items based on allowed tabs
        const filteredNavItems = allNavItems.filter(item =>
            statusCheck.allowedTabs.includes(item.id)
        );

        return {
            success: true,
            navItems: filteredNavItems,
            statusInfo: {
                status: statusCheck.spa.status,
                accessLevel: statusCheck.accessLevel,
                statusMessage: statusCheck.statusMessage,
                canLogin: statusCheck.canLogin
            }
        };

    } catch (error) {
        console.error('Error getting filtered navigation:', error);
        return {
            success: false,
            error: 'Error retrieving navigation items',
            navItems: []
        };
    }
}

module.exports = {
    SPA_STATUS,
    ACCESS_LEVEL,
    getSpaStatusAndAccess,
    canAccessTab,
    getFilteredNavigation
};