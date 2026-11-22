import type { Metadata } from 'next';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saku — Catatan Keuangan Pribadi',
  description: 'Kelola pemasukan dan pengeluaranmu dengan Saku.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
