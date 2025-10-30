export interface LoginRequest {
  employeeId?: string;
  email?: string;
  password: string;
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
  lastName?: string;
  warehouseId?: string | null;
  storeId?: string | null;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  employee: Employees;
}

export interface SendOtpRequest {
  otpType: string;
  deliveryMethod: 'email' | 'sms';
  recipient: string;
}

export interface VerifyOtpRequest {
  otpType: string;
  recipient: string;
  otp: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface CommonResponse {
  message: string;
  success: boolean;
  token: string;
  data: { token: string; employee: Employees };
}