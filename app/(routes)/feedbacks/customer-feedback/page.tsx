import CustomerFeedback from '@/components/v1/feedbacks/customer-feedback/customer-feedback';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'reports.users'}>
      <CustomerFeedback/>
    </PermissionValidator>
  )
};

export default page;
