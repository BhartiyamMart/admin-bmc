import AuthLayout from '@/components/v1/pages/auth/auth-layout';
import VerifyOtpForm from '@/components/v1/pages/auth/verify-otp-form';
import React from 'react';

export default function Page() {
  return (
    <AuthLayout title="Verify OTP" subTitle="Verify the 6-digit code sent to your registered email.">
      <VerifyOtpForm />
    </AuthLayout>
  );
}
