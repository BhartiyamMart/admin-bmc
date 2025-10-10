import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createEmployeePermission = async (payload:{name:string,status:boolean,description:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'admin',
    'create-employee-permission',
    payload
  );
};


export const getEmployeePermission = async (id:string) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'admin',
    'get-all-permissions',
    {roleId:id}
    );
};
export const assignEmployeePermission = async (data:{employeeId:string,permissionId:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'admin',
    'assign-employee-permission',
    data
    );
};
export const deleteEmployeePermission = async (data:{id:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'delete',
    'v1',
    'admin',
    'delete-permission',
    data
    );
};
export const updateEmployeePermission = async (data:{id:string,name:string,description:string}) => {
  return requestAPI<ApiResponse<Response>>(
    'patch',
    'v1',
    'admin',
    'update-permission',
    data
    );
};