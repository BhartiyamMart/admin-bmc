'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Login } from '@/apis/auth.api';
import { useAuthStore } from '@/store/auth.store';
import Image from 'next/image';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const toggleButton = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!employeeId || !password) {
      setError('Please enter valid credentials');
      setIsLoading(false);
      return;
    }

    const response = await Login({ employeeId, password });

    if (response.error || !response.payload) {
      setError(response.message || 'Login failed');
      setIsLoading(false);
      return;
    }

    const { token, employee } = response.payload;
    setAuthData(token, employee);

    router.push('/');
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Side */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-b from-[#FF8C00] to-[#00A651] md:flex"></div>

      {/* Right Side */}
      <div className="flex w-full items-center justify-center bg-white p-4 sm:p-6 md:w-1/2">
        <div className="w-full max-w-md p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image width={1000} height={1000} src="/images/logo.png" alt="Logo" className="w-80" />
          </div>

          {/* Heading */}
          <h1 className="text-center text-xl font-semibold text-[#333333] sm:text-2xl">Sign in to your account</h1>
          <p className="mt-2 mb-6 text-center text-xs text-[#9E9E9E] sm:text-sm">
            Please enter your credentials to sign in!
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#333333]">User ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee id"
                required
                autoComplete="employeeid"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-[#333333]">Password</label>
                <a href="/reset-password" className="text-sm text-[#FF8C00] hover:underline">
                  Reset Password
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 text-black focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={toggleButton}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer appearance-none border border-gray-300 bg-white text-[#01C3DA] checked:appearance-auto focus:ring-[#01C3DA]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[#333333]">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#28B946] py-2 font-medium text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
