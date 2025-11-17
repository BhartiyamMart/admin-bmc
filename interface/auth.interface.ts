export interface LoginRequest {
  employeeId?: string;
  email?: string;
  password: string;
}

export interface Employees {
  id: string;
  employeeId: string;
  profileImage: string;
  email: string;
  status: boolean;
  roleId: string;
  role: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  warehouseId?: string | null;
  storeId?: string | null;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface SidebarMenuItem {
  label: string;
  path: string;
  icon: string;
  order: number;
  description?: string;
}

export interface SidebarMenu {
  label: string;
  icon: string;
  path: string;
  order: number;
  menuItems: SidebarMenuItem[];
}

export interface Sidebar {
  menus: SidebarMenu[];
  totalMenus: number;
  totalMenuItems: number;
  role: string;
}
export interface LoginResponse {
  token: string;
  employee: Employees;
  sidebar: Sidebar;
}

export interface SendOtpRequest {
  otpType: string;
  deliveryMethod: 'email' | 'sms';
  recipient: string;
}

export interface VerifyOtpRequest {
  otpType: string;
  recipient: string;
  otp: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface CommonResponse {
  message: string;
  success: boolean;
  token: string;
  data: { token: string; employee: Employees };
}
