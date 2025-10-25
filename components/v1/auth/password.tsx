'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PasswordForm from './password-form';

export const dynamic = 'force-dynamic';

const LoginPage = () => {
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
    <div className="flex h-screen w-screen">
      {/* Left Side - Logo with Background Image */}
      <div className="relative hidden w-2/5 bg-white md:flex">
        <Image src="/images/loginBgAdmin.jpg" alt="Background" fill className="object-cover" priority quality={100} />
        <div className="relative z-10 flex w-full items-center justify-center">
          <Image
            width={400}
            height={150}
            src="/images/logo.png"
            alt="Bhartiyam Logo"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-[#EF7D02] p-4 sm:p-6 md:w-3/5">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-semibold text-[#333333]">Reset Password</h1>
          <p className="mb-8 text-center text-sm text-[#9E9E9E]">Please enter your credentials to sign in!</p>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
