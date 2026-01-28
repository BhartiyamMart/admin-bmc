// ==================== CUSTOMER INTERFACES ====================

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type OrderStatus = 'completed' | 'pending' | 'cancelled' | 'processing' | 'delivered';

// Order interface
export interface CustomerOrder {
  id: string;
  orderId: string;
  total: number;
  date: string;
  status: OrderStatus;
}

// Customer base data from API
export interface CustomerData {
  id: string;
  phoneNumber: string;
  status: CustomerStatus;
  createdAt: string;
  lastLogin: string;
  referrals: number;
}

// Customer profile data from API
export interface CustomerProfile {
  firstName: string;
  imageUrl: string | null;
  lastName: string;
  email: string | null;
  totalSpent: string;
  rewardCoins: number;
  dateOfBirth: string | null;
  gender: string | null;
}

// Complete customer details payload from API
export interface CustomerDetailsPayload {
  customer: CustomerData;
  profile: CustomerProfile;
  orders: CustomerOrder[];
  membership: string | null;
  wallet: number | null;
}

// API Response wrapper for customer details

// Flattened customer for display (used in component state)
export interface CustomerDetailsResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  status: CustomerStatus;
  membership: string | null;
  wallet: number | null;
  spent: string;
  rewardCoins: number;
  orders: CustomerOrder[];
  referrals: number;
  lastLogin: string;
  dateOfBirth: string | null;
  gender: string | null;
}

// Paginated customers list
export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: CustomerStatus;
  membership: string | null;
  totalSpent: string;
  ordersCount: number;
  createdAt: string;
}

export interface IUserListData {
  id: string;
  phone: string;
  status: boolean;
  profile: {
    name: string;
  };
  roles: [
    {
      id: string;
      name: string;
    },
  ];
  email: string;
  autoMail: string;
  createdAt: string;
}

export interface IUserListResponse {
  users: IUserListData[];
}

// <<<<<<<<<<<<<<<<<<<<<<<=============================  User view page interface ===============================>>>>>>>>>>>>>>>>>>

interface IUserBasicInfo {
  id: string;
  phone: string;
  email: string | null;
  autoMail: string;
  status: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IUserProfile {
  id: string;
  name: string;
  photo: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IUserEmployee {
  // Add employee fields based on your schema
  [key: string]: any;
}

interface IUserRole {
  // Add role fields based on your schema
  id: string;
  name: string;
  slug: string;
  description: string;
  priority: number;
  assignedAt: string;
  assignedBy: string | null;
  // ... other role fields
}

interface IUserPermission {
  // Add permission fields based on your schema
  id: string;
  name: string;
  // ... other permission fields
}

interface IUserAddress {
  // Add address fields based on your schema
  id: string;
  street: string;
  city: string;
  // ... other address fields
}

interface IUserWallet {
  // Add wallet fields based on your schema
  id: string;
  balance: number;
  // ... other wallet fields
}

interface IUserReferral {
  myCode: string | null;
  referredBy: string | null;
}

interface IUserActivity {
  lastLogin: string;
  lastFailedLogin: string | null;
  successLoginCount: number;
  failedLoginCount: number;
  activeSessions: any[]; // Define session interface if needed
}

interface IUserDeletionInfo {
  deletedAt: string;
  deleteName: string;
  deleteTitle: string;
  deleteReason: string;
}

interface IUserStats {
  totalAddresses: number;
  activeSessionsCount: number;
  totalReferralsGiven: number;
  totalWalletTransactions: number;
}

export interface IUserViewApiResponse {
  basicInfo: IUserBasicInfo;
  profile: IUserProfile;
  employee: IUserEmployee | null;
  roles?: IUserRole[];
  individualPermissions?: IUserPermission[];
  addresses: IUserAddress[];
  wallet: IUserWallet | null;
  referral: IUserReferral;
  activity: IUserActivity;
  deletionInfo?: IUserDeletionInfo | null;
  stats: IUserStats;
}
