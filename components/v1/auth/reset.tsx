'use client';

import React from 'react';
import Image from 'next/image';
import ResetForm from './reset-form';

const ResetPage = () => {
  return (
    <div className="flex h-screen w-screen">
      {/* Left Side - Logo with Background Image */}
      <div className="relative hidden w-2/5 md:flex">
        {/* Background Image */}
        <Image src="/images/loginBgAdmin.jpg" alt="Background" fill className="object-cover" priority quality={100} />

        {/* Logo on top of background */}
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
          {/* Heading */}
          <h1 className="mb-2 text-center text-2xl font-semibold text-[#333333]">Reset Password</h1>
          <p className="mb-8 text-center text-sm text-[#9E9E9E]">Please enter your email</p>

          <ResetForm />
        </div>
      </div>
    </div>
  );
};

export default ResetPage;
