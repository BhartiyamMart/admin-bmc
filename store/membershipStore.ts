'use client';

import { create } from 'zustand';

export interface Membership {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

interface MembershipState {
  memberships: Membership[];
  addMembership: (membership: Membership) => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  memberships: [],
  addMembership: (membership) =>
    set((state) => ({
      memberships: [...state.memberships, membership],
    })),
}));
