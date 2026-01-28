import { ISidebarData } from '@/interface/common.interface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ISidebarState {
  sidebar: ISidebarData[];
  isLoaded: boolean;
  userPermissions: string[];
  isSidebarOpen: boolean;
}

interface ISidebarActions {
  setSidebar: (sidebar: ISidebarData[]) => void;
  clearSidebar: () => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setUserPermissions: (permissions: string[]) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export type ISidebar = ISidebarState & ISidebarActions;

const initialState: ISidebarState = {
  sidebar: [],
  isLoaded: false,
  userPermissions: [],
  isSidebarOpen: true,
};

export const useSidebarStore = create<ISidebar>()(
  persist(
    (set) => ({
      ...initialState,

      setSidebar: (sidebar: ISidebarData[]) => set({ sidebar, isLoaded: true }),

      setUserPermissions: (permissions: string[]) => set({ userPermissions: permissions }),

      clearSidebar: () => set(initialState),

      setIsLoaded: (isLoaded: boolean) => set({ isLoaded }),

      setIsSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: 'sidebar-storage', // localStorage key
    }
  )
);
