import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';

export const getAllCustomers = async (page: number, limit: number) => {
  return requestAPI<Response>('post', 'v1', 'employee', 'all-customers', { page, limit });
};
export const viewCustomerDetails = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'customer-details', { id });
};

export const deleteCustomer = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'employee', 'delete-customer', { id });
};
