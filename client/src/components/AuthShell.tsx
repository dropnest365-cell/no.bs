import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Check } from 'lucide-react';

interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="bg-paper-50">
      <div className="container-page py-10 sm:py-14 lg:py-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to NO BS
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          <div className="order-2 lg:order-1">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3">{eyebrow}</p>
              <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-600">{description}</p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-paper-200 bg-white p-5">
                <p className="text-sm font-semibold text-ink-900">What your account does</p>
                <ul className="mt-3 space-y-2.5 text-sm text-ink-600">
                  {[
                    'Save business ideas you want to revisit',
                    'Keep roadmaps and tick off progress',
                    'Return to mentor conversations',
                    'Submit drafts for optional admin review',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-paper-300 bg-ink-950 p-5 text-paper-100">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BadgeCheck className="h-4 w-4 text-brand-300" aria-hidden="true" /> What we will not do
                </p>
                <ul className="mt-3 space-y-2.5 text-sm leading-6 text-paper-200/75">
                  <li>No income promises or fake success stories.</li>
                  <li>No selling your email to marketing lists.</li>
                  <li>No paid AI API required to use the tools.</li>
                </ul>
                <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-paper-300/50">
                  This is a local demonstration app. Review the privacy page for how data is stored.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-paper-300 bg-white p-6 shadow-soft sm:p-8">
              {children}
            </div>
            <div className="mt-4 text-center text-sm text-ink-500">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
