import EmployeeRolelist from '@/components/v1/employee/employee-rolelist';
import PermissionValidator from '@/guard/permission-validator';
import React from 'react';

const page = () => {
  return (
    <PermissionValidator permissions={'roles.view'}>
      <EmployeeRolelist/>
    </PermissionValidator>
  )
};

export default page;
