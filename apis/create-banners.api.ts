import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createBanner = async (payload: { title: string;
  tag: string;
  priority: number; // Use number, but ensure it matches the intended range
  imageUrlSmall: string;
  imageUrlMedium: string;
  imageUrlLarge: string;
  bannerUrl: string;
  description: string;
  isActive: boolean; }) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-banner', payload);
};


export const getBanner = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-all-banners');
};
export const deleteBanner = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-banner',{id} );
}

export const updateBanner = async (payload: { id: string;
    title: string;
    tag: string;
    priority: number; // Use number, but ensure it matches the intended range
    imageUrlSmall: string;
    imageUrlMedium: string;
    imageUrlLarge: string;
    bannerUrl: string;
    description: string;
    isActive: boolean; }) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-banner', payload);
  }

export const getActiveBanners = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-active-banners');
}   

export const getBannerById = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-banner-by-id',{id} );
}