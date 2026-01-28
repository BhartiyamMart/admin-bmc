import { ApiResponse } from '@/interface/api.interface';
import { CustomerDetailsResponse, CustomersListResponse } from '@/interface/customer.interface';
import { requestAPI } from '@/lib/axios';

// ✅ Get all customers with pagination
export const getAllCustomers = async (type: string, page: number, limit: number) => {
  return requestAPI<CustomersListResponse>('post', 'v1', 'user/admin', 'user-list', {
    page,
    type,
    limit,
  });
};

// ✅ Get customer details by ID
export const viewCustomerDetails = async (userId: string): Promise<CustomerDetailsResponse> => {
  return requestAPI<CustomerDetailsResponse['payload']>('post', 'v1', 'user/admin', 'view-user', {
    userId 
  });
};

// ✅ Delete customer
// In @/apis/customer.api.ts
export const deleteCustomer = async (userId: string, data?: { deleteTitle: string; deleteReason: string; permanentDelete : boolean }) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'delete-user', {
    userId,
    ...data,
  });
};

// ✅ Update customer (if you have this endpoint)
export const updateCustomer = async (id: string, data: any) => {
  return requestAPI<any>('patch', 'v1', 'employee', 'update-customer', { id, ...data });
};

export const activateUser = async (userId: string) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'reactivate-user', { userId });
};

export const deactivateUser = async (userId: string) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'deactivate-user', { userId });
};

export const deleteUserReasons = async () => {
  return requestAPI<['']>('get', 'v1', 'master/admin', 'delete-user-reasons');
};
