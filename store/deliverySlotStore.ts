import { create } from 'zustand';

export interface DeliveryTimeSlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}

interface DeliverySlotStore {
  slots: DeliveryTimeSlot[];
  addSlot: (slot: Omit<DeliveryTimeSlot, 'id'>) => void;
  toggleStatus: (id: number) => void;
  removeSlot: (id: number) => void;
}

let idCounter = 1; // ID generator

export const useDeliverySlotStore = create<DeliverySlotStore>((set) => ({
  slots: [],
  addSlot: (slot) =>
    set((state) => ({
      slots: [...state.slots, { ...slot, id: idCounter++ }],
    })),
  toggleStatus: (id) =>
    set((state) => ({
      slots: state.slots.map((s) => (s.id === id ? { ...s, status: !s.status } : s)),
    })),
  removeSlot: (id) =>
    set((state) => ({
      slots: state.slots.filter((s) => s.id !== id),
    })),
}));
