import React, { useState, useEffect } from 'react';
import {
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({
        total_accounts: 0,
        admin_count: 0,
        financial_officer_count: 0,
        active_count: 0,
        inactive_count: 0
    });

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'admin',
        full_name: '',
        phone: ''
    });

    const API_BASE = 'http://localhost:3001/api';

    // Get admin ID from localStorage (assuming it's stored during login)
    const getAdminId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id;
    };

    const getHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'admin-id': getAdminId()
        };
    };

    useEffect(() => {
        loadAccounts();
        loadStats();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/lsa/account-management/accounts`, {
                headers: getHeaders()
            });

            if (response.data.success) {
                setAccounts(response.data.data);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to load accounts'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API_BASE}/lsa/account-management/stats`, {
                headers: getHeaders()
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.username || !formData.password || !formData.role) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill in all required fields'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${API_BASE}/lsa/account-management/create`,
                formData,
                { headers: getHeaders() }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.data.message
                });

                // Reset form
                setFormData({
                    username: '',
                    password: '',
                    email: '',
                    role: 'admin',
                    full_name: '',
                    phone: ''
                });

                setShowCreateModal(false);
                loadAccounts();
                loadStats();
            }
        } catch (error) {
            console.error('Error creating account:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create account'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (id, username) => {
        const result = await Swal.fire({
            title: 'Delete Account?',
            text: `Are you sure you want to delete the account "${username}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axios.delete(
                    `${API_BASE}/lsa/account-management/delete/${id}`,
                    { headers: getHeaders() }
                );

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted',
                        text: 'Account deleted successfully'
                    });
                    loadAccounts();
                    loadStats();
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete account'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResetPassword = async (id, username) => {
        const { value: newPassword } = await Swal.fire({
            title: 'Reset Password',
            text: `Enter new password for ${username}`,
            input: 'password',
            inputPlaceholder: 'Enter new password',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Password is required!';
                }
                if (value.length < 6) {
                    return 'Password must be at least 6 characters!';
                }
            }
        });

        if (newPassword) {
            try {
                setLoading(true);
                const response = await axios.post(
                    `${API_BASE}/lsa/account-management/reset-password/${id}`,
                    { new_password: newPassword },
                    { headers: getHeaders() }
                );

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Password reset successfully'
                    });
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to reset password'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleToggleActive = async (id, currentStatus, username) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account?`,
            text: `Are you sure you want to ${action} the account "${username}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action}!`
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axios.put(
                    `${API_BASE}/lsa/account-management/update/${id}`,
                    { is_active: !currentStatus },
                    { headers: getHeaders() }
                );

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: `Account ${action}d successfully`
                    });
                    loadAccounts();
                    loadStats();
                }
            } catch (error) {
                console.error('Error toggling account status:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to update account'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter accounts
    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || account.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'financial_officer':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <ShieldCheckIcon className="w-5 h-5" />;
            case 'financial_officer':
                return <BanknotesIcon className="w-5 h-5" />;
            default:
                return <UserGroupIcon className="w-5 h-5" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'financial_officer':
                return 'Financial Officer';
            default:
                return role;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
                    <p className="text-gray-600 mt-1">Manage admin and financial officer accounts</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    <span>Create Account</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Accounts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_accounts}</p>
                        </div>
                        <UserGroupIcon className="w-10 h-10 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Admins</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.admin_count}</p>
                        </div>
                        <ShieldCheckIcon className="w-10 h-10 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Financial Officers</p>
                            <p className="text-2xl font-bold text-green-600">{stats.financial_officer_count}</p>
                        </div>
                        <BanknotesIcon className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active_count}</p>
                        </div>
                        <CheckCircleIcon className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-red-600">{stats.inactive_count}</p>
                        </div>
                        <XCircleIcon className="w-10 h-10 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username, name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="financial_officer">Financial Officer</option>
                    </select>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        Loading accounts...
                                    </td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No accounts found
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{account.username}</div>
                                                <div className="text-sm text-gray-500">{account.full_name || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(account.role)}`}>
                                                {getRoleIcon(account.role)}
                                                <span>{getRoleLabel(account.role)}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{account.email || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{account.phone || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {account.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircleIcon className="w-4 h-4 mr-1" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {account.last_login ? new Date(account.last_login).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleActive(account.id, account.is_active, account.username)}
                                                    className={`${account.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                    title={account.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {account.is_active ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(account.id, account.username)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Reset Password"
                                                >
                                                    <KeyIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAccount(account.id, account.username)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Account"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Account Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Account</h2>

                            <form onSubmit={handleCreateAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="financial_officer">Financial Officer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;
