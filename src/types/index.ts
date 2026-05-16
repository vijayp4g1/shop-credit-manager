export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  address?: string;
  balance: number;
  deleted_at?: string;
  created_at: string;
}

export type TransactionType = "CREDIT" | "PAYMENT";

export interface Transaction {
  id: string;
  shop_id: string;
  customer_id: string;
  type: TransactionType;
  amount: number;
  payment_mode?: string;
  description?: string;
  created_by: string;
  created_at: string;
  customers?: { name: string };
}

export interface Expense {
  id: string;
  shop_id: string;
  category: string;
  amount: number;
  description?: string;
  payment_mode?: string;
  expense_date: string;
  created_by: string;
  created_at: string;
}
