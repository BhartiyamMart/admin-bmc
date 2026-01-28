import { requestAPI } from '@/lib/axios';
import { LogoutResponse } from '@/interface/auth';
import { DashboardStatsData, ISidebarRES } from '@/interface/common.interface';
import { ApiResponse } from '@/interface/api.interface';
import { CommonResponse, LoginRequest, LoginResponse, SendOtpRequest, SendOtpRES } from '@/interface/auth.interface';

// Employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>('post', 'v1', 'auth', 'employee/login', data);
};

// Employee Logout
export const Logout = async () => {
  return requestAPI<LogoutResponse>('post', 'v1', 'auth', 'employee/logout', {});
};

// Send OTP
export const SendOtp = async (data: SendOtpRequest) => {
  return requestAPI<SendOtpRES>('post', 'v1', 'auth/employee', 'request-password-reset', data);
};

// Verify OTP
export const VerifyOtp = async (otp: string, email: string) => {
  return requestAPI<CommonResponse>('post', 'v1', 'auth/employee', 'verify-reset-otp', { otp, email });
};

// Reset Password (with Authorization header)
export const ResetPassword = async (email: string, newPassword: string) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'auth/employee', 'set-new-password', { email, newPassword });
};

export const DashboardData = async (data: { from: string; to: string }) => {
  return requestAPI<DashboardStatsData>('post', 'v1', 'employee', 'dashboard-stats-by-date', data);
};

export const SidebarData = async () => {
  return requestAPI<ISidebarRES>('get', 'v1', 'sidebar/admin', 'get-sidebar');
};
