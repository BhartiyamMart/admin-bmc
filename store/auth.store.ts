import { Employees } from '@/interface/auth.interface';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SyncStateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

type AuthState = {
  bmctoken: string | null;
  employee: Employees | null;
  remember: boolean;
  login: (payload: { token: string; employee: Employees }, remember: boolean) => void;
  logout: () => void;
};

const STORAGE_KEY = 'bmc-auth';
const REMEMBER_KEY = 'bmc-remember';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Get preferred storage based on remember preference
const getPreferredStorage = () => {
  if (!isClient) return undefined as unknown as Storage;

  const remembered = window.localStorage.getItem(REMEMBER_KEY) ?? window.sessionStorage.getItem(REMEMBER_KEY);
  const remember = remembered === 'true';
  return remember ? window.localStorage : window.sessionStorage;
};

// Dual storage implementation
const underlyingDualStorage: SyncStateStorage = {
  getItem: (name) => {
    if (!isClient) return null;
    return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (!isClient) return;

    const target = getPreferredStorage();
    if (!target) return;

    const other = target === window.localStorage ? window.sessionStorage : window.localStorage;
    other.removeItem(name);
    target.setItem(name, value);
  },
  removeItem: (name) => {
    if (!isClient) return;
    window.sessionStorage.removeItem(name);
    window.localStorage.removeItem(name);
  },
};

// Storage mapper for backward compatibility
const mappedStorage: SyncStateStorage = {
  getItem: (name) => {
    const raw = underlyingDualStorage.getItem(name);
    if (!raw) return raw;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        return raw;
      }
      if (parsed && typeof parsed === 'object' && 'bmcAuth' in parsed) {
        const normalized = JSON.stringify({
          state: parsed.bmcAuth,
          version: typeof parsed.version === 'number' ? parsed.version : 1,
        });
        return normalized;
      }
      return raw;
    } catch {
      return raw;
    }
  },
  setItem: (name, value) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        const remapped = JSON.stringify({
          bmcAuth: parsed.state,
          version: typeof parsed.version === 'number' ? parsed.version : 1,
        });
        underlyingDualStorage.setItem(name, remapped);
        return;
      }
      underlyingDualStorage.setItem(name, value);
    } catch {
      underlyingDualStorage.setItem(name, value);
    }
  },
  removeItem: (name) => underlyingDualStorage.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      bmctoken: null,
      employee: null,
      remember: false,

      login: ({ token, employee }, remember) => {
        if (isClient) {
          if (remember) {
            window.localStorage.setItem(REMEMBER_KEY, 'true');
            window.sessionStorage.removeItem(REMEMBER_KEY);
          } else {
            window.sessionStorage.setItem(REMEMBER_KEY, 'false');
            window.localStorage.removeItem(REMEMBER_KEY);
          }
        }
        set({ bmctoken: token, employee, remember });
      },

      logout: () => {
        if (isClient) {
          window.localStorage.removeItem(REMEMBER_KEY);
          window.sessionStorage.removeItem(REMEMBER_KEY);
        }
        set({ bmctoken: null, employee: null, remember: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => mappedStorage),
      partialize: (state) => ({
        bmctoken: state.bmctoken,
        employee: state.employee,
        remember: state.remember,
      }),
      version: 1,
    }
  )
);

// Export imperative accessor for use in axios interceptors
export const getAuthState = () => useAuthStore.getState();
