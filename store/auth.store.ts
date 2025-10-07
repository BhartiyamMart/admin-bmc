import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Employee {
  id: string;
  employeeId: string;
  email: string;
  status: boolean;
  roleId: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  setAuthData: (token: string, employee: Employee) => void;
  clearAuthData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      employee: null,
      isAuthenticated: false,

      setAuthData: (token, employee) => {
        set({
          token,
          employee,
          isAuthenticated: true,
        });
      },

      clearAuthData: () => {
        set({
          token: null,
          employee: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // Storage key name
      // Optional: specify storage type (default is localStorage)
      // storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead
    }
  )
);
