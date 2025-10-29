import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId?: string;
  phoneNumber?: string;
}

interface UserState {
  user: User;
  signature: string;
  setUser: (user: User) => void;
  setSignature: (signature: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {},
      signature: '',
      setUser: (user: User) => set({ user: user }),
      setSignature: (signature: string) => set({ signature }),
    }),
    {
      name: 'user',
    }
  )
);
