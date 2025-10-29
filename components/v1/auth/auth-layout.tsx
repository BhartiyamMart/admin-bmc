'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthBg, LogoIcon } from '@/components/common/svg-icon';

export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subTitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subTitle }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN!);

    if (token) {
      router.replace('/');
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Left Side - Logo with Background Image */}
      <div className="relative hidden w-full bg-white md:flex md:w-2/5">
        <AuthBg className="absolute inset-0 h-full w-full object-cover" width={500} />
        <div className="relative z-10 flex w-full items-center justify-center">
          <LogoIcon className="p-4" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-[#EF7D02] p-4 sm:p-6 md:w-3/5">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-semibold text-[#333333]">{title}</h1>
          <p className="mb-8 text-center text-sm text-[#9E9E9E]">{subTitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
