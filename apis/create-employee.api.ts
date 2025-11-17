import { requestAPI } from '@/lib/axios';
import { EmployeeApiResponse, EmployeeResponse } from '@/interface/employeelList';
import { Employee, EmployeePayload } from '@/interface/employee.interface';

// Get employee role
export const createEmployee = async (payload: {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
  roleId: string;
  email?: string;
  storeId?: string;
  warehouseId?: string;
  phoneNumber: string;
  password: string;
  permissionIds: string[];
}) => {
  return requestAPI<Response>('post', 'v1', 'employee', 'create-employee', payload);
};

export const getEmployee = async (limit: number, page: number) => {
  return requestAPI<EmployeeApiResponse>('post', 'v1', 'employee', 'get-all-employees', { limit, page });
};

export const generateEmployeeId = async () => {
  return requestAPI<{ employeeId: string }>('post', 'v1', 'employee', 'generate-employee-id');
};

export const getEmployeeById = async (employeeId: string) => {
  return requestAPI<EmployeePayload>('post', 'v1', 'employee', 'get-employee-by-id', { employeeId });
};
export const updateEmployee = async (employeeId: string, employepersonalData: {}) => {
  return requestAPI<EmployeeResponse>('patch', 'v1', 'employee', 'update-employee', {
    employeeId,
    ...employepersonalData,
  });
};

export const deleteEmployee = async (id: string, permanentdelete: boolean) => {
  return requestAPI<EmployeeApiResponse>('delete', 'v1', 'employee', 'delete-employee', {
    employeeId: id,
    permanentDelete: permanentdelete,
  });
};
