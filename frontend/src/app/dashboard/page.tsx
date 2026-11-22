'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { deleteTransaction, fetchTransactionSummary, fetchTransactions, createTransaction, updateTransaction } from '@/features/transactions/api/transactions.api';
import { SummaryCards } from '@/features/transactions/components/summary-cards';
import { TransactionFormDialog } from '@/features/transactions/components/transaction-form-dialog';
import { TransactionsList } from '@/features/transactions/components/transactions-list';
import {
  Transaction,
  TransactionInput,
  TransactionSummary,
  TransactionType,
} from '@/features/transactions/types/transaction.types';
import { formatCurrency } from '@/lib/format';

type TypeFilter = 'ALL' | TransactionType;

function LoadingDashboard() {
  return (
    <div className="space-y-5" aria-label="Memuat dashboard" aria-busy="true">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-[142px] animate-pulse rounded-2xl border border-[#e9eeeb] bg-white" />)}
      </div>
      <div className="rounded-2xl border border-[#e9eeeb] bg-white p-5">
        <div className="h-7 w-48 animate-pulse rounded-md bg-[#edf1ee]" />
        <div className="mt-5 h-11 animate-pulse rounded-xl bg-[#f1f4f2]" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-[58px] animate-pulse rounded-xl bg-[#f7f9f7]" />)}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, onClear, hasFilters }: { onAdd: () => void; onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center px-5 py-14 text-center sm:py-[72px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-forest">
        <Wallet size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink">
        {hasFilters ? 'Transaksi belum ditemukan' : 'Belum ada transaksi'}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#77827b]">
        {hasFilters
          ? 'Coba ubah kata kunci atau filter jenis transaksi.'
          : 'Catat pemasukan atau pengeluaran pertamamu untuk mulai melihat ringkasan keuangan.'}
      </p>
      {hasFilters ? (
        <button type="button" onClick={onClear} className="mt-5 rounded-xl border border-[#dce3de] px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-[#f4f7f5]">
          Hapus filter
        </button>
      ) : (
        <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#204b40]">
          <Plus size={17} /> Catat transaksi pertama
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) router.replace('/login');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');

    Promise.all([
      fetchTransactions({
        ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
        search,
      }),
      fetchTransactionSummary(),
    ])
      .then(([nextTransactions, nextSummary]) => {
        if (!isCurrentRequest) return;
        setTransactions(nextTransactions);
        setSummary(nextSummary);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setError(requestError instanceof Error ? requestError.message : 'Data belum dapat dimuat.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => { isCurrentRequest = false; };
  }, [isAuthLoading, user, typeFilter, search, refreshKey]);

  const retry = useCallback(() => setRefreshKey((value) => value + 1), []);

  function openCreateDialog() {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  }

  async function saveTransaction(input: TransactionInput) {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, input);
      setNotice('Perubahan transaksi berhasil disimpan.');
    } else {
      await createTransaction(input);
      setNotice('Transaksi baru berhasil dicatat.');
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);
    retry();
  }

  async function removeTransaction(transaction: Transaction) {
    const accepted = window.confirm(`Hapus transaksi “${transaction.title}”? Tindakan ini tidak dapat dibatalkan.`);
    if (!accepted) return;

    setDeletingId(transaction.id);
    setError('');
    try {
      await deleteTransaction(transaction.id);
      setNotice('Transaksi berhasil dihapus.');
      retry();
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Transaksi belum dapat dihapus.');
    } finally {
      setDeletingId(null);
    }
  }

  function logout() {
    signOut();
    router.replace('/login');
  }

  if (isAuthLoading || !user) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-8">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-white" />
        <div className="mt-10"><LoadingDashboard /></div>
      </main>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || 'S';
  const hasFilters = Boolean(search.trim()) || typeFilter !== 'ALL';

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-[#e8ede9] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-9">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-[#d3f1de]">
                <CircleDollarSign size={22} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="text-xl font-bold tracking-[-0.04em] text-ink">saku<span className="text-[#4aa275]">.</span></span>
            </div>
            <nav aria-label="Navigasi utama" className="hidden items-center gap-1 sm:flex">
              <span className="rounded-lg bg-[#eff5f1] px-3.5 py-2 text-sm font-semibold text-forest">Ringkasan</span>
              <span className="px-3.5 py-2 text-sm font-medium text-[#89938d]">Keuangan pribadi</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#89938d]">{user.email}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8eee0] text-sm font-bold text-forest" aria-hidden="true">{initial}</span>
            <button type="button" onClick={logout} title="Keluar" aria-label="Keluar" className="rounded-xl border border-[#e7ece8] p-2.5 text-[#68746d] transition hover:bg-[#f6f8f6] hover:text-ink focus:outline-none focus:ring-2 focus:ring-forest/20">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#6b7c72]">
              <Sparkles size={15} className="text-[#5e9b78]" aria-hidden="true" /> Ruang keuangan pribadimu
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-[38px]">
              Halo, {user.name.split(' ')[0]} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 text-sm text-[#7d8881]">Pantau alur uangmu dan jaga rencana tetap berjalan.</p>
          </div>
          <button type="button" onClick={openCreateDialog} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#204b40] focus:outline-none focus:ring-4 focus:ring-forest/15">
            <Plus size={18} strokeWidth={2.3} /> Catat transaksi
          </button>
        </div>

        {isLoading && !summary ? (
          <LoadingDashboard />
        ) : error && !summary ? (
          <section role="alert" className="rounded-2xl border border-[#f1d7d2] bg-white p-7 shadow-panel sm:p-10">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0ed] text-[#be4c3b]"><SlidersHorizontal size={21} /></div>
              <h2 className="mt-4 text-lg font-bold text-ink">Data belum dapat dimuat</h2>
              <p className="mt-2 text-sm leading-6 text-[#77827b]">{error}</p>
              <button type="button" onClick={retry} className="mt-5 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#204b40]">Coba lagi</button>
            </div>
          </section>
        ) : summary ? (
          <>
            <SummaryCards summary={summary} />

            <section className="mt-6 overflow-hidden rounded-2xl border border-[#e9eeeb] bg-white shadow-panel">
              <div className="flex flex-col justify-between gap-4 border-b border-[#edf0ee] px-5 py-5 sm:px-6 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-ink">Transaksi terbaru</h2>
                    <span className="rounded-full bg-[#f0f4f1] px-2.5 py-1 text-xs font-semibold text-[#66736a]">
                      {summary.transactionCount}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#859089]">
                    Saldo tercatat sebesar <span className="font-semibold text-[#53635a]">{formatCurrency(summary.currentBalance)}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <label className="relative flex-1 sm:w-[230px]">
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#969f99]" aria-hidden="true" />
                    <span className="sr-only">Cari transaksi</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari transaksi..."
                      className="w-full rounded-xl border border-[#e3e9e5] bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none placeholder:text-[#a1aaa4] focus:border-forest focus:ring-4 focus:ring-forest/10"
                    />
                  </label>
                  <div role="group" aria-label="Filter jenis transaksi" className="flex rounded-xl bg-[#f2f5f3] p-1">
                    {([
                      ['ALL', 'Semua'],
                      ['INCOME', 'Masuk'],
                      ['EXPENSE', 'Keluar'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTypeFilter(value)}
                        aria-pressed={typeFilter === value}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${typeFilter === value ? 'bg-white text-ink shadow-sm' : 'text-[#77827b] hover:text-ink'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {notice && (
                <div role="status" className="flex items-center justify-between gap-3 border-b border-[#d8eee0] bg-[#f0faf4] px-5 py-3 text-sm font-medium text-[#28724b] sm:px-6">
                  <span>{notice}</span>
                  <button type="button" onClick={() => setNotice('')} aria-label="Tutup pesan" className="rounded-md p-1 hover:bg-[#e0f2e7]"><X size={15} /></button>
                </div>
              )}

              {error && (
                <div role="alert" className="flex flex-col items-start justify-between gap-3 border-b border-[#f3d9d5] bg-[#fff5f3] px-5 py-3.5 text-sm text-[#a13c30] sm:flex-row sm:items-center sm:px-6">
                  <span>{error}</span>
                  <button type="button" onClick={retry} className="shrink-0 font-semibold underline underline-offset-2">Coba lagi</button>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3 p-5" aria-label="Memuat transaksi" aria-busy="true">
                  {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f5f7f5]" />)}
                </div>
              ) : error ? (
                <div className="px-5 py-10 text-center text-sm text-[#7d8881]">Daftar transaksi belum diperbarui.</div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  hasFilters={hasFilters || summary.transactionCount > 0}
                  onAdd={openCreateDialog}
                  onClear={() => { setSearch(''); setTypeFilter('ALL'); }}
                />
              ) : (
                <TransactionsList
                  transactions={transactions}
                  onEdit={openEditDialog}
                  onDelete={removeTransaction}
                />
              )}
            </section>
            <div className="mt-4 flex items-center justify-between px-1 text-xs text-[#98a19b]">
              <span>{transactions.length} transaksi ditampilkan</span>
              {deletingId && <span className="inline-flex items-center gap-1.5"><ArrowUpRight size={13} /> Menghapus transaksi…</span>}
              {!deletingId && <span className="inline-flex items-center gap-1.5"><ArrowDownLeft size={13} /> Data tersimpan aman</span>}
            </div>
          </>
        ) : (
          <LoadingDashboard />
        )}
      </div>

      <TransactionFormDialog
        open={isDialogOpen}
        transaction={editingTransaction}
        onClose={() => { setIsDialogOpen(false); setEditingTransaction(null); }}
        onSave={saveTransaction}
      />
    </main>
  );
}
