import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const getAllCustomers = async () => {
  return requestAPI<Response>('get', 'v1', 'admin', 'list-all');
};