import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  categoryLabel,
  Transaction,
} from '../types/transaction.types';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function CategoryPill({ category }: { category: Transaction['category'] }) {
  return (
    <span className="inline-flex rounded-full bg-[#f1f4f2] px-2.5 py-1 text-xs font-medium text-[#58645e]">
      {categoryLabel(category)}
    </span>
  );
}

function Amount({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'INCOME';
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${isIncome ? 'text-[#16804a]' : 'text-[#c34837]'}`}>
      <Icon size={15} aria-hidden="true" />
      {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
    </span>
  );
}

function Actions({ transaction, onEdit, onDelete }: Omit<TransactionsListProps, 'transactions'> & { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        aria-label={`Ubah ${transaction.title}`}
        title="Ubah transaksi"
        className="rounded-lg p-2 text-[#69736e] transition hover:bg-[#edf2ef] hover:text-ink focus:outline-none focus:ring-2 focus:ring-forest/30"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        aria-label={`Hapus ${transaction.title}`}
        title="Hapus transaksi"
        className="rounded-lg p-2 text-[#9b6157] transition hover:bg-[#fff0ed] hover:text-[#b83c2e] focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function TransactionsList({ transactions, onEdit, onDelete }: TransactionsListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-[#edf0ee] text-xs uppercase tracking-[0.11em] text-[#89928d]">
              <th className="px-5 py-4 font-semibold">Transaksi</th>
              <th className="px-5 py-4 font-semibold">Kategori</th>
              <th className="px-5 py-4 font-semibold">Tanggal</th>
              <th className="px-5 py-4 text-right font-semibold">Jumlah</th>
              <th className="px-5 py-4"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f2f0]">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="group transition hover:bg-[#fbfcfb]">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{transaction.title}</p>
                  {transaction.description && (
                    <p className="mt-1 max-w-[260px] truncate text-xs text-[#818b85]">
                      {transaction.description}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4"><CategoryPill category={transaction.category} /></td>
                <td className="px-5 py-4 text-sm text-[#737e77]">{formatDate(transaction.date)}</td>
                <td className="px-5 py-4 text-right"><Amount transaction={transaction} /></td>
                <td className="px-3 py-4">
                  <Actions transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[#edf0ee] md:hidden">
        {transactions.map((transaction) => (
          <article key={transaction.id} className="px-4 py-4 first:pt-1 last:pb-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{transaction.title}</p>
                <p className="mt-1 text-xs text-[#7f8983]">{formatDate(transaction.date)}</p>
              </div>
              <div className="shrink-0 text-right"><Amount transaction={transaction} /></div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <CategoryPill category={transaction.category} />
              <Actions transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
