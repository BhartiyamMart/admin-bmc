// import DeliveryTimeSlotList from '@/components/v1/delivery/delivery-time-slots';
import AddDeliveryTimeSlot from '@/components/v1/pages/setting/add-delivery-slot';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'settings.update'}>
      <AddDeliveryTimeSlot />
    </PermissionValidator>
  );
};

export default page;
