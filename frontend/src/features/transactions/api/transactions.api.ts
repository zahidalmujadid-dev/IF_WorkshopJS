import { apiRequest } from '@/lib/api-client';
import {
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionSummary,
} from '../types/transaction.types';

export async function fetchTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  const query = params.size ? `?${params.toString()}` : '';
  return apiRequest<Transaction[]>(`/transactions${query}`);
}

export const fetchTransactionSummary = (): Promise<TransactionSummary> =>
  apiRequest<TransactionSummary>('/transactions/summary');

export const createTransaction = (input: TransactionInput): Promise<Transaction> =>
  apiRequest<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateTransaction = (
  id: string,
  input: TransactionInput,
): Promise<Transaction> =>
  apiRequest<Transaction>(`/transactions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteTransaction = (id: string): Promise<void> =>
  apiRequest<void>(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
