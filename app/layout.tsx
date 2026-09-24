import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Header } from '@/components';

export const metadata: Metadata = {
  title: 'Flashko — Изучайте что угодно с помощью простых карточек',
  description: 'Создавайте свои наборы карточек, тренируйтесь с помощью тестов с выбором ответа и отслеживайте результаты.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--body)] font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
