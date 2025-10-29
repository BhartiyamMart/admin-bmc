import { create } from 'zustand';

export interface Offer {
  id: number;
  storeId: string;
  title: string;
  description?: string;
  shortDescription?: string;
  type: string;
  discountValue?: number;
  discountUnit?: string;
  minPurchaseAmount: number;
  minQuantity?: number;
  status: string;
  startDateTime: string;
  endDateTime: string;
  usagePerUser: number;
  targetAudience: string[];
  eligibleCities: string[];
  bannerImage?: string;
  thumbnailImage?: string;
  offerImages: string[];
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  termsAndConditions?: string;
}

interface OfferStore {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => void;
}

let idCounter = 1;

export const useOfferStore = create<OfferStore>((set) => ({
  offers: [],
  addOffer: (offer) =>
    set((state) => ({
      offers: [...state.offers, { ...offer, id: idCounter++ }],
    })),
}));
