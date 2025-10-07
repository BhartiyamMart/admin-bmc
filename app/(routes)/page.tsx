import ProtectedRoute from '@/components/v1/auth/protected';

const page = () => {
  return (
    <ProtectedRoute>
      Hello
    </ProtectedRoute>
  );
};

export default page;
