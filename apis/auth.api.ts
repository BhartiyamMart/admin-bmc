import { requestAPI } from '@/lib/axios';
import { LogoutResponse } from '@/interface/auth';
import { DashboardStatsData } from '@/interface/common.interface';
import { ApiResponse } from '@/interface/api.interface';
import { CommonResponse, LoginRequest, LoginResponse, SendOtpRequest } from '@/interface/auth.interface';

// Employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>(
    'post', 'v1', 'auth', 'employee/login', data
  );
};

// Employee Logout
export const Logout = async () => {
  return requestAPI<LogoutResponse>(
    'post', 'v1', 'auth', 'employee/logout', {}
  );
};

// Send OTP
export const SendOtp = async (data: SendOtpRequest) => {
  return requestAPI<CommonResponse>(
    'post', 'v1', 'auth', 'employee/send-otp', data
  );
};

// Verify OTP
export const VerifyOtp = async (otp: string, recipient: string) => {
  return requestAPI<CommonResponse>(
    'post', 'v1', 'auth', 'employee/verify-otp', { otp, recipient }
  );
};

// Reset Password (with Authorization header)
export const ResetPassword = async (newPassword: string) => {
  return requestAPI<ApiResponse<Response>>(
    'post', 'v1', 'auth', 'employee/reset-password', { newPassword }
  );
};

export const DashboardData = async (data: { from: string; to: string }) => {
  return requestAPI<DashboardStatsData>(
    'post', 'v1', 'employee', 'dashboard-stats-by-date', data
  );
};
