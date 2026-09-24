import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Header } from '@/components';

export const metadata: Metadata = {
  title: 'Flashcards — Learn anything with simple flashcards',
  description: 'Create your own flashcards, practice with multiple-choice quizzes, and track your results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--body)] font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
