import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { 
 LoginResponse,
 
} from '@/interface/auth';

// Get employee Login
export const Login = async (data: { employeeId: string; password: string }) => {
  return requestAPI<ApiResponse<LoginResponse>>(
    'post',
    'v1',
    'auth',
    'employee-login',
     data
  );
};