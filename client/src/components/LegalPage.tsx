import type { ReactNode } from 'react';
import { PageHeader } from './ui';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] rounded-xl border border-paper-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">On this page</p>
              <nav className="mt-3 space-y-1.5" aria-label="Page sections">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="block rounded px-2 py-1 text-xs text-ink-600 hover:bg-paper-100 hover:text-ink-900">
                    {section.title}
                  </a>
                ))}
              </nav>
              <p className="mt-4 border-t border-paper-200 pt-3 text-[10px] leading-4 text-ink-400">Last updated {updated}</p>
            </div>
          </aside>

          <div className="max-w-3xl">
            <p className="mb-6 rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 text-xs text-ink-500 lg:hidden">
              Last updated {updated}
            </p>
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="font-display text-3xl text-ink-950">{section.title}</h2>
                  <div className="mt-3 space-y-4 text-sm leading-7 text-ink-600 [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink-900">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>
            <p className="mt-12 border-t border-paper-200 pt-5 text-xs text-ink-400">
              This page describes the behaviour of this project build. If you deploy or modify the app, update this
              page to match your own data practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
