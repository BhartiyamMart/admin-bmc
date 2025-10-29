import { create } from 'zustand';

export type ContactSupport = {
  id: string;
  title: string;
  description: string;
  name: string;
  phoneNumber: string;
  link?: string;
  icon?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

type ContactSupportState = {
  contacts: ContactSupport[];
  addContact: (contact: ContactSupport) => void;
};

export const useContactSupportStore = create<ContactSupportState>((set) => ({
  contacts: [],
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
}));
