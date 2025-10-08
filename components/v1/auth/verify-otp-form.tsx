'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const VerifyOtpForm = () => {
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
        <label className="mb-2 block text-sm font-medium text-[#333333]">Otp*</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="123456"
          required
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#333333] placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
        />
      </div>

      

      {/* Error Message */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-[#EF7D02] py-2.5 cursor-pointer  font-medium text-white shadow-sm transition-all hover:bg-[#d66f02] focus:ring-2 focus:ring-[#EF7D02] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
            Sending...
          </span>
        ) : (
          'Verify Otp'
        )}
      </button>
     <a href='/login' className="text-sm text-black ">
         Back to Login
        </a>
    </form>
  );
};

export default VerifyOtpForm;
