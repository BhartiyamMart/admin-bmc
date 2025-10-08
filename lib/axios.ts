import { ApiResponse } from '@/interface/api.interface';
import axios from 'axios';


const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

API.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN!);
    if (token) {
      try {
        config.headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
          console.error('Error attaching token to request:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 

export const buildUrl = (version: string = 'v1', service: string, endpoint: string) => {
  return `${version}/${service}/${endpoint}`;
};

export const requestAPI = async <
  TPayload,
  TData = unknown,
  TParams extends Record<string, string | number | boolean> = {}
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
      // Assume backend returns ApiResponse<TPayload> even on error
      return error.response.data as ApiResponse<TPayload>;
    }

    // Handle unexpected errors (network, timeout, etc.)
    return {
      error: true,
      status: 500,
      message: 'Unexpected error occurred.',
      payload: {} as TPayload, // Force an empty payload of the expected shape
    };
  }
};

export default API;
