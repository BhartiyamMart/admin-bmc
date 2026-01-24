'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { Login } from '@/apis/auth.api';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const LoginForm = () => {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const login = useAuthStore((s) => s.login);

  const togglePassword = () => setShowPassword((prev) => !prev);

  // Helper function to validate email format
  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const toastId = toast.loading('Signing in...');
  setIsLoading(true);

  const payload = {
    identifier: employeeId.trim().toLowerCase(),
    password,
    deviceInfo: {
      deviceId: 'string',
      deviceType: 'android',
      brand: 'string',
      model: 'string',
      os: 'string',
      osVersion: 'string',
      ipAddress: 'string',
    },
    appInfo: {
      appVersion: 'string',
      buildNumber: 'string',
      platform: 'android',
    },
    fcmToken: 'string',
  };

  try {
    const response = await Login(payload);
    if (response.error) {
      toast.error(response.message, { id: toastId });
    } else {
      const token = response.payload.token;
      const user = response.payload.user;
      const employee = response.payload.user.employee;
      
      // Pass token, user, and employee to the store
      
       login({ token, user, employee }, rememberMe);
      
      toast.success('Logged in successfully!', { id: toastId });
      setEmployeeId('');
      setPassword('');
      startTransition(() => {
        router.push('/');
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    toast.error('An unexpected error occurred', { id: toastId });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Employee ID or Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">
          Employee ID or Email ID<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          style={{ colorScheme: 'light' }}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="K20035 or email@example.com"
          required
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            style={{ colorScheme: 'light' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-4 py-2.5 pr-12 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Remember Me & Reset Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            style={{ colorScheme: 'light' }}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#EF7D02]"
          />
          <label htmlFor="remember" className="ml-2 cursor-pointer text-[11px] text-[#333333] sm:text-sm">
            Remember me
          </label>
        </div>
        <a href="/reset-password" className="text-[11px] text-[#EF7D02] sm:text-sm">
          Reset password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading || isPending}
        className="w-full cursor-pointer rounded bg-[#EF7D02] py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading || isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isPending ? 'Redirecting...' : 'Signing in...'}
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
