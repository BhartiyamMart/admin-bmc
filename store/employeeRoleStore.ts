"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Role {
  id: string; // Changed from number to string for UUID
  name: string;
  status: boolean;
  createdAt?: string; // Made optional since API doesn't provide these
  updatedAt?: string; // Made optional since API doesn't provide these
}

export interface RoleState {
  roles: Role[];
  setRoles: (roles: Role[]) => void; // Add method to set roles from API
  addRole: (role: Omit<Role, "id" | "createdAt" | "updatedAt">) => void;
  updateRole: (id: string, updates: Partial<Omit<Role, "id" | "createdAt">>) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => Role | undefined;
  clearRoles: () => void;
}

const useEmployeeRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      roles: [],
      
      // Set roles from API response
      setRoles: (roles) => set({ roles }),
      
      addRole: (role) =>
        set((state) => ({
          roles: [
            ...state.roles,
            {
              id: crypto.randomUUID(), // Generate UUID for new roles
              name: role.name,
              status: role.status,
              createdAt: new Date().toLocaleString(),
              updatedAt: new Date().toLocaleString(),
            },
          ],
        })),

      updateRole: (id, updates) =>
        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === id
              ? {
                  ...role,
                  ...updates,
                  updatedAt: new Date().toLocaleString(),
                }
              : role
          ),
        })),

      deleteRole: (id) =>
        set((state) => ({
          roles: state.roles.filter((role) => role.id !== id),
        })),

      getRoleById: (id) => {
        const { roles } = get();
        return roles.find((role) => role.id === id);
      },

      clearRoles: () => set({ roles: [] }),
    }),
    {
      name: "employee-role",
      // storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useEmployeeRoleStore;
