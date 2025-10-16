import { ApiResponse } from '@/interface/api.interface';
import axios from 'axios';
import { getAuthState } from '@/store/auth.store'; // Import getAuthState

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - reads token from Zustand store
API.interceptors.request.use(
  async (config) => {
    // Get token from Zustand store instead of localStorage
    const { bmctoken } = getAuthState();

    if (bmctoken) {
      config.headers['Authorization'] = `Bearer ${bmctoken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for token refresh/logout on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      const { logout } = getAuthState();
      logout();

      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const buildUrl = (version: string = 'v1', service: string, endpoint: string) => {
  return `${version}/${service}/${endpoint}`;
};

export const requestAPI = async <
  TPayload,
  TData = unknown,
  TParams extends Record<string, string | number | boolean> = {},
>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  version: string,
  service: string,
  endpoint: string,
  data?: TData,
  params?: TParams
): Promise<ApiResponse<TPayload>> => {
  const url = buildUrl(version, service, endpoint);

  try {
    const response = await API.request<ApiResponse<TPayload>>({
      method,
      url,
      data,
      params,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as ApiResponse<TPayload>;
    }

    return {
      error: true,
      status: 500,
      message: 'Unexpected error occurred.',
      payload: {} as TPayload,
    };
  }
};

export default API;
