"use client";
import { create } from "zustand";

interface DocumentType {
  code: string;
  label: string;
}

interface DocumentTypeStore {
  documentTypes: DocumentType[];
  addDocumentType: (doc: DocumentType) => void;
}

const useDocumentTypeStore = create<DocumentTypeStore>((set) => ({
  documentTypes: [],
  addDocumentType: (doc) =>
    set((state) => ({
      documentTypes: [...state.documentTypes, { ...doc, id: state.documentTypes.length + 1 }],
    })),
}));

export default useDocumentTypeStore;
