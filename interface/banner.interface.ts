export interface IBannerImage {
  url: string;
  fileName: string;
}

export interface IBanner {
  id: string;
  title: string;
  tag: string;
  priority: number;
  bannerUrl: string;
  description?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  imageSmall: IBannerImage;
  imageLarge: IBannerImage;
}

export interface IGetAllBannersREQ {
  page: number;
  limit: number;
  tag?: string;
  status?: boolean;
}

export interface IGetAllBannersRES {
  banners: IBanner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGetBannerByIdRES {
  banner: IBanner;
}

// For the flattened table view
export interface FlattenedBanner {
  id: string;
  title: string;
  tag: string;
  priority: number;
  bannerUrl: string;
  description?: string;
  imageUrlSmall: string;
  imageUrlLarge: string;
  status: boolean;
}

export interface ICreateBannerREQ {
  title: string;
  tag: string;
  priority?: number;
  imageUrlSmall: string;
  imageUrlLarge: string;
  bannerUrl: string;
  description: string;
  isActive: boolean;
}

export interface IEditBannerREQ {
  title: string;
  tag: string;
  priority?: number;
  imageUrlSmall: string;
  imageUrlLarge: string;
  bannerUrl: string;
  description: string;
  isActive: boolean;
}
// interface/banner.interface.ts

export interface ITag {
  value: string;
  label: string;
}

export interface ITagResponse {
  tags: ITag[];
}
