export interface roles {
  id: string;
  name: string;
  hierarchyOrder:number;
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
