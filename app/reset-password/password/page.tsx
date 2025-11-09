import React from 'react';
import AuthLayout from '@/components/v1/auth/auth-layout';
import PasswordForm from '@/components/v1/auth/password-form';

const page = () => {
  return (
    <AuthLayout title="Reset Password" subTitle="Set a new password to secure your account!">
      <PasswordForm />
    </AuthLayout>
  );
};

export default page;
