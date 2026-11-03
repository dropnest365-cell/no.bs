import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader, InfoNote } from './ui';

interface CalculatorFrameProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  formTitle: string;
  formDescription: string;
  form: ReactNode;
  result: ReactNode;
  note?: ReactNode;
  relatedTitle?: string;
  related?: Array<{ label: string; to: string }>;
}

export function CalculatorFrame({
  eyebrow,
  title,
  description,
  formTitle,
  formDescription,
  form,
  result,
  note,
  relatedTitle = 'Use the numbers in a plan',
  related = [
    { label: 'Build a 90-day roadmap', to: '/roadmap' },
    { label: 'Pressure-test the idea', to: '/analyzer' },
    { label: 'Browse business guides', to: '/ideas' },
  ],
}: CalculatorFrameProps) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-2xl text-ink-950">{formTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">{formDescription}</p>
              <div className="mt-5">{form}</div>
            </div>
            {note && <InfoNote>{note}</InfoNote>}
          </div>

          <section aria-live="polite">{result}</section>
        </div>

        <div className="mt-10 rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-2xl text-ink-950">{relatedTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center justify-between gap-3 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-400 hover:bg-white"
              >
                {item.label}
                <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultCard({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-7">
      <h2 className="font-display text-2xl text-ink-950">{title}</h2>
      {subtitle && <p className="mt-1 text-xs leading-5 text-ink-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function NumberLine({ label, value, strong = false, hint }: { label: string; value: string; strong?: boolean; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-paper-100 py-2.5 last:border-b-0">
      <div>
        <p className={strong ? 'text-sm font-semibold text-ink-900' : 'text-sm text-ink-600'}>{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p>}
      </div>
      <p className={strong ? 'font-display text-2xl text-ink-950' : 'text-sm font-semibold text-ink-900'}>{value}</p>
    </div>
  );
}

export function BarRow({ label, amount, total, tone = 'brand' }: { label: string; amount: number; total: number; tone?: 'brand' | 'ink' | 'moss' }) {
  const percent = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0;
  const colors = { brand: 'bg-brand-600', ink: 'bg-ink-700', moss: 'bg-moss-600' };
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="text-ink-500">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-200">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
