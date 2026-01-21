// /data/employeeList.ts

export interface Employees {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber: string;
  roleId: string;
  role: string;
  storeId?: string | null;
  warehouseId?: string | null;
  status: boolean;
  passwordCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

export interface EmployeeApiResponse {
  error: boolean;
  status: number;
  message: string;
  employees: Employees[];
  totalCount: number;
}

// A simple in-memory employee list (will reset on server restart)
export const employeeList: Employees[] = [];

// Function to add employee
export function addEmployee(employee: Employees) {
  employeeList.push(employee);
}

// Single API Response Type
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  payload: T;
}

interface wallet {
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;

  recentTransactions: number | any;
}

// Employee Data Structure
export interface EmployeeResponse {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  wallet: wallet;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  emergencyName?: string;
  emergencyNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emergencyPhone?: string;

  // Job Details
  role: string;
  department?: string;
  storeId?: string;
  warehouseId?: string;
  salary?: string;
  joinDate?: string;
  status: boolean;

  // Documents
  documents: EmployeeDocument[];

  // Permissions
  permissions: EmployeePermission[];

  // Reward Coins History
  rewardHistory: RewardHistory[];

  // Deliveries (for delivery boys)
  deliveries: Delivery[];

  // Optional Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Document Structure
export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
}

// Permission Structure
export interface EmployeePermission {
  id: string;
  name: string;
  category: string;
}

// Reward History
export interface RewardHistory {
  id: string;
  coins: number;
  reason: string;
  date: string;
}

// Delivery (if applicable)
export interface Delivery {
  id: string;
  orderId: string;
  // backend may use deliveryDate or date; include both and optional UI fields
  deliveryDate?: string;
  date?: string;
  status: string;
  // UI fields used in components
  customerName?: string;
  address?: string;
  amount?: number;
}
