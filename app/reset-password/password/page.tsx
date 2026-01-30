import React from 'react';
import AuthLayout from '@/components/v1/pages/auth/auth-layout';
import PasswordForm from '@/components/v1/pages/auth/password-form';

const page = () => {
  return (
    <AuthLayout title="Reset Password" subTitle="Set a new password to secure your account!">
      <PasswordForm />
    </AuthLayout>
  );
};

export default page;
