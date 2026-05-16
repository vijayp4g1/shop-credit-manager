import { create } from "zustand";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  balance: number;
}

interface AppState {
  searchQuery: string;
  filterTab: "ALL" | "DUE" | "ADVANCE" | "SETTLED";
  isTransactionModalOpen: boolean;
  initialTransactionType: "UDHAR" | "JAMA";
  isAddCustomerModalOpen: boolean;
  initialCustomerName: string;
  setSearchQuery: (query: string) => void;
  setFilterTab: (tab: "ALL" | "DUE" | "ADVANCE" | "SETTLED") => void;
  resetFilters: () => void;
  openTransactionModal: (type?: "UDHAR" | "JAMA") => void;
  closeTransactionModal: () => void;
  openAddCustomerModal: (name?: string) => void;
  closeAddCustomerModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: "",
  filterTab: "ALL",
  isTransactionModalOpen: false,
  initialTransactionType: "UDHAR",
  isAddCustomerModalOpen: false,
  initialCustomerName: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterTab: (tab: "ALL" | "DUE" | "ADVANCE" | "SETTLED") => set({ filterTab: tab }),
  resetFilters: () => set({ searchQuery: "", filterTab: "ALL" }),
  openTransactionModal: (type = "UDHAR") =>
    set({ isTransactionModalOpen: true, initialTransactionType: type }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false }),
  openAddCustomerModal: (name = "") =>
    set({ isAddCustomerModalOpen: true, initialCustomerName: name }),
  closeAddCustomerModal: () =>
    set({ isAddCustomerModalOpen: false, initialCustomerName: "" }),
}));

