import {
  BannerApiResponse,
  BannersPayload,
  PresignedUrlResponse,
  PrioritiesPayload,
  TagResponse,
  UpdateBannerPayload,
  BannerByIdPayload,
} from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

// ✅ Create presigned URL
export const createPreassignedUrl = async (payload: {
  fileName: string;
  fileType: string;
}): Promise<PresignedUrlResponse> => {
  const body = { ...payload, folder: '/uploads' };
  return requestAPI<PresignedUrlResponse['payload']>(
    'post',
    'v1',
    'upload',
    'generate-presigned-url',
    body
  ) as Promise<PresignedUrlResponse>;
};

// ✅ Create banner
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
  return requestAPI<any>('post', 'v1', 'banner', 'create-banner', payload);
};

// ✅ Get all banners
export const getBanner = async (): Promise<BannerApiResponse> => {
  return requestAPI<BannerApiResponse['payload']>(
    'get',
    'v1',
    'banner',
    'get-all-banners'
  ) as Promise<BannerApiResponse>;
};

// ✅ Delete banner
export const deleteBanner = async (id: string, permanentDeleteBanner: boolean) => {
  return requestAPI<any>('delete', 'v1', 'banner', 'delete-banner', {
    id,
    isPermanent: permanentDeleteBanner,
  });
};

// ✅ Update banner
export const updateBanner = async (payload: UpdateBannerPayload) => {
  return requestAPI<any>('patch', 'v1', 'banner', 'update-banner', payload);
};

// ✅ Get active banners
export const getActiveBanners = async () => {
  return requestAPI<any>('get', 'v1', 'banner', 'get-active-banners');
};

// ✅ Get banner by ID
export const getBannerById = async (id: string): Promise<BannersPayload> => {
  return requestAPI<BannerByIdPayload>('post', 'v1', 'banner', 'get-banner', { id }) as Promise<BannersPayload>;
};

// ✅ Get all tags
export const getAllTags = async (): Promise<TagResponse> => {
  return requestAPI<TagResponse['payload']>('get', 'v1', 'banner', 'all-tags') as Promise<TagResponse>;
};

// ✅ Get priorities by tag
export const getPrioritiesByTag = async (tag: string): Promise<PrioritiesPayload> => {
  return requestAPI<PrioritiesPayload['payload']>('post', 'v1', 'banner', 'all-priorities', {
    tag,
  }) as Promise<PrioritiesPayload>;
};
