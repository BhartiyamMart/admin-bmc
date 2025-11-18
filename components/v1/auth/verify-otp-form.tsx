'use client';

import toast from 'react-hot-toast';
import { SendOtp, VerifyOtp } from '@/apis/auth.api';
import { useRouter } from 'nextjs-toploader/app';
import { useAuthStore } from '@/store/auth.store';
import { useState, useRef, useEffect } from 'react';

const VerifyOtpForm = () => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuthStore();

  // Check for stored email
  useEffect(() => {
    const storedEmail = localStorage.getItem('_reset_email');
    if (!storedEmail) {
      router.push('/reset-password');
    }
  }, [router]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // OTP input change handler
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const isPreviousEmpty = otp.slice(0, index).some((v) => v === '');
    if (isPreviousEmpty) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace, navigation, and paste
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const updatedOtp = [...otp];
      if (!otp[index] && index > 0) {
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        updatedOtp[index] = '';
        setOtp(updatedOtp);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit OTP');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };

  // ✅ Verify OTP
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

      toast.success('OTP verified successfully!');

      const token = res.payload.token;
      const employee = res?.payload?.data?.employee;

      login({ token, employee }, true);
      router.push('/reset-password/password');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Resend OTP Functionality
  const handleResend = async () => {
    const storedEmail = localStorage.getItem('_reset_email');
    if (!storedEmail) {
      toast.error('Email not found. Please restart the reset process.');
      router.push('/reset-password');
      return;
    }

    try {
      setIsResending(true);
      const res = await SendOtp({
        otpType: 'forgot_password',
        deliveryMethod: 'email',
        recipient: storedEmail,
      });

      if (res.error) {
        toast.error(res.message || 'Failed to resend OTP');
      } else {
        toast.success('OTP resent successfully!');
        setTimer(30);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while resending OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 px-4">
      {/* OTP Inputs */}
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

      {/* Verify Button */}
      <button
        type="submit"
        disabled={isLoading || otp.some((digit) => digit === '')}
        className="w-full cursor-pointer rounded-md bg-[#EF7D02] py-2.5 font-medium text-white transition duration-200 hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* ✅ Resend OTP Section */}
      <div className="text-center text-sm">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="cursor-pointer text-[#EF7D02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        ) : (
          <p className="text-gray-500">
            Resend available in <span className="font-medium">{timer}s</span>
          </p>
        )}
      </div>

      <a href="/login" className="block text-center text-sm text-[#333333] transition-colors hover:text-[#EF7D02]">
        Back to Login
      </a>
    </form>
  );
};

export default VerifyOtpForm;
