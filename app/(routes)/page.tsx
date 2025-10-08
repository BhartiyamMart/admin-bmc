import ProtectedRoute from '@/components/v1/auth/protected';
import Dashboard from '@/components/v1/dashboard/dashboard';

const page = () => {
  return (
    <ProtectedRoute>
      <Dashboard/>
    </ProtectedRoute>
  );
};

export default page;
