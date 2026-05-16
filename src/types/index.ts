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
