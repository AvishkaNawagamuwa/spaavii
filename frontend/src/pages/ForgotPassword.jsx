import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FiMail, FiArrowLeft, FiShield } from 'react-icons/fi';
import assets from '../assets/images/images';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter your email address',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                icon: 'error',
                confirmButtonColor: '#0A1428'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Email Sent!',
                    html: `
            <p>We've sent a password reset link to:</p>
            <p><strong>${email}</strong></p>
            <br>
            <p>Please check your email and click the reset link to create a new password.</p>
            <p class="text-sm text-gray-600 mt-2">The link will expire in 1 hour.</p>
          `,
                    icon: 'success',
                    confirmButtonColor: '#0A1428',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'Unable to process your request',
                    icon: 'error',
                    confirmButtonColor: '#0A1428'
                });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
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

                {/* Main Forgot Password Card */}
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

                            <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
                            <p className="text-[#FFD700] opacity-90 font-medium">Reset Your Account Password</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm text-center">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-300 text-gray-700 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your registered email"
                                        disabled={isLoading}
                                    />
                                </div>
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
                                        Sending Reset Link...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <FiMail className="mr-2 h-5 w-5" />
                                        Send Reset Link
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
                                        <p className="font-medium mb-1">Security Notice</p>
                                        <p className="text-xs text-gray-600">
                                            For your security, the password reset link will expire in 1 hour.
                                            If you don't receive an email, please check your spam folder.
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

export default ForgotPassword;
