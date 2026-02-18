import Dashboard from '@/components/v1/pages/dashboard/dashboard';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    // <PermissionValidator permissions={''}>
    <Dashboard />
    // </PermissionValidator>
  );
};

export default page;
