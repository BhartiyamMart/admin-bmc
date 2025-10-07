// import { create } from "zustand";

// export interface Coupon {
//   id: number;
//   code: string;
//   title: string;
//   description?: string;
//   type: string;
//   discountValue: number;
//   currentUsageCount: number;
//   status: string;
//   expiryType: "FIXED" | "RELATIVE";
//   validFrom: string;
//   validUntil?: string;
//   relativeDays?: number;
//   targetNewUsers: boolean;
//   targetExistingUsers: boolean;
//   eligibleCities: string[];
//   eligibleUserTypes: string[];
//   isAutoApplied: boolean;
//   bannerImage?: string;
//   termsAndConditions?: string;
// }

// interface CouponStore {
//   coupons: Coupon[];
//   addCoupon: (coupon: Omit<Coupon, "id">) => void;
// }

// let idCounter = 1;

// export const useCouponStore = create<CouponStore>((set) => ({
//   coupons: [],
//   addCoupon: (coupon) =>
//     set((state) => ({
//       coupons: [...state.coupons, { ...coupon, id: idCounter++ }],
//     })),
// }));


import { create } from "zustand";

export interface Coupon {
  id: number;
  code: string;
  title: string;
  description?: string;
  type: string;
  discountValue: number;
  currentUsageCount: number;
  status: string;
  expiryType: "FIXED" | "RELATIVE";
  validFrom: string;
  validUntil?: string;
  relativeDays?: number;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  eligibleCities: string[];
  eligibleUserTypes: string[];
  isAutoApplied: boolean;
  bannerImage?: string;
  termsAndConditions?: string;
}

interface CouponStore {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, "id">) => void;
}

let idCounter = 1;

export const useCouponStore = create<CouponStore>((set) => ({
  coupons: [],
  addCoupon: (coupon) =>
    set((state) => ({
      coupons: [...state.coupons, { ...coupon, id: idCounter++ }],
    })),
}));

