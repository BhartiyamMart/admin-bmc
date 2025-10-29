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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Signing in...');
    setIsLoading(true);

    // Prepare payload: if input contains '@', use email; else use employeeId
    const loginPayload = employeeId.includes('@')
      ? { email: employeeId.trim(), password }
      : { employeeId: employeeId.trim().toUpperCase(), password };

    try {
      const response = await Login(loginPayload);
      console.log('api is calling');
      if (response.error) {
        console.log('message comes from line 38');
        toast.error(response.message, { id: toastId });
      } else {
        console.log('message comes from line 41');
        const { token, employee } = response.payload;
        login({ token, employee }, rememberMe);
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
      console.log('message comes from line 55');
    } finally {
      setIsLoading(false);
      console.log('message comes from line 58');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Employee ID */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">
          Employee Id  <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="K20035"
          required
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#333333] uppercase placeholder:text-gray-400 focus:border-[#EF7D02] focus:ring-1 focus:ring-[#EF7D02] focus:outline-none"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
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
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#EF7D02]"
          />
          <label htmlFor="remember" className="ml-2 cursor-pointer   text-[11px] sm:text-sm text-[#333333]">
            Remember me
          </label>
        </div>
        <a href="/reset-password" className="text-[11px] sm:text-sm text-[#EF7D02]">
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
            <svg className="h-5 w-5 animate-spin text-white" /* ... */ />
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
