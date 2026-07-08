export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer' | 'borrow' | 'reimburse' | 'refund' | 'deposit';
  categoryL1: string;
  categoryL2: string;
  merchant: string;
  note: string;
  source: 'manual' | 'excel' | 'voice';
  createdAt: string;
}

export interface Category {
  id: string;
  parentId: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  type?: 'expense' | 'income' | 'transfer' | 'borrow' | 'reimburse' | 'refund' | 'deposit';
}

export interface MerchantRule {
  id: string;
  merchantName: string;
  categoryL1: string;
  categoryL2: string;
  useCount: number;
}

export interface Budget {
  id: string;
  amount: number;
  month: string;
  createdAt: string;
}
