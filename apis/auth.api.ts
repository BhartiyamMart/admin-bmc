import { requestAPI } from '@/lib/axios';
import { LoginRequest, LoginResponse, LogoutResponse } from '@/interface/auth';
import { DashboardApiResponse, Employee } from '@/interface/common.interface';
import { ApiResponse } from '@/interface/api.interface';

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
  data: { token: string; employee: Employee };
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
  return requestAPI<CommonResponse>('post', 'v1', 'auth', 'employee/send-otp', data);
};

// 2️⃣ Verify OTP
export const VerifyOtp = async (otp: string, recipient: string) => {
  return requestAPI<CommonResponse>('post', 'v1', 'auth', 'employee/verify-otp', { otp, recipient });
};

// 3️⃣ Reset Password (with Authorization header)
export const ResetPassword = async (newPassword: string) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'auth',
    'employee/reset-password', // ✅ combine into a single endpoint
    { newPassword } // POST body
  );
};

export const DashboardData = async (data: { from: string; to: string }) => {
  return requestAPI<DashboardApiResponse>('post', 'v1', 'employee', 'dashboard-stats-by-date', data);
};
