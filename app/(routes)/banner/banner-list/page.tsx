import BannerList from '@/components/v1/banner/banner-list/banner-list';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'promotions.view'}>
      <BannerList />
    </PermissionValidator>
  );
};

export default page;
