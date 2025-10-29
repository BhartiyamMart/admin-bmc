'use client';

import { useEffect, useState, useRef } from 'react';
import { VerifyOtp } from '@/apis/auth.api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const VerifyOtpForm = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) setRecipient(storedEmail);
  }, []);
  const { login } = useAuthStore();
  const handleChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^[0-9]?$/.test(value)) return;

    // Prevent typing in middle if previous boxes are empty
    const isPreviousEmpty = otp.slice(0, index).some((v) => v === '');
    if (isPreviousEmpty) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    // Move to next box automatically
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const updatedOtp = [...otp];

      // If current box is empty → go back and clear previous one
      if (!otp[index] && index > 0) {
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        updatedOtp[index] = '';
        setOtp(updatedOtp);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await VerifyOtp(fullOtp, recipient);

      if (res?.error) {
        setError(res.message || 'Invalid OTP');
        return;
      }

      const token = res.payload.token;
      console.log(token);
      const employee = res?.payload?.data?.employee;

      toast.success('OTP verified successfully!');

      // ✅ Save token to Zustand store
      login(
        {
          token,
          employee,
        },
        true // true = remember using localStorage; false = sessionStorage only
      );

      // ✅ Redirect to next page
      router.push('/reset-password/password');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OTP Label */}
      <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-9 w-9 rounded-md border border-gray-300 text-center text-base font-semibold text-[#333333] shadow-sm focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none disabled:opacity-60 sm:h-13 sm:w-13 sm:text-lg md:h-14 md:w-14 md:text-xl"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Submit Button */}
      <div></div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-md bg-[#EF7D02] py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <a href="/login" className="block text-center text-sm text-black ">
        Back to Login
      </a>
    </form>
  );
};

export default VerifyOtpForm;
