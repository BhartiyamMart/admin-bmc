import { requestAPI } from '@/lib/axios';
import { allStores, ApiResponse, warehouse } from '@/interface/api.interface';
import { 
 RoleResponse, RoleRequest, DeleteRequest, UpDateRequest
 
} from '@/interface/employee.interface';

// Get employee role
export const getEmployeeRole = async () => {
  return requestAPI<ApiResponse<RoleResponse>>(
    'get',
    'v1',
    'admin',
    'get-employee-roles',
  );
};
export const createEmployeeRole = async (data: {name:string,status:boolean}) => {
  return requestAPI<ApiResponse<RoleRequest>>(
    'post',
    'v1',
    'admin',
    'create-employee-role',
     data
  );
};

export const deleteEmployeeRole = async (data: {id:string}) => {
  return requestAPI<ApiResponse<DeleteRequest>>(
    'post',
    'v1',
    'admin',
    'delete-employee-role',
     data
  );
};
export const updateEmployeeRole = async (data:{id:string, name:string, status:boolean}) => {
  return requestAPI<ApiResponse<UpDateRequest>>(
    'patch',
    'v1',
    'admin',
    'update-employee-role',
     data
  );
};


export const getWarehouses = async () => {
  return requestAPI<warehouse>(
    'get',
    'v1',
    'admin',
    'get-all-warehouse',
  );
};


export const getStores = async () => {
  return requestAPI<allStores>(
    'get',
    'v1',
    'admin',
    'get-all-store',
  );
};