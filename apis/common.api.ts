import {
  IEditEmployeeMasterDataRES,
  IGenerateEmployeeIdRES,
  IGetLocationRES,
  IGetPermissionsByRolesRES,
  IPreSignedUrlRES,
} from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

export const getMasterData = async () => {
  return requestAPI<IEditEmployeeMasterDataRES>('get', 'v1', 'master/admin', 'edit-employee-master-data');
};

export const getPreSignedUrl = async (
  fileName: string,
  fileType: string,
  fileSize: number,
  category: string,
  entityType: string
) => {
  return requestAPI<IPreSignedUrlRES>('post', 'v1', 'upload', 'initiate-file', {
    fileName,
    fileType,
    fileSize,
    category,
    entityType,
  });
};

export const getPermissionsByRoleRES = async (roleId: string) => {
  return requestAPI<IGetPermissionsByRolesRES>('post', 'v1', 'master/admin', 'edit-employee-permissions-by-role', {
    roleId,
  });
};

export const generateEmployeeId = async () => {
  return requestAPI<IGenerateEmployeeIdRES>('post', 'v1', 'master/admin', 'generate-employee-code');
};

export const getLocations = async (locationType: string, status = true) => {
  return requestAPI<IGetLocationRES>('post', 'v1', 'master/admin', 'edit-employee-locations', { locationType, status });
};
