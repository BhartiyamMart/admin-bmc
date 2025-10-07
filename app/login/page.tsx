import { Metadata } from 'next';

import LoginPage from '@/components/v1/auth/login';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Secure login to Kamna ERP',
}; 

const page = () => {
  return <LoginPage />;
};

export default page;
