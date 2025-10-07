import { create } from "zustand";

export interface DeliveryAssign {
  id: number;
  orderId: string;
  deliveryPartnerId: string;
  status: string;
  deliveryInstructionId: string;
  timeSlotId?: string;
  distance: number;
  otp: string;
  productImages: string[];
  coinsEarned: number;
}

interface DeliveryAssignStore {
  assigns: DeliveryAssign[];
  addAssign: (assign: Omit<DeliveryAssign, "id">) => void;
}

let idCounter = 1;

export const useDeliveryAssignStore = create<DeliveryAssignStore>((set) => ({
  assigns: [],
  addAssign: (assign) =>
    set((state) => ({
      assigns: [...state.assigns, { ...assign, id: idCounter++ }],
    })),
}));
