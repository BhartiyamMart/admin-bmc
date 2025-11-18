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
export interface CustomerDetailsResponse {
  error: boolean;
  status: number;
  message: string;
  payload: CustomerDetailsPayload;
}

// Flattened customer for display (used in component state)
export interface CustomerDetails {
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

export interface CustomersListPayload {
  customers: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomersListResponse {
  error: boolean;
  status: number;
  message: string;
  payload: CustomersListPayload;
}
