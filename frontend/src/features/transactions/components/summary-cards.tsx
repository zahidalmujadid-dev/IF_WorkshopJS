import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { TransactionSummary } from '../types/transaction.types';

export function SummaryCards({ summary }: { summary: TransactionSummary }) {
  const cards = [
    {
      label: 'Saldo saat ini',
      value: summary.currentBalance,
      detail: 'Pemasukan dikurangi pengeluaran',
      icon: Wallet,
      style: 'bg-[#e9f1ff] text-[#1e57b7] border-[#dce8ff]',
      iconStyle: 'bg-white/80',
    },
    {
      label: 'Total pemasukan',
      value: summary.totalIncome,
      detail: 'Seluruh uang yang masuk',
      icon: ArrowDownLeft,
      style: 'bg-[#e8f6ee] text-[#197447] border-[#d5efdf]',
      iconStyle: 'bg-white/80',
    },
    {
      label: 'Total pengeluaran',
      value: summary.totalExpense,
      detail: 'Seluruh uang yang keluar',
      icon: ArrowUpRight,
      style: 'bg-[#fff0ed] text-[#bd4432] border-[#ffdfd8]',
      iconStyle: 'bg-white/80',
    },
  ];

  return (
    <section aria-label="Ringkasan keuangan" className="grid gap-4 md:grid-cols-3">
      {cards.map(({ label, value, detail, icon: Icon, style, iconStyle }) => (
        <article key={label} className={`rounded-2xl border p-5 shadow-panel ${style}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold opacity-80">{label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight sm:text-[27px]">
                {formatCurrency(value)}
              </p>
            </div>
            <span className={`rounded-xl p-2.5 ${iconStyle}`}>
              <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-xs opacity-70">{detail}</p>
        </article>
      ))}
    </section>
  );
}
