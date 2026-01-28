import CreateBanner from '@/components/v1/banner/create-banner/create-banner';
import PermissionValidator from '@/guard/permission-validator';
import React from 'react';

const page = () => {
  return (
    <PermissionValidator permissions={'promotions.create'}>
      <CreateBanner/>
    </PermissionValidator>
  )
};

export default page;
