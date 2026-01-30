import React, { ReactNode } from 'react';
import { RoleResponse } from './employee.interface';

export interface ApiResponse<T> {
  error: boolean;
  status: number;
  message: string;
  payload: T;
}

// ==================== GENERIC TABLE INTERFACES ====================
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

export interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  sortConfig?: { key: string | null; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

export type TableAction<T> =
  | {
      variant: 'icon';
      icon: ReactNode;
      onClick: (row: T) => void;
      className?: string;
      label?: never;
    }
  | {
      variant?: 'button';
      label: string;
      onClick: (row: T) => void;
      className?: string;
      icon?: never;
    };

export interface SearchFilter {
  enabled: boolean;
  placeholder?: string;
  searchKeys: string[];
}

export interface StatusFilter<T> {
  enabled: boolean;
  options: { label: string; value: string | boolean | null }[];
  accessor: keyof T;
}

export interface PaginationOptions {
  enabled: boolean;
  itemsPerPage?: number;
}

export interface AddButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  addButton?: AddButtonProps;
  actions?: TableAction<T>[];
  searchFilter?: SearchFilter;
  statusFilter?: StatusFilter<T>;
  pagination?: PaginationOptions;
  emptyMessage?: string;
  className?: string;
}

// ==================== EMPLOYEE INTERFACES ====================
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  role: string;
  storeId: string;
  warehouseId?: string;
  status: boolean;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeRoleResponse {
  error?: boolean;
  payload?: RoleResponse;
  message?: string;
}

// ==================== OTHER INTERFACES ====================
export interface ContactTable {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssign {
  orderId: string;
  deliveryPartnerId: string;
  status: 'completed' | 'pending' | string;
  distance: number;
  otp: string;
  coinsEarned: number;
}

export interface DeliverySlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}

export interface DashboardStatsData {
  filters: {
    from: string;
    to: string;
  };
  employees: {
    count: number;
    change: string;
  };
  orders: {
    count: number;
    change: string;
  };
  deliveries: {
    count: number;
    change: string;
  };
  activeBanners: number;
  couponsAndOffers: number;
  contactAndSupport: number;
  customers: number;
  timeSlots: number;
}

// ==================== BANNER INTERFACES (Single Source of Truth) ====================

// Core banner item structure matching API response
export interface BannerItem {
  id: string;
  title: string;
  priority: number;
  images: {
    small: string | null;
    medium?: string | null;
    large: string | null;
  };
  bannerUrl: string;
  description: string;
}

// Banner group structure
export interface BannerGroup {
  tag: string;
  count: number;
  banners: BannerItem[];
}

// Payload type for GET all banners (used with ApiResponse wrapper)
export interface BannerListPayload {
  banners: BannerGroup[];
  totalTags: number;
  totalBanners: number;
}

// Full API Response structure (for type safety in components)
export interface BannerApiResponse {
  error: boolean;
  status: number;
  message: string;
  payload: BannerListPayload;
}

// Flattened banner for display in tables
export interface FlattenedBanner {
  id: string;
  title: string;
  tag: string;
  priority: number;
  bannerUrl: string;
  description: string;
  imageUrlSmall: string | null;
  imageUrlMedium: string | null;
  imageUrlLarge: string | null;
}

// Payload for individual banner by ID
export interface BannerByIdPayload {
  id: string;
  title: string;
  tag: string;
  priority: number;
  imageUrlSmall: string;
  imageUrlLarge: string;
  imageUrlMedium?: string;
  bannerUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Full response wrapper for getBannerById
export interface BannersPayload {
  error: boolean;
  status: number;
  message: string;
  payload: BannerByIdPayload;
}

// Update banner payload
export interface UpdateBannerPayload {
  id: string;
  title?: string;
  tag?: string;
  priority?: number;
  imageUrlSmall?: string;
  imageUrlMedium?: string;
  imageUrlLarge?: string;
  bannerUrl?: string;
  description?: string;
  isActive?: boolean;
}

// ==================== UPLOAD INTERFACES ====================
export interface PresignedUrlPayload {
  presignedUrl: string;
  fileUrl: string;
  key: string;
  fileName: string;
  expiresIn: number;
  expiresAt: string;
}

export interface PresignedUrlResponse {
  error: boolean;
  status: number;
  message: string;
  payload: PresignedUrlPayload;
}

// ==================== TAG INTERFACES ====================
export interface Tag {
  id: string;
  name: string;
}

export interface TagListPayload {
  bannerTags: string[];
}

export interface TagResponse {
  error: boolean;
  status: number;
  message: string;
  payload: TagListPayload;
}

// ==================== PRIORITY INTERFACES ====================
export interface PriorityItem {
  value: number;
  isOccupied: boolean;
}

export interface PrioritiesByTagPayload {
  tag: string;
  availablePriorities: PriorityItem[];
}

export interface PrioritiesPayload {
  error: boolean;
  status: number;
  message: string;
  payload: PrioritiesByTagPayload;
}

export interface MyDocumentType {
  id: string;
  code: string;
  label: string;
  status: boolean;
}

export interface DocumentTypeResponse {
  documentTypes: MyDocumentType[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackCategoryPayload {
  categoryName: string;
  description: string;
  sortOrder: number;
  maximumRating: number;
  labels: string[];
  status: boolean;
}
export interface StoreResponse {
  stores: Store[];
}

export interface Store {
  id: string;
  name: string;
  category: string;
  owner: string;
  description: string;
  address: Address;
  contact: Contact;
  timing: StoreTiming;
  rating: number;
  deliveryTime: string;
  minOrderValue: number;
  storeImage: string;
  isVerified: boolean;
  location: LocationCoords;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Contact {
  phone: string;
  email: string;
}

export interface StoreTiming {
  open: string;
  close: string;
}

export interface LocationCoords {
  latitude: string;
  longitude: string;
}

export interface WarehouseListResponse {
  allWarehouse: Warehouse[];
}

export interface Warehouse {
  id: string;
  name: string;
}

// 2. Payload including Pagination
export interface CouponPayload {
  coupons: Coupon[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// 3. The Coupon Entity
export interface Coupon {
  id: string;
  storeId: string | null;
  code: string;
  title: string;
  description: string[]; // Backend returns as Array [web:181]
  discountValue: string; // API returns "100" as string
  discountUnit: 'PERCENTAGE' | 'FLAT' | 'FIXED';
  maxDiscountValue: string | null;
  minPurchaseAmount: string | null;
  minQuantity: number;
  usagePerUser: number;
  currentUsageCount: number;
  status: boolean; // boolean true/false
  expiryType: 'FIXED' | 'RELATIVE';
  validFrom: string; // ISO String: "2025-12-26T00:00:00.000Z"
  validUntil: string | null;
  relativeDays: number | null;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  couponImage: string; // S3 URL
  termsAndConditions: string[]; // Backend returns as Array
  isAutoApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  icon: string | null;
  color: string;
  sortOrder: number;
  ratingType: string;
  maxRating: number;
  ratingLabels: { [key: number]: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCategoryResponse {
  categories: FeedbackCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ISidebarData {
  label: string;
  icon: string;
  path: string;
  order: number;
  isActive: boolean;
  requiredPermission: string[] | null;
  description: string | null;
  menuItems: ISidebarData[] | null;
}

export interface ISidebarRES {
  sidebar: ISidebarData[];
  userPermissions: string[];
}

export interface IEditEmployeeMasterDataRES {
  bloodGroups: {
    value: string;
    label: string;
  }[];

  roles: {
    id: string;
    value: string;
    label: string;
    description: string;
    priority: number;
  }[];

  relations: {
    value: string;
    label: string;
  }[];

  documentTypes: {
    value: string;
    label: string;
    requiresNumber: boolean;
  }[];

  locationTypes: {
    value: string;
    label: string;
  }[];
  genders: {
    value: string;
    label: string;
  }[];
}

export interface IPreSignedUrlRES {
  presignedUrl: string;
  fileUrl: string;
}

export interface IGetPermissionsByRolesRES {
  permissions: {
    label: string;
    value: string;
  }[];
  rolePermissions: {
    label: string;
    value: string;
  }[];
}

export interface IGenerateEmployeeIdRES {
  employeeCode: string;
}

export interface ILocationData {
  id: string;
  name: string;
  code: 'HEAD_OFFICE' | string;
  type: 'STORE' | string;
  typeLabel: string;
  fullAddress: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  phoneNumber: string;
  email: string;
  managerName: string | null;
  operatingStatus: 'OPERATIONAL' | 'NON_OPERATIONAL' | string;
  isPrimary: boolean;
  searchText: string;
}

export interface IGetLocationRES {
  locations: ILocationData[];
}
