import React, { ReactNode } from "react";
import { RoleResponse } from "./employee.interface";

// Generic column interface for reusable tables
export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
}

// Common table props interface
export interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

// Employee-specific interfaces

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  role: string;
  storeId: string;
  warehouseId?: string;
  status: boolean;
  permissions: string[];
}

// Role interface
export interface Role {
  id: string;
  name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Response type for employee role
export interface EmployeeRoleResponse {
  error?: boolean;
  payload?: RoleResponse;
  message?: string;
}

// Table column interface with enhanced typing
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

// Table actions supporting two variants (icon button or labeled button)
export type TableAction<T> =
  | {
    variant: "icon";
    icon: ReactNode;
    onClick: (row: T) => void;
    className?: string;
    label?: never;
  }
  | {
    variant?: "button";
    label: string;
    onClick: (row: T) => void;
    className?: string;
    icon?: never;
  };

// Search filter for tables
export interface SearchFilter {
  enabled: boolean;
  placeholder?: string;
  searchKeys: string[];
}

// Status filter for tables
export interface StatusFilter<T> {
  enabled: boolean;
  options: { label: string; value: string | boolean | null }[];
  accessor: keyof T;
}

// Pagination options interface
export interface PaginationOptions {
  enabled: boolean;
  itemsPerPage?: number;
}

// Add button props interface
export interface AddButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
}

// Main DataTable props interface
export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  addButton?: AddButtonProps;
  actions?: TableAction<T>[];
  searchFilter?: SearchFilter;
  statusFilter?: StatusFilter<T>;
  pagination?: PaginationOptions;
  emptyMessage?: string;
  className?: string;
}


export interface Contact {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}



export interface DeliveryAssign {
  orderId: string;
  deliveryPartnerId: string;
  status: "completed" | "pending" | string;
  distance: number;
  otp: string;
  coinsEarned: number;
}



export interface DeliverySlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}


export interface DashboardStatsData {
  filters: {
    from: string;
    to: string;
  };
  employees: number;
  orders: number;
  deliveries: number;
  activeBanners: number;
  couponsAndOffers: number;
  contactAndSupport: number;
  customers: number;
  timeSlots: number;
}

export interface DashboardApiResponse {
  error: boolean;
  status: number;
  message: string;
  payload: DashboardStatsData;
}

