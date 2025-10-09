import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { LoginRequest, LoginResponse } from '@/interface/auth';

// Get employee Login
export const Login = async (data: LoginRequest) => {
  return requestAPI<LoginResponse>('post', 'v1', 'auth', 'employee-login', data);
};

<<<<<<< Updated upstream
// export const Logout = async () => {
//   return requestAPI<>('post');
// };
=======
// Logout API
export const Logout = async () => {
  return requestAPI<LogoutResponse>('post', 'v1', 'auth', 'employee-logout');
};

// 
>>>>>>> Stashed changes
