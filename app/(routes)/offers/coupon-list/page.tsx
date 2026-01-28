import CouponList from '@/components/v1/coupons/coupons';
import PermissionValidator from '@/guard/permission-validator';
import React from 'react';

const page = () => {
  return (
    <PermissionValidator permissions={'promotions.view'}>
      <CouponList/>
    </PermissionValidator>
  )
};

export default page;
