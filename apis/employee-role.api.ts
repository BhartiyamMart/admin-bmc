import { requestAPI } from '@/lib/axios';

import { RoleResponse, RoleRequest, DeleteRequest, UpDateRequest } from '@/interface/employee.interface';
import { StoreResponse, WarehouseListResponse } from '@/interface/common.interface';

// Get employee role
export const getEmployeeRole = async () => {
  return requestAPI<RoleResponse>('post', 'v1', 'employee', 'get-employee-roles', {});
};
export const createEmployeeRole = async (data: { name: string; status: boolean }) => {
  return requestAPI<RoleRequest>('post', 'v1', 'employee', 'create-employee-role', data);
};

export const deleteEmployeeRole = async (data: { id: string }) => {
  return requestAPI<DeleteRequest>('delete', 'v1', 'employee', 'delete-employee-role', data);
};
export const updateEmployeeRole = async (data: { id: string; name: string; status: boolean }) => {
  return requestAPI<UpDateRequest>('patch', 'v1', 'employee', 'update-employee-role', data);
};

export const getWarehouses = async () => {
  return requestAPI<WarehouseListResponse>('get', 'v1', 'employee', 'get-all-warehouse');
};

export const getStores = async () => {
  return requestAPI<StoreResponse>('post', 'v1', 'employee', 'get-all-store', {});
};
