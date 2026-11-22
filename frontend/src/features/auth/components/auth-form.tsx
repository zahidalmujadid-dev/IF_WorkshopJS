'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowUpRight, Check, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { useAuth } from './auth-provider';

type AuthMode = 'login' | 'register';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const { signIn, signUp, user, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) await signUp({ name: name.trim(), email: email.trim(), password });
      else await signIn({ email: email.trim(), password });
      router.replace('/dashboard');
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-[#dce3de] bg-white px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-[#a0aaa3] focus:border-forest focus:ring-4 focus:ring-forest/10';

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.04fr_.96fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-forest px-12 py-11 text-white lg:flex lg:flex-col lg:justify-between xl:px-[9vw]">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-8 h-[260px] w-[260px] rounded-full border border-white/10" />
        <div className="absolute -bottom-36 -left-32 h-[420px] w-[420px] rounded-full bg-[#1d5144]/70" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-3 font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c5f0d9] text-forest">
            <CircleDollarSign size={23} />
          </span>
          <span className="text-xl">saku<span className="text-[#9fd7b8]">.</span></span>
        </Link>

        <div className="relative z-10 max-w-xl py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a9ddbf]">Uangmu, lebih terarah</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-0.045em] xl:text-6xl">
            Kenali alur uangmu. <span className="text-[#afe1c3]">Rencanakan langkah berikutnya.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Catat pemasukan dan pengeluaran dalam satu ruang yang aman, sederhana, dan selalu milikmu.
          </p>

          <div className="mt-11 max-w-[390px] rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#b8ebcd]/15 text-[#b8ebcd]">
                <ShieldCheck size={22} />
              </span>
              <div>
                <p className="font-semibold text-white">Ruang keuangan milikmu</p>
                <p className="mt-1.5 text-sm leading-6 text-white/65">
                  Catatan setiap akun tersimpan terpisah dan hanya dapat diakses pemiliknya.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-medium text-[#b8ebcd]">
              <Check size={15} /> Privasi dijaga di setiap permintaan
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/45">Privasi dan kendali keuangan tetap di tanganmu.</p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-[8vw]">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-ink lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-forest"><CircleDollarSign size={21} /></span>
            <span className="text-lg">saku<span className="text-[#48a474]">.</span></span>
          </Link>
          <p className="text-sm text-[#7b857e]">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <Link href={isRegister ? '/login' : '/register'} className="font-semibold text-forest hover:underline">
              {isRegister ? 'Masuk' : 'Daftar'}
            </Link>
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#599275]">
              {isRegister ? 'Mulai kelola keuangan' : 'Selamat datang kembali'}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
              {isRegister ? 'Buat akun Saku' : 'Masuk ke akunmu'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#77827b]">
              {isRegister
                ? 'Buat ruang pribadi untuk mencatat setiap pemasukan dan pengeluaran.'
                : 'Lanjutkan melihat ringkasan dan catatan keuanganmu.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-[#35423b]">Nama lengkap</label>
                <input id="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Nama kamu" autoComplete="name" maxLength={80} required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-[#35423b]">Email</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="nama@email.com" autoComplete="email" maxLength={254} required />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-semibold text-[#35423b]">Kata sandi</label>
                {isRegister && <span className="text-xs text-[#929b95]">Minimal 6 karakter</span>}
              </div>
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder={isRegister ? 'Buat kata sandi' : 'Masukkan kata sandi'} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={6} maxLength={72} required />
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-[#f2d3cf] bg-[#fff4f2] px-4 py-3 text-sm text-[#a53a2d]">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting || isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#204b40] focus:outline-none focus:ring-4 focus:ring-forest/15 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Memproses…' : isRegister ? 'Buat akun' : 'Masuk'}
              {!isSubmitting && <ArrowUpRight size={17} />}
            </button>
          </form>

          <div className="mt-7 grid gap-3 border-t border-[#edf0ee] pt-6 text-xs text-[#7f8983] sm:grid-cols-2">
            <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#55916e]" />Data transaksi milikmu</span>
            <span className="flex items-center gap-2"><Check size={15} className="text-[#55916e]" />Password tersimpan terenkripsi</span>
          </div>
        </div>

        <p className="text-center text-xs text-[#a0a8a3]">© 2026 Saku. Catat dengan tenang.</p>
      </section>
    </main>
  );
}
