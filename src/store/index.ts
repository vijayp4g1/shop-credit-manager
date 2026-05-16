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
  isAddExpenseModalOpen: boolean;
  initialExpenseCategory: string;
  selectedExpenseCategory: string;
  setSearchQuery: (query: string) => void;
  setFilterTab: (tab: "ALL" | "DUE" | "ADVANCE" | "SETTLED") => void;
  setSelectedExpenseCategory: (category: string) => void;
  resetFilters: () => void;
  openTransactionModal: (type?: "UDHAR" | "JAMA") => void;
  closeTransactionModal: () => void;
  openAddCustomerModal: (name?: string) => void;
  closeAddCustomerModal: () => void;
  openAddExpenseModal: (category?: string) => void;
  closeAddExpenseModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: "",
  filterTab: "ALL",
  isTransactionModalOpen: false,
  initialTransactionType: "UDHAR",
  isAddCustomerModalOpen: false,
  initialCustomerName: "",
  isAddExpenseModalOpen: false,
  initialExpenseCategory: "Supplies",
  selectedExpenseCategory: "ALL",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterTab: (tab: "ALL" | "DUE" | "ADVANCE" | "SETTLED") => set({ filterTab: tab }),
  setSelectedExpenseCategory: (category: string) => set({ selectedExpenseCategory: category }),
  resetFilters: () => set({ searchQuery: "", filterTab: "ALL", selectedExpenseCategory: "ALL" }),
  openTransactionModal: (type = "UDHAR") =>
    set({ isTransactionModalOpen: true, initialTransactionType: type }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false }),
  openAddCustomerModal: (name = "") =>
    set({ isAddCustomerModalOpen: true, initialCustomerName: name }),
  closeAddCustomerModal: () =>
    set({ isAddCustomerModalOpen: false, initialCustomerName: "" }),
  openAddExpenseModal: (category = "Supplies") =>
    set({ isAddExpenseModalOpen: true, initialExpenseCategory: category }),
  closeAddExpenseModal: () =>
    set({ isAddExpenseModalOpen: false, initialExpenseCategory: "Supplies" }),
}));

