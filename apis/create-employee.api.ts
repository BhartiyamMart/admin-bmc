import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { 
  EmployeeApiResponse,
  EmployeeResponse,
 
 
} from '@/interface/employeelList';

// Get employee role
export const createEmployee = async (payload: {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
  roleId: string;
  email?: string;
  storeId?: string ;
  warehouseId?: string ;
  phoneNumber: string;
  password: string;
  permissionIds: string[];
}) => {
  return requestAPI<Response>(
    'post',
    'v1',
    'admin',
    'create-employee',
    payload
  );
};

export const getEmployee = async (limit:number) => {
 return requestAPI<EmployeeApiResponse>(
  'get',
  'v1',
  'admin',
  'get-all-employees',
  {limit}
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


export const getEmployeeById = async (employeeId: string) => {
  return requestAPI<EmployeeResponse>(
    'post', 
    'v1',
    'admin',
    'get-employee-by-id',
    { employeeId }  
  );
};
export const updateEmployee = async (id:string,data:{}) => {
  return requestAPI<EmployeeResponse>(
  'post',
  'v1',
  'admin',
  'update-employee',
  {id}
  );
}