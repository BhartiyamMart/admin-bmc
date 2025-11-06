// employee.interface.ts

export interface roles {
  id: string;
  name: string;
  hierarchyOrder: number;
  status: boolean;
}

export interface RoleResponse {
  error: boolean;
  status: number;
  message: string;
  roles: roles[];
  permissions: string[];
}

export interface RoleRequest {
  name: string;
  staus: boolean;
}

export interface DeleteRequest {
  id: string;
}

export interface UpDateRequest {
  id: string;
  name: string;
  staus: boolean;
}

export interface RoleDetails {
  id: string;
  name: string;
  hierarchyOrder: number;
  status: boolean;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName: string | null;
  gender: string | null;
  documents: any[];  // Change from [] to any[]
  permissions: any[];  // Change from [] to any[]
  wallet: number | null;  // Add null as possible value
  dateOfBirth: string | null;
  address: string | null;
  department: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  storeId: string | null;  // Add null
  warehouseId: string | null;
  managerId: string | null;
  manager: string | null;
  status: boolean;
  deliveryStatus: string;
  createdAt: string;
  roleDetails: RoleDetails;
}

export interface EmployeePayload {
  employee: Employee;
  profile: any | null;
  documents: any[];
  permissions: any[];
  wallet: any | null;
  deliveryPerformance?: any | null;  // Make optional
}

// Generic API wrapper
export interface ApiResponse<T> {
  error: boolean;
  status: number;
  message: string;
  payload: T;
}
