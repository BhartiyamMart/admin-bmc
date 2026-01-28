import DocumentTypeList from '@/components/v1/employee/DocumentTypeList';
import PermissionValidator from '@/guard/permission-validator';

const page = () => {
  return (
    <PermissionValidator permissions={'settings.view'}>
      <DocumentTypeList />;
    </PermissionValidator>
  )
};

export default page;
