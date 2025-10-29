'use client';

import { create } from 'zustand';

export interface Permission {
  id: string; // use string because your API returns UUID strings
  name: string;
  description?: string;
  status: boolean; // optional because the API response may not have it
  createdAt?: string;
  updatedAt?: string;
}

interface PermissionState {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  removePermission: (id: string) => void;
  updatePermission: (updated: Permission) => void;
}

const usePermissionStore = create<PermissionState>((set) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
  removePermission: (id) =>
    set((state) => ({
      permissions: state.permissions.filter((perm) => perm.id !== id),
    })),
  updatePermission: (updated) =>
    set((state) => ({
      permissions: state.permissions.map((perm) => (perm.id === updated.id ? { ...perm, ...updated } : perm)),
    })),
}));

export default usePermissionStore;
