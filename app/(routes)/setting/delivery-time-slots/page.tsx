import DeliveryTimeSlotList from '@/components/v1/delivery/delivery-time-slots';
import PermissionValidator from '@/guard/permission-validator';
import React from 'react';

const page = () => {
  return (
    <PermissionValidator permissions={'settings.update'}>
      <DeliveryTimeSlotList />
    </PermissionValidator>
  );
};

export default page;
