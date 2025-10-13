import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { 
  EmployeeApiResponse,
 
 
} from '@/interface/employeelList';

// Get employee role
export const createEmployee = async (payload:{firstName: string, middleName?: string, lastName?: string, employeeId:string, roleId:string, email:string, storeId:string | null, warehouseId:string | null, phoneNumber:string, password:string }) => {
  return requestAPI<Response>(
    'post',
    'v1',
    'admin',
    'create-employee',
    payload
  );
};
export const getEmployee = async () => {
 return requestAPI<EmployeeApiResponse>(
  'get',
  'v1',
  'admin',
  'get-all-employees'
);
};

export const generateEmployeeId = async () => {
 return requestAPI<{employeeId:string}>(
  'post',
  'v1',
  'admin',
  'generate-employee-id'
);
};