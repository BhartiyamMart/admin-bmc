import { useAuthStore } from '@/store/auth.store';
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
    const encryptedToken = useAuthStore.getState().token;
    if (encryptedToken) {
      try {
        config.headers['Authorization'] = `Bearer ${encryptedToken}`;
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
  TResponse,
  TData = unknown,
  TParams = Record<string, string | number | boolean>
>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  version: string,
  service: string,
  endpoint: string,
  data?: TData,
  params?: TParams
):Promise<TResponse> => {
  try {
    const url = buildUrl(version, service, endpoint);
    const response = await API.request({ method, url, data, params });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export default API;
