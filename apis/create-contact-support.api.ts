import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createContactSupport = async (payload: { title: string;
  description: string;
  name: string;
  phoneNumber: string; 
  link: string;
  iconImageUrl: string;
  address: string;}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-contactsupport', payload);
};


export const getContactSupports = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-contactsupport');
}   
export const deleteContactSupport = async (id:string) => {
    return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-contactsupport',{id} );   
    }
export const updateContactSupport = async (payload: { id: string;
    title: string;
    description: string;
    name: string;   
    phoneNumber: string; 
    link: string;
    iconImageUrl: string;
    address: string;}) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-contactsupport', payload);
  }