import { IEmployee, IUser } from '@/interface/auth.interface';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuthState = {
  bmctoken: string | null;
  user: IUser | null;
  employee: IEmployee | null;
  remember: boolean;
  login: (payload: { token: string; user: IUser; employee: IEmployee }, remember: boolean) => void;
  logout: () => void;
};

const STORAGE_KEY = 'bmc-auth';
const REMEMBER_KEY = 'bmc-remember';

const isClient = typeof window !== 'undefined';

// Dynamic storage that checks remember preference at runtime
const getDynamicStorage = () => {
  if (!isClient) return localStorage; // Fallback for SSR

  // Check which storage has the remember key
  const rememberFromLocal = window.localStorage.getItem(REMEMBER_KEY);
  const rememberFromSession = window.sessionStorage.getItem(REMEMBER_KEY);
  
  const remember = rememberFromLocal === 'true' || rememberFromSession === 'true';
  return remember ? window.localStorage : window.sessionStorage;
};

// Custom storage wrapper that dynamically switches
const dynamicStorage = {
  getItem: (name: string) => {
    if (!isClient) return null;
    // Check both storages when reading
    return window.localStorage.getItem(name) || window.sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (!isClient) return;
    
    const targetStorage = getDynamicStorage();
    const otherStorage = targetStorage === window.localStorage 
      ? window.sessionStorage 
      : window.localStorage;
    
    // Clear from other storage
    otherStorage.removeItem(name);
    // Save to target storage
    targetStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (!isClient) return;
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      bmctoken: null,
      user: null,
      employee: null,
      remember: false,

      login: ({ token, user, employee }, remember) => {
        if (isClient) {
          // First, set the remember preference
          if (remember) {
            window.localStorage.setItem(REMEMBER_KEY, 'true');
            window.sessionStorage.removeItem(REMEMBER_KEY);
          } else {
            window.sessionStorage.setItem(REMEMBER_KEY, 'false');
            window.localStorage.removeItem(REMEMBER_KEY);
          }

          // Update state (this will trigger persist middleware to save)
          set({ bmctoken: token, user, employee, remember });

          // Force storage switch by rehydrating to correct storage
          const targetStorage = remember ? window.localStorage : window.sessionStorage;
          const otherStorage = remember ? window.sessionStorage : window.localStorage;
          
          // Remove from wrong storage
          otherStorage.removeItem(STORAGE_KEY);
          
          // Manually save to correct storage
          const stateToStore = {
            state: { bmctoken: token, user, employee, remember },
            version: 1,
          };
          targetStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
        } else {
          set({ bmctoken: token, user, employee, remember });
        }
      },

      logout: () => {
        if (isClient) {
          // Clear remember preference
          window.localStorage.removeItem(REMEMBER_KEY);
          window.sessionStorage.removeItem(REMEMBER_KEY);
          
          // Clear auth data from both storages
          window.localStorage.removeItem(STORAGE_KEY);
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
        set({ bmctoken: null, user: null, employee: null, remember: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => dynamicStorage),
      partialize: (state) => ({
        bmctoken: state.bmctoken,
        user: state.user,
        employee: state.employee,
        remember: state.remember,
      }),
      version: 1,
    }
  )
);

export const getAuthState = () => useAuthStore.getState();
