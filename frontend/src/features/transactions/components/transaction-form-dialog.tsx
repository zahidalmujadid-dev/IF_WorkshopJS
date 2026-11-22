'use client';

import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { localDateInputValue } from '@/lib/format';
import {
  Transaction,
  TransactionCategory,
  TransactionInput,
  TransactionType,
  TRANSACTION_CATEGORIES,
} from '../types/transaction.types';

interface TransactionFormDialogProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (input: TransactionInput) => Promise<void>;
}

export function TransactionFormDialog({
  open,
  transaction,
  onClose,
  onSave,
}: TransactionFormDialogProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState<TransactionCategory>('FOOD');
  const [date, setDate] = useState(localDateInputValue());
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(transaction?.title ?? '');
    setAmount(transaction ? String(transaction.amount) : '');
    setType(transaction?.type ?? 'EXPENSE');
    setCategory(transaction?.category ?? 'FOOD');
    setDate(transaction ? new Date(transaction.date).toISOString().slice(0, 10) : localDateInputValue());
    setDescription(transaction?.description ?? '');
    setError('');
  }, [transaction, open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        amount: Number(amount),
        type,
        category,
        date,
        ...(description.trim() ? { description: description.trim() } : {}),
      });
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Transaksi belum dapat disimpan.');
    } finally {
      setIsSaving(false);
    }
  }

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#dce3de] bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-[#a2aaa5] focus:border-forest focus:ring-4 focus:ring-forest/10';
  const labelClass = 'text-sm font-semibold text-[#35423b]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#10201e]/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5c8a72]">
              Catat arus kas
            </p>
            <h2 id="transaction-dialog-title" className="mt-1 text-2xl font-bold tracking-tight text-ink">
              {transaction ? 'Ubah transaksi' : 'Transaksi baru'}
            </h2>
            <p className="mt-1 text-sm text-[#77827b]">Isi detail pemasukan atau pengeluaranmu.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup dialog"
            className="rounded-xl p-2 text-[#6e7972] transition hover:bg-[#f0f3f1] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transaction-title" className={labelClass}>Nama transaksi</label>
            <input
              id="transaction-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldClass}
              placeholder="Contoh: Belanja mingguan"
              maxLength={120}
              required
              autoFocus
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Jenis transaksi</legend>
            <div className="mt-2 grid grid-cols-2 rounded-xl bg-[#f1f4f2] p-1">
              {(['EXPENSE', 'INCOME'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  aria-pressed={type === option}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    type === option
                      ? option === 'INCOME'
                        ? 'bg-white text-[#197447] shadow-sm'
                        : 'bg-white text-[#b74534] shadow-sm'
                      : 'text-[#758078] hover:text-ink'
                  }`}
                >
                  {option === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="transaction-amount" className={labelClass}>Jumlah (IDR)</label>
              <input
                id="transaction-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="999999999999.99"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={fieldClass}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label htmlFor="transaction-category" className={labelClass}>Kategori</label>
              <select
                id="transaction-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as TransactionCategory)}
                className={fieldClass}
                required
              >
                {TRANSACTION_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="transaction-date" className={labelClass}>Tanggal</label>
              <input
                id="transaction-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="transaction-description" className={labelClass}>Catatan <span className="font-normal text-[#929a95]">(opsional)</span></label>
              <input
                id="transaction-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={fieldClass}
                placeholder="Tambahkan catatan"
                maxLength={1000}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-[#f4d3ce] bg-[#fff3f1] px-3.5 py-3 text-sm text-[#aa3527]">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-[#dce3de] px-5 py-3 text-sm font-semibold text-[#536059] transition hover:bg-[#f5f7f5] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#204b40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Menyimpan…' : transaction ? 'Simpan perubahan' : 'Simpan transaksi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
