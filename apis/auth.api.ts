import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { LoginRequest, LoginResponse } from '@/interface/auth';

// Get employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>('post', 'v1', 'auth', 'employee-login', data);
};

// export const Logout = async () => {
//   return requestAPI<>('post');
// };