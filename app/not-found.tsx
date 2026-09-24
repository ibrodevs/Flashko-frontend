import Link from 'next/link';
import { Button } from '@/components';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] mb-4">
        <AlertCircle className="w-8 h-8 text-[var(--blue)]" />
      </div>
      <h1 className="text-[32px] font-extrabold text-[var(--ink)] tracking-tight">
        404 — Page Not Found
      </h1>
      <p className="text-[15px] text-[var(--muted)] mt-2 max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
