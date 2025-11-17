import { Employees } from './auth.interface';

export interface Payload {
  token: string;
  employee: Employees;
}

export interface LogoutResponse {}
