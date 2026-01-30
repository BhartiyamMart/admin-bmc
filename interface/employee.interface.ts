// employee.interface.ts

export interface roles {
  id: string;
  name: string;
  hierarchyOrder: number;
  status: boolean;
}

export interface RoleResponse {
  error: boolean;
  status: number;
  message: string;
  roles: roles[];
  permissions: string[];
}

export interface RoleRequest {
  name: string;
  staus: boolean;
}

export interface DeleteRequest {
  id: string;
}

export interface UpDateRequest {
  id: string;
  name: string;
  staus: boolean;
}

export interface RoleDetails {
  id: string;
  name: string;
  hierarchyOrder: number;
  status: boolean;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName: string | null;
  gender: string | null;
  bloodgroup: string;
  documents: any[]; // Change from [] to any[]
  permissions: any[]; // Change from [] to any[]
  wallet: number | null; // Add null as possible value
  dateOfBirth: string | null;
  address: string | null;
  department: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  storeId: string | null; // Add null
  warehouseId: string | null;
  managerId: string | null;
  manager: string | null;
  status: boolean;
  deliveryStatus: string;
  createdAt: string;
  roleDetails: RoleDetails;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyName: string | null;
  emergencyNumber: string | null;
}

export interface EmployeePayload {
  employee: Employee;
  profile: any | null;
  documents: any[];
  permissions: any[];
  wallet: any | null;
  deliveryPerformance?: any | null; // Make optional
}

export interface ICreateEmployeePayload {
  employeeId: string;

  personalDetails: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    bloodGroup?: string;
    gender: string;
    photo?: string;
    password: string;
    requirePasswordChange: boolean;

    address: {
      addressLineOne: string;
      addressLineTwo?: string;
      state: string;
      city: string;
      pincode: string;
    };

    emergencyContacts: {
      name: string;
      phone: string;
      address: string;
      relation: 'FATHER' | 'MOTHER' | 'SPOUSE' | 'BROTHER' | 'SISTER' | 'GUARDIAN' | string;
    }[];

    documents: {
      type: string; // e.g. "AADHAR_CARD"
      number: string;
      fileUrl: string;
    }[];
  };

  roleIds: string[];
  permissionIds: string[];
  locationId?: string;
}
