export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'FOOD'
  | 'TRANSPORTATION'
  | 'HOUSING'
  | 'UTILITIES'
  | 'ENTERTAINMENT'
  | 'SALARY'
  | 'INVESTMENT'
  | 'OTHER';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactionCount: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  search?: string;
}

export interface TransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description?: string;
}

export const TRANSACTION_CATEGORIES: Array<{
  value: TransactionCategory;
  label: string;
}> = [
  { value: 'FOOD', label: 'Makanan & minuman' },
  { value: 'TRANSPORTATION', label: 'Transportasi' },
  { value: 'HOUSING', label: 'Hunian' },
  { value: 'UTILITIES', label: 'Tagihan' },
  { value: 'ENTERTAINMENT', label: 'Hiburan' },
  { value: 'SALARY', label: 'Gaji' },
  { value: 'INVESTMENT', label: 'Investasi' },
  { value: 'OTHER', label: 'Lainnya' },
];

export const categoryLabel = (category: TransactionCategory): string =>
  TRANSACTION_CATEGORIES.find((item) => item.value === category)?.label ?? 'Lainnya';
