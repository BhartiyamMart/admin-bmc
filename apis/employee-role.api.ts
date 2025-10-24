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
    'employee',
    'get-employee-roles',
  );
};
export const createEmployeeRole = async (data: {name:string,status:boolean}) => {
  return requestAPI<ApiResponse<RoleRequest>>(
    'post',
    'v1',
    'employee',
    'create-employee-role',
     data
  );
};

export const deleteEmployeeRole = async (data: {id:string}) => {
  return requestAPI<ApiResponse<DeleteRequest>>(
    'post',
    'v1',
    'employee',
    'delete-employee-role',
     data
  );
};
export const updateEmployeeRole = async (data:{id:string, name:string, status:boolean}) => {
  return requestAPI<ApiResponse<UpDateRequest>>(
    'patch',
    'v1',
    'employee',
    'update-employee-role',
     data
  );
};


export const getWarehouses = async () => {
  return requestAPI<warehouse>(
    'get',
    'v1',
    'employee',
    'get-all-warehouse',
  );
};


export const getStores = async () => {
  return requestAPI<allStores>(
    'get',
    'v1',
    'employee',
    'get-all-store',
  );
};