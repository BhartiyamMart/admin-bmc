import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';

export const createOffer = async (payload: {
  storeId: string;
  title: string;
  description: string;
  shortDescription: string;
  type: string;
  discountValue: number;
  discountUnit: string;
  minPurchaseAmount: number;
  minQuantity: number;
  status: string;
  startDateTime: string;
  endDateTime: string;
  totalUsageLimit: number;
  usagePerUser: number;
  targetAudience: string[];
  eligibleCities: string[];
  excludedUsers: string[];
  offerImage: string;
  thumbnailImage: string;
  offerImages: string[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-offer', payload);
};

export const getOffers = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-all-offers');
};
export const deleteOffer = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-offer', { id });
};
export const updateOffer = async (payload: {
  id: string;
  storeId: string;
  title: string;
  description: string;
  shortDescription: string;
  type: string;
  discountValue: number;
  discountUnit: string;
  minPurchaseAmount: number;
  minQuantity: number;
  status: string;
  startDateTime: string;
  endDateTime: string;
  totalUsageLimit: number;
  usagePerUser: number;
  targetAudience: string[];
  eligibleCities: string[];
  excludedUsers: string[];
  offerImage: string;
  thumbnailImage: string;
  offerImages: string[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  termsAndConditions: string;
}) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-offer', payload);
};

export const getActiveOffers = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-active-offers');
};

export const getOfferById = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-offer', { id });
};

export const getOffersByStoreId = async (storeId: string) => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-offers-by-store', { storeId });
};
