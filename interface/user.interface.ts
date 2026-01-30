// <<<<<<<<<<<<<<<<<<<<<<<============================= User list api interface ===================>>>>>>>>>>>>>>>>>>>
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

// <<<<<<<<<<<<<<<<<<<<<<<=============================  User view api interface ===============================>>>>>>>>>>>>>>>>>>

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

export interface IUserReferralCode {
  id: string;
  code: string;
  totalReferrals: number;
  status: boolean;
  createdAt: string;
}

export interface IUserReferral {
  myCode: IUserReferralCode | null;
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
