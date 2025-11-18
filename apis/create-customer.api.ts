import { ApiResponse } from '@/interface/api.interface';
import { CustomerDetailsResponse, CustomersListResponse } from '@/interface/customer.interface';
import { requestAPI } from '@/lib/axios';

// ✅ Get all customers with pagination
export const getAllCustomers = async (page: number, limit: number): Promise<CustomersListResponse> => {
  return requestAPI<CustomersListResponse['payload']>('post', 'v1', 'employee', 'all-customers', {
    page,
    limit,
  }) as Promise<CustomersListResponse>;
};

// ✅ Get customer details by ID
export const viewCustomerDetails = async (id: string): Promise<CustomerDetailsResponse> => {
  return requestAPI<CustomerDetailsResponse['payload']>('post', 'v1', 'employee', 'customer-details', {
    id,
  }) as Promise<CustomerDetailsResponse>;
};

// ✅ Delete customer
export const deleteCustomer = async (id: string) => {
  return requestAPI<any>('delete', 'v1', 'employee', 'delete-customer', { id });
};

// ✅ Update customer (if you have this endpoint)
export const updateCustomer = async (id: string, data: any) => {
  return requestAPI<any>('patch', 'v1', 'employee', 'update-customer', { id, ...data });
};
