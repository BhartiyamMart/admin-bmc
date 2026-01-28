import FeedbackCategory from '@/components/v1/feedbacks/feedback-category/feedback-category';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'settings.update'}>
      <FeedbackCategory />;
    </PermissionValidator>
  );
};

export default page;
