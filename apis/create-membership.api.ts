import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createMembership = async (payload: {  name: string;
  description: string;
  icon: string;
  color: string; 
  sortOrder: number;
  isActive: boolean;}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-membership', payload);
};

export const getMemberships = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-all-memberships');
}
export const deleteMembership = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-membership',{id} );
}
export const updateMembership = async (payload: { id: string;
    name: string;
    description: string;
    icon: string;   
    color: string;
    sortOrder: number;
    isActive: boolean;}) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-membership', payload);
  }


export const createMembershiptier = async (payload: {   memberShipId: string; // UUID format
  sortOrder: number;
  isActive: boolean;
  validityDays: number;
  amount: number;
  description: string[];}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-membership-tier', payload);
};


export const deleteMembershiptier = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-membership-tier',{id} );
}   
export const updateMembershiptier = async (payload: { id: string; // UUID format
    memberShipId: string; // UUID format
    sortOrder: number;              
    isActive: boolean;
    validityDays: number;
    amount: number;
    description: string[];}) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-membership-tier', payload);
  }