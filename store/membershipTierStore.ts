import { create } from "zustand";

export type MembershipTier = {
  memberShipId: string;
  sortOrder: number;
  isActive: boolean;
  validityDays: number;
  amount: number;
  description: string;
};

type MembershipTierState = {
  tiers: MembershipTier[];
  addTier: (tier: MembershipTier) => void;
};

export const useMembershipTierStore = create<MembershipTierState>((set) => ({
  tiers: [],
  addTier: (tier) => set((state) => ({ tiers: [...state.tiers, tier] })),
}));
