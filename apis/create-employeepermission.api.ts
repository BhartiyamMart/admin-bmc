import { ApiResponse, permissions, roles } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createEmployeePermission = async (payload:{name:string,status:boolean,description:string}) => {
  return requestAPI<roles>(
    'post',
    'v1',
    'employee',
    'create-employee-permission',
    payload
  );
};


export const getEmployeePermission = async (id:string) => {
  return requestAPI<permissions>(
    'post',
    'v1',
    'employee',
    'get-all-permissions',
    {roleId:id}
    );
};
export const assignEmployeePermission = async (data:{employeeId:string,permissionId:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'employee',
    'assign-employee-permission',
    data
    );
};
export const deleteEmployeePermission = async (data:{id:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'delete',
    'v1',
    'employee',
    'delete-permission',
    data
    );
};
export const updateEmployeePermission = async (data:{id:string,name:string,description:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'patch',
    'v1',
    'employee',
    'update-permission',
    data
    );
};