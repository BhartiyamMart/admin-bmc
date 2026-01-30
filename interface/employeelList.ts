// /data/employeeList.ts

export interface Employees {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber: string;
  roleId: string;
  role: string;
  storeId?: string | null;
  warehouseId?: string | null;
  status: boolean;
  passwordCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

export interface EmployeeApiResponse {
  error: boolean;
  status: number;
  message: string;
  employees: Employees[];
  totalCount: number;
}
