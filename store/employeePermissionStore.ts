"use client";

import { create } from "zustand";

interface EmployeePermission {
  id: number;
  employeeId: string;
  employeeName: string;
  permissionName: string;
  createdAt: string;
}

interface EmployeePermissionState {
  employeePermissions: EmployeePermission[];
  addEmployeePermission: (
    ep: Omit<EmployeePermission, "id" | "createdAt">
  ) => void;
}

const useEmployeePermissionStore = create<EmployeePermissionState>((set) => ({
  employeePermissions: [],
  addEmployeePermission: (ep) =>
    set((state) => ({
      employeePermissions: [
        ...state.employeePermissions,
        {
          id: state.employeePermissions.length + 1,
          ...ep,
          createdAt: new Date().toLocaleString(),
        },
      ],
    })),
}));

export default useEmployeePermissionStore;
