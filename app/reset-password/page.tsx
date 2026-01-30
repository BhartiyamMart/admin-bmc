import AuthLayout from '@/components/v1/pages/auth/auth-layout';
import ResetForm from '@/components/v1/pages/auth/reset-form';
const page = () => {
  return (
    <AuthLayout title="Reset  password" subTitle="Enter your email/employee-id to reset password.">
      <ResetForm />
    </AuthLayout>
  );
};

export default page;
