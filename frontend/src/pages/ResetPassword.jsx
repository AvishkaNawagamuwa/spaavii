import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2';
import { FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft } from 'react-icons/fi';
import assets from '../assets/images/images';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if token exists
        if (!token) {
            Swal.fire({
                title: 'Invalid Link',
                text: 'Password reset link is invalid or missing.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            }).then(() => {
                navigate('/login');
            });
        }
    }, [token, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.newPassword || !formData.confirmPassword) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fill in all fields',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            Swal.fire({
                title: 'Weak Password',
                text: 'Password must be at least 6 characters long',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Swal.fire({
                title: 'Password Mismatch',
                text: 'Passwords do not match',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Password Reset Successful!',
                    html: `
            <p>Your password has been successfully reset.</p>
            <p>You can now login with your new password.</p>
          `,
                    icon: 'success',
                    confirmButtonColor: '#0A1428',
                    confirmButtonText: 'Go to Login'
                }).then(() => {
                    navigate('/login');
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'Unable to reset password',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
            }
        } catch (error) {
            console.error('Reset password error:', error);
            Swal.fire({
                title: 'Connection Error',
                text: 'Unable to connect to server. Please try again.',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1428] via-[#001F3F] to-[#003366] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FFD700] bg-opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#FFD700] bg-opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white bg-opacity-5 rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back to Login Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center text-white hover:text-[#FFD700] transition-colors duration-300 text-sm font-medium group"
                    >
                        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Login
                    </button>
                </div>

                {/* Main Reset Password Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-[#0A1428] to-[#001F3F] text-white p-8 text-center relative">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-16 h-16 border border-white rounded-full"></div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                        </div>

                        <div className="relative z-10">
                            {/* LSA Logo */}
                            <div className="mb-6 flex justify-center">
                                <img
                                    src={assets.logo_trans}
                                    alt="Lanka Spa Association"
                                    className="h-16 w-auto"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="h-16 w-16 bg-[#FFD700] rounded-full items-center justify-center hidden">
                                    <FiShield className="h-8 w-8 text-[#0A1428]" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                            <p className="text-[#FFD700] opacity-90 font-medium">Create Your New Password</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm text-center">
                                Please enter your new password. Make sure it's strong and secure.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password Field */}
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-gray-700 bg-gray-50 focus:bg-white"
                                        placeholder="Enter new password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showNewPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-gray-700 bg-gray-50 focus:bg-white"
                                        placeholder="Confirm new password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                                    <li>At least 6 characters long</li>
                                    <li>Use a mix of letters and numbers for better security</li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#0A1428] to-[#001F3F] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                    } shadow-lg`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Resetting Password...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <FiShield className="mr-2 h-5 w-5" />
                                        Reset Password
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Additional Information */}
                        <div className="mt-8 space-y-4">
                            {/* Security Notice */}
                            <div className="bg-gradient-to-r from-[#FFD700] to-[#F5D76E] bg-opacity-10 border border-[#FFD700] border-opacity-20 rounded-xl p-4">
                                <div className="flex items-start">
                                    <FiShield className="h-5 w-5 text-[#0A1428] mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-gray-700">
                                        <p className="font-medium mb-1">Security Tip</p>
                                        <p className="text-xs text-gray-600">
                                            Choose a unique password that you don't use for other accounts.
                                            Never share your password with anyone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div className="border-t border-gray-100 pt-4 text-center">
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>© {new Date().getFullYear()} Lanka Spa Association</p>
                                    <p>Promoting Excellence in Sri Lanka's Wellness Industry</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
