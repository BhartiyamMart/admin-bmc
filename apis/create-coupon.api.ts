import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';

export const createCoupon = async (payload: {
  code: string;
  title: string;
  description: string;
  type: string;
  discountValue: number;
  status: string;
  expiryType: string;
  validFrom: string; // format: "DD-MM-YYYY"
  validUntil: string;
  relativeDays: number;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  eligibleCities: string[];
  eligibleUserTypes: string[];
  isAutoApplied: boolean;
  couponImage: string; // URL or base64 string
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-coupon', payload);
};

export const getCoupons = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-all-coupons');
};

export const deleteCoupon = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-coupon', { id });
};
export const updateCoupon = async (payload: {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  discountValue: number;
  status: string;
  expiryType: string;
  validFrom: string; // format: "DD-MM-YYYY"
  validUntil: string;
  relativeDays: number;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  eligibleCities: string[];
  eligibleUserTypes: string[];
  isAutoApplied: boolean;

  couponImage: string; // URL or base64 string
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-coupon', payload);
};

export const getCouponById = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-coupon', { id });
};

export const getActiveCoupons = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-active-coupons');
};
