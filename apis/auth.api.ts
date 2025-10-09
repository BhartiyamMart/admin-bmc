import { requestAPI } from '@/lib/axios';
import { LoginRequest, LoginResponse, LogoutResponse } from '@/interface/auth';

// Get employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>('post', 'v1', 'auth', 'employee-login', data);
};

// Logout API
export const Logout = async () => {
  return requestAPI<LogoutResponse>('post', 'v1', 'auth', 'employee-logout');
};

