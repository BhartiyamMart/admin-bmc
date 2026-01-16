import { ApiResponse } from '@/interface/api.interface';
import { CouponPayload } from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

export const createCoupon = async (payload: {
  code: string;
  title: string;
  description: string[];
  type: string;
  discountUnit: string;
  maxDiscountValue: number;
  minPurchaseAmount: number;
  minQuantity: number;
  usagePerPerson: number;
  currentUsageCount: number;
  status: string;
  expiryType: string;
  validFrom: string; // format: "DD-MM-YYYY"
  validUntil: string;
  relativeDays: number;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  isAutoApplied: boolean;
  createdAt: string;
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'create-coupon', payload);
};

export const getCoupons = async () => {
  return requestAPI<CouponPayload>('post', 'v1', 'employee', 'get-all-coupons', {});
};

export const deleteCoupon = async (id: string, permanentDelete: boolean = false) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'employee', 'delete-coupon', { id, permanentDelete });
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
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'employee', 'update-coupon', payload);
};

export const getCouponById = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee ', 'get-coupon', { id });
};

export const getActiveCoupons = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'employee', 'get-active-coupons');
};
