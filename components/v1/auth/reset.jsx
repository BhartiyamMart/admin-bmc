'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [currentStep, setCurrentStep] = useState('request'); // 'request', 'confirmation', 'newPassword', 'success'
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('confirmation');
    }, 2000);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('newPassword');
    }, 1500);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('success');
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'request':
        return (
          <>
            <h1 className="text-center text-xl font-semibold text-[#333333] sm:text-2xl">
              Reset Your Password
            </h1>
            <p className="mt-2 mb-6 text-center text-xs text-[#9E9E9E] sm:text-sm">
              Enter your email address and we'll send you a reset link
            </p>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#28B946] py-2 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="text-center">
                <a 
                  href="/login" 
                  className="inline-flex items-center gap-1 text-sm text-[#9E9E9E] hover:text-[#FF8C00] transition"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </a>
              </div>
            </form>
          </>
        );

      case 'confirmation':
        return (
          <>
            <h1 className="text-center text-xl font-semibold text-[#333333] sm:text-2xl">
              Check Your Email
            </h1>
            <p className="mt-2 mb-6 text-center text-xs text-[#9E9E9E] sm:text-sm">
              We've sent a verification code to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || resetCode.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#28B946] py-2 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="text-center space-y-2">
                <p className="text-xs text-[#9E9E9E]">
                  Didn't receive the code?{' '}
                  <button 
                    type="button"
                    onClick={() => handleRequestReset({ preventDefault: () => {} })}
                    className="text-[#FF8C00] hover:underline"
                  >
                    Resend
                  </button>
                </p>
                <a 
                  href="/login" 
                  className="inline-flex items-center gap-1 text-sm text-[#9E9E9E] hover:text-[#FF8C00] transition"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </a>
              </div>
            </form>
          </>
        );

      case 'newPassword':
        return (
          <>
            <h1 className="text-center text-xl font-semibold text-[#333333] sm:text-2xl">
              Create New Password
            </h1>
            <p className="mt-2 mb-6 text-center text-xs text-[#9E9E9E] sm:text-sm">
              Please create a strong password for your account
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#9E9E9E]">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || password !== confirmPassword}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#28B946] py-2 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          </>
        );

      case 'success':
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-center text-xl font-semibold text-[#333333] sm:text-2xl">
              Password Reset Successful
            </h1>
            <p className="mt-2 mb-6 text-center text-xs text-[#9E9E9E] sm:text-sm">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            <a
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#28B946] py-2 font-medium text-white shadow-md transition hover:opacity-90"
            >
              Continue to Sign In
              <ArrowRight size={18} />
            </a>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Side - Same gradient as login */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-b from-[#FF8C00] to-[#00A651] md:flex"></div>

      {/* Right Side */}
      <div className="flex w-full items-center justify-center bg-white p-4 sm:p-6 md:w-1/2">
        <div className="w-full max-w-md p-6 sm:p-8">
          {/* Logo - Same as login */}
          <div className="mb-6 flex justify-center">
            <img src="/images/logo.png" alt="Logo" className="h-15" />
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
}
