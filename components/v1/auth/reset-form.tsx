'use client';

import { SendOtp } from '@/apis/auth.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ResetForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      // Updated payload matching backend
      const response = await SendOtp({
        otpType: 'forgot_password',
        deliveryMethod: 'email',
        recipient: email,
        
      });

      toast.success(response?.message || 'OTP sent successfully!');
      router.push('/reset-password/verifyotp')
    } catch (error) {
      console.error(error);
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to send OTP';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">
          Email*
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@gmail.com"
          required
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!email || isLoading}
        className="w-full rounded-md bg-[#EF7D02] py-2.5 cursor-pointer font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'Verify Email'}
      </button>

      <a href="/login" className="text-sm text-black">
        Back to Login
      </a>
    </form>
  );
};

export default ResetForm;
