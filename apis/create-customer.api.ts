import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const getAllCustomers = async (page:number, limit:number) => {
  return requestAPI<Response>('post', 'v1', 'employee', 'list-all', {page,limit}

  );
};