// API Response structure matching your backend
export interface ApiResponse<T> {
  termsAndConditions: string;
  isAutoApplied: boolean;
  targetExistingUsers: boolean;
  targetNewUsers: boolean;
  relativeDays: undefined;
  validUntil: any;
  validFrom: string | number | Date;
  expiryType: 'FIXED' | 'RELATIVE';
  currentUsageCount: number;
  discountValue: number;
  type: 'PERCENT' | 'FIXED';
  title: string;
  description: string;
  code: string;
  error: boolean;
  status: number;
  message: string;
  payload: T;
}

// Address interface matching your Prisma schema
export interface Address {
  id: string;
  userId: string;
  label: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  houseNoFloor: string;
  buildingBlock: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: number;
  deliveryInstruction?: string;
  latitude?: number;
  longitude?: number;
  contactName: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean; // For UI logic
}

export interface CreateAddressPayload {
  label: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  houseNoFloor: string;
  buildingBlock: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: number;
  deliveryInstruction?: string;
  latitude?: number;
  longitude?: number;
  contactName: string;
  contactPhone: string;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
  id?: string;
}

export interface AddressResponse {
  defaultAddressId: string;
}

export interface AddressesResponse {
  addresses: Address[];
}

export interface DeleteAddressResponse {
  deletedAddressId: string;
}

export interface warehouse {
  allWarehouse: [];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface permissions {
  assignedPermissions: Permission[];
  allPermissions: Permission[];
}
export interface roles {
  roles: [];
}
