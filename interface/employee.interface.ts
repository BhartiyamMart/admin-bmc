export interface Role {
  id: string;
  name: string;
  status: boolean;
}

export interface RoleResponse {
  error: boolean;
  status: number;
  message: string;
  payload: Role[];
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
