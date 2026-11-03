import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2, SearchX } from 'lucide-react';
import type { Difficulty, Mode } from '../lib/types';
import { cn, difficultyLabel } from '../lib/format';

export function Badge({ children, tone = 'neutral', className }: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'green' | 'amber' | 'red' | 'dark';
  className?: string;
}) {
  const tones = {
    neutral: 'border-paper-300 bg-paper-100 text-ink-600',
    brand: 'border-brand-200 bg-brand-50 text-brand-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    red: 'border-red-200 bg-red-50 text-red-700',
    dark: 'border-ink-800 bg-ink-900 text-paper-50',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

export function ModeBadge({ mode }: { mode: Mode | string }) {
  return <Badge tone={mode === 'ONLINE' ? 'brand' : 'green'}>{mode === 'ONLINE' ? 'Online' : 'Offline'}</Badge>;
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty | string }) {
  const tone = difficulty === 'BEGINNER' ? 'green' : difficulty === 'ADVANCED' ? 'red' : 'amber';
  return <Badge tone={tone}>{difficultyLabel(difficulty)}</Badge>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  bordered = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  bordered?: boolean;
}) {
  return (
    <header className={cn('bg-paper-50', bordered && 'border-b border-paper-200')}>
      <div className="container-page py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description && <p className="mt-4 max-w-2xl text-base leading-7 text-ink-600 sm:text-lg">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl leading-tight text-ink-950 sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm leading-7 text-ink-600 sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-[220px] flex-col items-center justify-center gap-3 text-sm text-ink-500', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800', className)} role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-red-700">{message}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-3 font-semibold underline underline-offset-4">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuccessNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900', className)} role="status">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-paper-300 bg-paper-50 p-4 text-sm leading-6 text-ink-600', className)}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-paper-300 bg-paper-50 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-paper-300 bg-white text-ink-400">
        {icon || <SearchX className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="font-display text-2xl text-ink-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-paper-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-700">{children}</p>;
}

export function TimeNote({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-10 flex items-center justify-between gap-4 border-t border-paper-200 pt-6" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-secondary btn-sm"
      >
        Previous
      </button>
      <span className="text-xs font-medium text-ink-500">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="btn-secondary btn-sm"
      >
        Next
      </button>
    </nav>
  );
}
