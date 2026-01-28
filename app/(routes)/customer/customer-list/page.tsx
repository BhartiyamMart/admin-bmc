import React from 'react';
import CustomerList from '@/components/v1/customer/customer-list';
import PermissionValidator from '@/guard/permission-validator';
const page = () => {
  return (
      <PermissionValidator permissions={'users.view'}>
        <CustomerList />
      </PermissionValidator>
  );
};

export default page;
