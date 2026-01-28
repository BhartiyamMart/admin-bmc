import Employee from '@/components/v1/employee/employee';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'users.view'}>
      <Employee />
    </PermissionValidator>
  );
};

export default page;
