import React, { createContext, useContext, useState, useEffect } from 'react';

const SpaStatusContext = createContext();

export const useSpaStatus = () => {
    const context = useContext(SpaStatusContext);
    if (!context) {
        throw new Error('useSpaStatus must be used within a SpaStatusProvider');
    }
    return context;
};

export const SpaStatusProvider = ({ children }) => {
    const [spaStatus, setSpaStatus] = useState({
        status: null,
        accessLevel: null,
        allowedTabs: [],
        statusMessage: '',
        canLogin: false,
        loading: true,
        error: null
    });

    const [navigation, setNavigation] = useState([]);

    // Fetch spa status and navigation from backend
    const fetchSpaStatus = async () => {
        try {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!userData || !token) {
                setSpaStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: 'No authentication data found'
                }));
                return;
            }

            const user = JSON.parse(userData);

            if (!user.spa_id) {
                setSpaStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: 'No spa ID found in user data'
                }));
                return;
            }

            // Fetch spa status
            const statusResponse = await fetch(`http://localhost:3001/api/auth/spa-status/${user.spa_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                setSpaStatus(prev => ({
                    ...prev,
                    status: statusData.spa.status,
                    accessLevel: statusData.accessLevel,
                    allowedTabs: statusData.allowedTabs,
                    statusMessage: statusData.statusMessage,
                    canLogin: statusData.canLogin,
                    loading: false,
                    error: null
                }));

                // Fetch navigation items
                const navResponse = await fetch(`http://localhost:3001/api/auth/navigation/${user.spa_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (navResponse.ok) {
                    const navData = await navResponse.json();
                    setNavigation(navData.navigation);
                }
            } else {
                setSpaStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to fetch spa status'
                }));
            }

        } catch (error) {
            console.error('Error fetching spa status:', error);
            setSpaStatus(prev => ({
                ...prev,
                loading: false,
                error: 'Error connecting to server'
            }));
        }
    };

    // Check if a tab is allowed
    const isTabAllowed = (tabId) => {
        return spaStatus.allowedTabs.includes(tabId);
    };

    // Get status-based navigation items with icons
    const getNavigationItems = () => {
        const iconMap = {
            'FiHome': '🏠',
            'FiCreditCard': '💳',
            'FiBell': '🔔',
            'FiUserPlus': '👥',
            'FiUsers': '👤',
            'FiFilter': '⚙️',
            'FiX': '📝',
            'FiSettings': '🏪'
        };

        return navigation.map(item => ({
            ...item,
            iconText: iconMap[item.icon] || '📄'
        }));
    };

    // Initialize spa status on mount
    useEffect(() => {
        fetchSpaStatus();
    }, []);

    const value = {
        spaStatus,
        navigation,
        isTabAllowed,
        getNavigationItems,
        refreshSpaStatus: fetchSpaStatus
    };

    return (
        <SpaStatusContext.Provider value={value}>
            {children}
        </SpaStatusContext.Provider>
    );
};

export default SpaStatusContext;