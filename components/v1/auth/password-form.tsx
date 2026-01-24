'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ResetPassword } from '@/apis/auth.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface PasswordFormProps {
  onSubmit?: (password: string) => void;
}

const PasswordForm: React.FC<PasswordFormProps> = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword && password.length == 8) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    console.log(error);
    setIsLoading(true);
    const storedEmail = localStorage.getItem('_reset_email') || '';
    try {
      const response = await ResetPassword(storedEmail, password);
      if (response.error === true) {
        toast(response.message);
        router.push('/login');
      } else {
        toast('Password reset successfully');
        router.push('/login');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* New Password */}
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#333333]">
          New Password<span className="text-red-500"> *</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="new password"
            minLength={8}
            required
            className="w-full rounded border border-gray-300 px-4 py-2.5 pr-10 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-foreground absolute inset-y-0 right-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-5 w-5 cursor-pointer text-black" /> : <Eye className="h-5 w-5 cursor-pointer text-black" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#333333]">
          Confirm Password<span className="text-red-500"> *</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="confirm password"
            required
            minLength={8}
            className="w-full rounded border border-gray-300 px-4 py-2.5 pr-10 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-foreground absolute inset-y-0 right-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 cursor-pointer text-black" />
            ) : (
              <Eye className="h-5 w-5 cursor-pointer text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!password || !confirmPassword || isLoading}
        className="w-full cursor-pointer rounded bg-[#EF7D02] py-2.5 font-medium text-white"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>

      <a href="/login" className="block text-center text-sm text-black">
        Back to Login
      </a>
    </form>
  );
};

export default PasswordForm;
