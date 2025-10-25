import { requestAPI } from '@/lib/axios';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from '@/interface/auth';
import { EmployeeApiResponse } from '@/interface/employeelList';
import { Employee } from '@/interface/common.interface';

// Optional interface additions (if you haven’t defined them yet)
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
  data:{token:string, employee:Employee}
}

// ===============================
// 🔐 Authentication APIs
// ===============================

// Employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>('post', 'v1', 'auth', 'employee/login', data);
};

// Employee Logout
export const Logout = async () => {
  return requestAPI<LogoutResponse>('post', 'v1', 'auth', 'employee/logout', {});
};

// ===============================
// 🔄 Password Recovery (OTP-based)
// ===============================

// 1️⃣ Send OTP
export const SendOtp = async (data: SendOtpRequest) => {
  return requestAPI<CommonResponse>(
    'post',
    'v1',
    'auth',
    'employee/send-otp',
    data
  );
};

// 2️⃣ Verify OTP
export const VerifyOtp = async (otp:string, recipient:string) => {
  return requestAPI<CommonResponse>(
    'post',
    'v1',
    'auth',
    'employee/verify-otp',
    { otp, recipient }
  );
};

// 3️⃣ Reset Password (with Authorization header)
export const ResetPassword = async (newPassword:string) => {
  return requestAPI<CommonResponse>(
    'post',
    'v1',
    'auth',
    'employee',
    'reset-password',
    {newPassword},
   
  );
};

export const dashboardData = async ()=>{
  return requestAPI<EmployeeApiResponse>(
  'get',
    'v1',
    'employee',
    'dashboard-stats',
  )

}