import { Metadata } from 'next';
import AuthLayout from '@/components/v1/pages/auth/auth-layout';
import LoginForm from '@/components/v1/pages/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Secure login to Bhartiyam Admin Panel',
};

const page = () => {
  return (
    <AuthLayout title="Sign in to your account" subTitle="Please enter your credentials to sign in!">
      <LoginForm />
    </AuthLayout>
  );
};

export default page;
