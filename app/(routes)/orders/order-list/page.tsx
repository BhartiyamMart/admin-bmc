import OrderList from '@/components/v1/orders/order-list/order-list';
import PermissionValidator from '@/guard/permission-validator';
import React from 'react';

const page = () => {
  return (
    <PermissionValidator permissions={'orders.view'}>
      <OrderList />;
    </PermissionValidator>
  );
};

export default page;
