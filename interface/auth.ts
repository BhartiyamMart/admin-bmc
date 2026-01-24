import { IEmployee } from './auth.interface';

export interface Payload {
  token: string;
  employee: IEmployee;
}

export interface LogoutResponse {}
