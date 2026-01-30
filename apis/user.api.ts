import { ApiResponse } from '@/interface/api.interface';
import { IUserListResponse, IUserViewApiResponse } from '@/interface/user.interface';
import { requestAPI } from '@/lib/axios';

// ✅ Get all customers with pagination
export const getAllUsers = async (type: string, page: number, limit: number, includeEmployees = false) => {
  return requestAPI<IUserListResponse>('post', 'v1', 'user/admin', 'user-list', {
    page,
    type,
    includeEmployees,
    limit,
  });
};

// ✅ Get customer details by ID
export const viewUserDetails = async (userId: string, type: string) => {
  return requestAPI<IUserViewApiResponse>('post', 'v1', 'user/admin', 'view-user', {
    userId,
    type,
  });
};

// ✅ Delete customer
// In @/apis/customer.api.ts
export const deleteCustomer = async (
  userId: string,
  data?: { deleteTitle: string; deleteReason: string; permanentDelete: boolean }
) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'delete-user', {
    userId,
    ...data,
  });
};

// ✅ Update customer (if you have this endpoint)
export const updateCustomer = async (id: string, data: any) => {
  return requestAPI<any>('patch', 'v1', 'employee', 'update-customer', { id, ...data });
};

export const activateUser = async (userId: string, reason: string) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'reactivate-user', { userId, reason });
};

export const deactivateUser = async (userId: string, reason: string) => {
  return requestAPI<any>('post', 'v1', 'user/admin', 'deactivate-user', { userId, reason });
};

export const deleteUserReasons = async (type: string) => {
  return requestAPI<['']>('post', 'v1', 'master/admin', 'delete-user-reasons', { type });
};
