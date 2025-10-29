export interface LoginRequest {
  employeeId?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employee: Employees;
}

export interface Payload {
  token: string;
  employee: Employees;
}

export interface Employees {
  id: string;
  employeeId: string;
  email: string;
  status: boolean;
  roleId: string;
  role: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  warehouseId: string | null;
  storeId: string | null;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogoutResponse {}
