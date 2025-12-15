import AuthLayout from '@/components/v1/auth/auth-layout';
import ResetForm from '@/components/v1/auth/reset-form';
const page = () => {
  return (
    <AuthLayout title="Reset  password" subTitle="Enter your mail to reset password.">
      <ResetForm />
    </AuthLayout>
  );
};

export default page;
