import {
  IBanner,
  ICreateBannerREQ,
  IEditBannerREQ,
  IGetAllBannersREQ,
  IGetAllBannersRES,
  IGetBannerByIdRES,
  ITagResponse,
} from '@/interface/banner.interface';
import { PrioritiesPayload } from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

// ✅ Create banner

export const getAllTags = async () => {
  return requestAPI<ITagResponse>('get', 'v1', 'master/admin', 'banner-tags');
};

export const createBanner = async (payload: ICreateBannerREQ) => {
  return requestAPI<any>('post', 'v1', 'banner/admin', 'edit-banners', payload);
};

export const editBanner = async (bannerId: string, payload: IEditBannerREQ) => {
  return requestAPI<any>('put', 'v1', 'banner/admin', `edit-banners/${bannerId}`, payload);
};

export const getBannerById = async (bannerId: string) => {
  return requestAPI<IGetBannerByIdRES>('post', 'v1', 'banner/admin', 'get-banner', { bannerId });
};

export const getAllBanners = async (params: IGetAllBannersREQ) => {
  return requestAPI<IGetAllBannersRES>('post', 'v1', 'banner/admin', 'list-banners', params);
};

export const deleteBanner = async (bannerId: string) => {
  return requestAPI<any>('post', 'v1', 'banner/admin', `delete-banner`, { bannerId });
};
// ✅ Get active banners
export const deactivateBanner = async (bannerId: string, reason: string) => {
  return requestAPI<any>('post', 'v1', 'banner/admin', `deactivate-banner`, { bannerId, reason });
};

export const reActivateBanner = async (bannerId: string) => {
  return requestAPI<any>('post', 'v1', 'banner/admin', `reactivate-banner`, { bannerId });
};

// ✅ Get priorities by tag
export const getPrioritiesByTag = async (tag: string): Promise<PrioritiesPayload> => {
  return requestAPI<PrioritiesPayload['payload']>('post', 'v1', 'banner', 'all-priorities', {
    tag,
  }) as Promise<PrioritiesPayload>;
};
