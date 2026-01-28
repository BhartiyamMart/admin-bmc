import Dashboard from '@/components/v1/dashboard/dashboard';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    // <PermissionValidator permissions={''}>
    <Dashboard />
    // </PermissionValidator>
  );
};

export default page;
