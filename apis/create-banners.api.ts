import { ApiResponse } from '@/interface/api.interface';
import {
  BannerApiResponse,
  BannersPayload,
  PresignedUrlResponse,
  PrioritiesPayload,
  TagResponse,
} from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

export const createPreassignedUrl = async (payload: { fileName: string; fileType: string }) => {
  const body = { ...payload, folder: '/uploads' };
  return requestAPI<PresignedUrlResponse>('post', 'v1', 'upload', 'generate-presigned-url', body);
};
export const createBanner = async (payload: {
  title: string;
  tag: string;
  priority?: number;
  imageUrlSmall: string;
  imageUrlMedium: string;
  imageUrlLarge: string;
  bannerUrl: string;
  description: string;
  isActive: boolean;
}) => {
  return requestAPI<ApiResponse<Response>>(
    'post',
    'v1',
    'banner', // ✅ keep this based on your working curl
    'create-banner',
    payload
  );
};

export const getBanner = async () => {
  return requestAPI<BannerApiResponse>('get', 'v1', 'banner', 'get-all-banners');
};
export const deleteBanner = async (id: string, permanentDeleteBanner: boolean) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'banner', 'delete-banner', {
    id,
    isPermanent: permanentDeleteBanner as false,
  });
};

export const updateBanner = async (payload: {
  id?: string;
  title?: string;
  tag?: string;
  priority?: number; // Use number, but ensure it matches the intended range
  imageUrlSmall?: string;
  imageUrlMedium?: string;
  imageUrlLarge?: string;
  bannerUrl?: string;
  description?: string;
  isActive?: boolean;
}) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'banner', 'update-banner', payload);
};

export const getActiveBanners = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'banner', 'get-active-banners');
};

export const getBannerById = async (id: string) => {
  return requestAPI<BannersPayload>('post', 'v1', 'banner', 'get-banner', { id });
};

export const getAllTags = async () => {
  return requestAPI<TagResponse>('get', 'v1', 'banner', 'all-tags');
};

export const getPrioritiesByTag = async (tag: string) => {
  return requestAPI<PrioritiesPayload>('post', 'v1', 'banner', 'all-priorities', { tag });
};
