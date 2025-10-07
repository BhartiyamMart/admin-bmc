import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createOrder = async (payload: { orderNumber: string;
  customerId: string;       // UUID format string
  storeId: string;
  addressId: string;        // UUID format string
  deliveryPartnerId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  isExpress: boolean;
  timeSlotId: string;
  totalItems: number;
  createdBy: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  estimatedDeliveryDate: string;  
  deliveryInstructionIds: string[];
  deliveryDescription: string;}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-Order', payload);
};

export const getOrders = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-all-orders');
}   

export const deleteOrder = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-order',{id} );
}   

export const updateOrder = async (payload: { id: string; // UUID format 
    orderNumber: string;
    customerId: string;       // UUID format string
    storeId: string;    
    addressId: string;        // UUID format string
    deliveryPartnerId: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    isExpress: boolean; 
    timeSlotId: string;
    totalItems: number;
    createdBy: string;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    totalAmount: number;
    estimatedDeliveryDate: string;
    deliveryInstructionIds: string[];
    deliveryDescription: string;}) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-order', payload);
  }



export const getOrderById = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-order',{id} );
}   