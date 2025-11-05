import React, { useState } from 'react';
import { KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';

const AccountSettings = () => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_username: '',
        new_email: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        passwordsMatch: false
    });

    // Password validation regex patterns
    const validatePassword = (password, confirmPassword) => {
        setPasswordStrength({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[@#$%!*]/.test(password),
            passwordsMatch: password === confirmPassword && password.length > 0 && confirmPassword.length > 0
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // Validate password whenever new_password or confirm_password changes
        if (name === 'new_password' || name === 'confirm_password') {
            validatePassword(
                name === 'new_password' ? value : newFormData.new_password,
                name === 'confirm_password' ? value : newFormData.confirm_password
            );
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const isFormValid = () => {
        return (
            formData.current_password &&
            passwordStrength.minLength &&
            passwordStrength.hasUppercase &&
            passwordStrength.hasLowercase &&
            passwordStrength.hasNumber &&
            passwordStrength.hasSpecial &&
            passwordStrength.passwordsMatch &&
            (formData.new_username || formData.new_email || formData.new_password)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Form',
                text: 'Please ensure all password requirements are met.',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        try {
            setLoading(true);

            // Get current user data
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                throw new Error('User session not found. Please login again.');
            }

            const response = await axios.put(
                'http://localhost:3001/api/lsa/account/change-credentials',
                {
                    admin_id: userData.id,
                    current_password: formData.current_password,
                    new_username: formData.new_username || undefined,
                    new_email: formData.new_email || undefined,
                    new_password: formData.new_password || undefined
                }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your credentials have been updated successfully. Please login again with your new credentials.',
                    confirmButtonColor: '#0A1428'
                }).then(() => {
                    // Clear local storage and redirect to login
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    window.location.href = '/';
                });
            }
        } catch (error) {
            console.error('Change credentials error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update credentials. Please try again.',
                confirmButtonColor: '#0A1428'
            });
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ isValid, text }) => (
        <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
            {isValid ? (
                <CheckCircleIcon className="w-4 h-4" />
            ) : (
                <XCircleIcon className="w-4 h-4" />
            )}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
                <p className="text-gray-600">Change your username, email and password</p>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
                    {/* Current Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                                placeholder="Enter your current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.current ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* New Username */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Username (Optional)
                        </label>
                        <input
                            type="text"
                            name="new_username"
                            value={formData.new_username}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                            placeholder="Enter new username (leave empty to keep current)"
                        />
                    </div>

                    {/* New Email */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Email (Optional)
                        </label>
                        <input
                            type="email"
                            name="new_email"
                            value={formData.new_email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                            placeholder="Enter new email (leave empty to keep current)"
                        />
                    </div>

                    {/* New Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.new ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#001F3F] focus:border-transparent"
                                placeholder="Confirm your new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.confirm ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</h4>
                        <div className="space-y-2">
                            <ValidationItem isValid={passwordStrength.minLength} text="Minimum 8 characters" />
                            <ValidationItem isValid={passwordStrength.hasUppercase} text="At least one uppercase letter (A–Z)" />
                            <ValidationItem isValid={passwordStrength.hasLowercase} text="At least one lowercase letter (a–z)" />
                            <ValidationItem isValid={passwordStrength.hasNumber} text="At least one number (0–9)" />
                            <ValidationItem isValid={passwordStrength.hasSpecial} text="At least one special character (@, #, $, %, !, *)" />
                            <ValidationItem isValid={passwordStrength.passwordsMatch} text="Passwords must match" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading || !isFormValid()}
                            className="bg-[#001F3F] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <KeyIcon className="w-5 h-5 mr-2" />
                            {loading ? 'Updating...' : 'Update Credentials'}
                        </button>

                        <p className="text-sm text-gray-500">
                            You will be logged out after updating
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
