'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        setIsLoading(true);
        setError('');
        
    } catch (error) {
        toast.error("Error");   
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Employee ID */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">Employee Id</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="458"
          required
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="AbC58I87"
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
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#EF7D02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-0"
          />
          <label htmlFor="remember" className="ml-2 cursor-pointer text-sm text-[#333333]">
            Remember me
          </label>
        </div>
        <a href="/reset-password" className="text-sm text-[#EF7D02] hover:underline focus:outline-none">
          Reset password?
        </a>
      </div>

      {/* Error Message */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-[#EF7D02] py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
