'use client';

import { useEffect, useState, useRef } from 'react';
import { VerifyOtp } from '@/apis/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const VerifyOtpForm = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter()

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Only allow 6-digit numbers
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit OTP');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);

    // Focus the last input
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const storedEmail = localStorage.getItem('_reset_email') || '';
      const res = await VerifyOtp(fullOtp, storedEmail);

      if (res?.error) {
        toast.error(res.message || 'Invalid OTP');
        return;
      }

      const token = res.payload.token;
      const employee = res?.payload?.data?.employee;

      toast.success('OTP verified successfully!');

      // Save token to Zustand store
      login(
        {
          token,
          employee,
        },
        true
      );

      // Redirect to next page
      router.push('/reset-password/password');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 px-4">
      {/* OTP Input Container */}
      <div className="flex items-center justify-center gap-2">
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
            onPaste={handlePaste}
            disabled={isLoading}
            className="h-10 w-10 flex-shrink-0 rounded-md border-2 border-gray-300 bg-white text-center text-lg font-semibold text-[#333333] transition-all focus:border-[#EF7D02] focus:ring-2 focus:ring-[#EF7D02] focus:outline-none disabled:opacity-60 sm:h-12 sm:w-12 sm:text-xl"
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || otp.some((digit) => digit === '')}
        className="w-full cursor-pointer rounded-md bg-[#EF7D02] py-2.5 font-medium text-white transition duration-200 hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify OTP'
        )}
      </button>

      <a
        href="/login"
        className="block text-center text-sm text-[#333333] hover:text-[#EF7D02] transition-colors"
      >
        Back to Login
      </a>
    </form>
  );
};

export default VerifyOtpForm;
