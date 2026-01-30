import { requestAPI } from '@/lib/axios';
import { EmployeeApiResponse } from '@/interface/employeelList';
import { Employee, EmployeePayload, ICreateEmployeePayload } from '@/interface/employee.interface';

// Get employee role
export const createEmployee = async (payload: ICreateEmployeePayload) => {
  return requestAPI<Response>('post', 'v1', 'user/admin', 'edit-employee', payload);
};

export const getEmployee = async () => {
  return requestAPI<EmployeeApiResponse>('post', 'v1', 'employee', 'get-all-employees', {});
};

export const getEmployeeById = async (employeeId: string) => {
  return requestAPI<EmployeePayload>('post', 'v1', 'employee', 'get-employee-by-id', { employeeId });
};
// export const updateEmployee = async (employeeId: string, employepersonalData: {}) => {
//   return requestAPI<EmployeeResponse>('patch', 'v1', 'employee', 'update-employee', {
//     employeeId,
//     ...employepersonalData,
//   });
// };

export const deleteEmployee = async (id: string, permanentdelete: boolean) => {
  return requestAPI<EmployeeApiResponse>('delete', 'v1', 'employee', 'delete-employee', {
    employeeId: id,
    permanentDelete: permanentdelete,
  });
};

export const updateEmployeePassword = async (employeeId: string, newPassword: string) => {
  return requestAPI<Response>('patch', 'v1', 'employee', 'update-password', {
    employeeId,
    newPassword,
  });
};
