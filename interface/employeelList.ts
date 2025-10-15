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


// A simple in-memory employee list (will reset on server restart)
export const employeeList: Employees[] = [];

// Function to add employee
export function addEmployee(employee: Employees) {
  employeeList.push(employee);
}
