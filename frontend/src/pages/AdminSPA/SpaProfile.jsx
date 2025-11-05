import React, { useState, useEffect } from 'react';
import {
    FiLock,
    FiMapPin,
    FiUser,
    FiCheck,
    FiRefreshCw,
    FiShield,
    FiImage
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const SpaProfile = () => {
    const [spaData, setSpaData] = useState({
        spa_name: '',
        owner_name: '',
        email: '',
        phone: '',
        address: '',
        district: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Credentials change state
    const [showCredentialsForm, setShowCredentialsForm] = useState(false);
    const [credentialsData, setCredentialsData] = useState({
        current_password: '',
        new_username: '',
        new_password: '',
        confirm_password: ''
    });
    const [credentialsLoading, setCredentialsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
    });

    // Fetch SPA profile data
    const fetchSpaProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get spa_id from logged-in user data
            const userData = localStorage.getItem('user');
            if (!userData) {
                setError('User not logged in');
                return;
            }

            const user = JSON.parse(userData);
            const spaId = user.spa_id;

            if (!spaId) {
                setError('No spa associated with this user');
                return;
            }

            console.log('Fetching SPA profile for spa_id:', spaId);
            const response = await fetch(`/api/spa/profile/${spaId}`);
            const result = await response.json();

            if (result.success && result.data) {
                // Map the API response fields to component expected fields
                const mappedData = {
                    spa_name: result.data.name,
                    owner_name: `${result.data.owner_fname || ''} ${result.data.owner_lname || ''}`.trim(),
                    email: result.data.email,
                    phone: result.data.phone,
                    address: result.data.address,
                    district: 'N/A' // Not available in current API
                };
                setSpaData(mappedData);
                console.log('Mapped spa data:', mappedData);
            } else {
                setError(result.error || 'Failed to load SPA profile');
                Swal.fire({
                    title: 'Error!',
                    text: result.error || 'Failed to load SPA profile',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
            }
        } catch (error) {
            console.error('Fetch SPA profile error:', error);
            setError('Network error occurred');
            Swal.fire({
                title: 'Error!',
                text: 'Network error occurred. Please check your connection.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaProfile();
    }, []);

    const handleRefresh = () => {
        fetchSpaProfile();
    };

    // Validate password in real-time
    const validatePassword = (password, confirmPass) => {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[@#$%!*]/.test(password),
            passwordsMatch: password === confirmPass && password.length > 0
        });
    };

    // Handle credentials input change
    const handleCredentialsChange = (e) => {
        const { name, value } = e.target;
        setCredentialsData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate password if it's being changed
        if (name === 'new_password' || name === 'confirm_password') {
            const newPass = name === 'new_password' ? value : credentialsData.new_password;
            const confirmPass = name === 'confirm_password' ? value : credentialsData.confirm_password;
            validatePassword(newPass, confirmPass);
        }
    };

    // Handle credentials form submission
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();

        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
            Swal.fire({
                title: 'Error!',
                text: 'User not logged in',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        const user = JSON.parse(userData);

        // Validate inputs
        if (!credentialsData.current_password) {
            Swal.fire({
                title: 'Required!',
                text: 'Current password is required',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        if (!credentialsData.new_username && !credentialsData.new_password) {
            Swal.fire({
                title: 'Required!',
                text: 'Please provide new username or new password to change',
                icon: 'warning',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        // Validate password if provided
        if (credentialsData.new_password) {
            if (!passwordValidation.minLength || !passwordValidation.hasUppercase ||
                !passwordValidation.hasLowercase || !passwordValidation.hasNumber ||
                !passwordValidation.hasSpecialChar) {
                Swal.fire({
                    title: 'Invalid Password!',
                    text: 'Password does not meet security requirements',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
                return;
            }

            if (!passwordValidation.passwordsMatch) {
                Swal.fire({
                    title: 'Password Mismatch!',
                    text: 'New password and confirm password do not match',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
                return;
            }
        }

        // Confirm before updating
        const result = await Swal.fire({
            title: 'Confirm Changes',
            text: 'Are you sure you want to update your credentials? You will need to login again.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0A1428',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setCredentialsLoading(true);

            const response = await fetch('/api/auth/change-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    current_password: credentialsData.current_password,
                    new_username: credentialsData.new_username || undefined,
                    new_password: credentialsData.new_password || undefined,
                    confirm_password: credentialsData.confirm_password || undefined
                })
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonColor: '#0A1428'
                });

                // Clear credentials form
                setCredentialsData({
                    current_password: '',
                    new_username: '',
                    new_password: '',
                    confirm_password: ''
                });
                setShowCredentialsForm(false);

                // Logout and redirect to login page
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: result.message || 'Failed to update credentials',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
            }
        } catch (error) {
            console.error('Update credentials error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Network error occurred. Please try again.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
        } finally {
            setCredentialsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1428]"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading SPA Profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-xl mb-4">Error Loading Profile</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spa Profile</h1>
                        <p className="text-gray-600 text-lg">Your complete spa information overview</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <FiRefreshCw size={16} />
                        <span className="font-medium">Refresh</span>
                    </button>
                </div>

                {/* Logo and Verification Section */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#0A1428] to-[#1a2f4a] rounded-2xl flex items-center justify-center shadow-lg">
                            <FiImage size={32} className="text-[#D4AF37]" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                            <FiShield size={16} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{spaData.spa_name || 'Loading...'}</span>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                            <FiCheck size={12} className="mr-1" />
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Details (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FiUser className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Business Details (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Spa Name</label>
                            <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg">{spaData.spa_name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Owner</label>
                            <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.owner_name || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-lg text-blue-600 font-medium bg-gray-50 p-3 rounded-lg">{spaData.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                            <p className="text-lg text-gray-800 font-mono bg-gray-50 p-3 rounded-lg">{spaData.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location (Read-only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <FiMapPin className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Location (View Only)</h3>
                    <FiLock className="ml-2 text-gray-400" size={16} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                        <p className="text-lg text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg">{spaData.address || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">District</label>
                        <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{spaData.district || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Change Credentials Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                            <FiLock className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                            <p className="text-sm text-gray-600">Change your username and password</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCredentialsForm(!showCredentialsForm)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${showCredentialsForm
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                    >
                        {showCredentialsForm ? 'Cancel' : 'Change Credentials'}
                    </button>
                </div>

                {showCredentialsForm && (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-6 border-t pt-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="current_password"
                                value={credentialsData.current_password}
                                onChange={handleCredentialsChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your current password"
                                required
                            />
                        </div>

                        {/* New Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Username (Optional)
                            </label>
                            <input
                                type="text"
                                name="new_username"
                                value={credentialsData.new_username}
                                onChange={handleCredentialsChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter new username (leave empty to keep current)"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password (Optional)
                            </label>
                            <input
                                type="password"
                                name="new_password"
                                value={credentialsData.new_password}
                                onChange={handleCredentialsChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter new password (leave empty to keep current)"
                            />
                        </div>

                        {/* Confirm Password */}
                        {credentialsData.new_password && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={credentialsData.confirm_password}
                                    onChange={handleCredentialsChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Re-enter your new password"
                                    required
                                />
                            </div>
                        )}

                        {/* Password Requirements */}
                        {credentialsData.new_password && (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.minLength ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>Minimum 8 characters</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.hasUppercase ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>At least one uppercase letter (A-Z)</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.hasLowercase ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>At least one lowercase letter (a-z)</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.hasNumber ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>At least one number (0-9)</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.hasSpecialChar ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>At least one special char (@#$%!*)</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-sm ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordValidation.passwordsMatch ? <FiCheck size={16} /> : <span className="w-4 h-4 border-2 border-gray-400 rounded-full"></span>}
                                        <span>Passwords match</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCredentialsForm(false);
                                    setCredentialsData({
                                        current_password: '',
                                        new_username: '',
                                        new_password: '',
                                        confirm_password: ''
                                    });
                                }}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={credentialsLoading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {credentialsLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheck size={18} />
                                        <span>Update Credentials</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SpaProfile;
