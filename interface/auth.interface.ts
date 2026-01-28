export interface LoginRequest {
  identifier: string;
  password: string;
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    brand: string;
    model: string;
    os: string;
    osVersion: string;
    ipAddress: string;
  };
  appInfo: {
    appVersion: string;
    buildNumber: string;
    platform: string;
  };

  fcmToken: string;
}

export interface IUser {
  id: string;
  email: string;
  phone: string;
  profile: {
    name: string;
    photo: string | null;
  };
  employee: IEmployee;
  roles: [];
}

export interface IEmployee {
  id: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  canAccessAdminPanel: boolean;
  canAccessDeliveryApp: boolean;
  requirePasswordChange: boolean;
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
  expiresAt: string;
  user: IUser;
}

export interface SendOtpRequest {
  identifier: string;
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
  data: { token: string; employee: IEmployee };
}

export interface SendOtpRES {
  email: string;
}
