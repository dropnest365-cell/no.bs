import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Calculator, ExternalLink, Search, Target, Wallet,
} from 'lucide-react';
import { api, ApiError, buildQuery } from '../lib/api';
import type { Tool } from '../lib/types';
import { useDebouncedValue } from '../lib/hooks';
import { formatDate, pricingLabel } from '../lib/format';
import { PageHeader, ErrorBlock, LoadingBlock, EmptyState, Badge, InfoNote } from '../components/ui';

const CALCULATORS = [
  {
    title: 'Startup cost calculator',
    description: 'Add one-time setup costs, a contingency and runway to see how much cash you actually need.',
    to: '/tools/startup-cost-calculator',
    icon: Wallet,
  },
  {
    title: 'Profit calculator',
    description: 'Turn revenue, cost of goods and operating expenses into gross profit, net profit and margin.',
    to: '/tools/profit-calculator',
    icon: Calculator,
  },
  {
    title: 'Pricing calculator',
    description: 'Work backwards from unit cost and target margin to a selling price that covers fixed costs.',
    to: '/tools/pricing-calculator',
    icon: Target,
  },
];

const PRICING_OPTIONS = [
  { value: '', label: 'Any pricing' },
  { value: 'FREE', label: 'Free' },
  { value: 'FREEMIUM', label: 'Freemium' },
  { value: 'PAID', label: 'Paid' },
  { value: 'UNKNOWN', label: 'Pricing on official site' },
];

export function ToolsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const debouncedSearch = useDebouncedValue(search, 350);
  const category = params.get('category') || '';
  const pricing = params.get('pricing') || '';
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(
    () => buildQuery({ q: debouncedSearch.trim(), category, pricing }),
    [debouncedSearch, category, pricing],
  );

  useEffect(() => {
    const current = params.get('q') || '';
    if (debouncedSearch.trim() !== current) {
      const next = new URLSearchParams(params);
      if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
      else next.delete('q');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api<{ items: Tool[]; categories: string[]; total: number }>(`/api/tools${query}`, { signal: controller.signal })
      .then((response) => {
        setTools(response.items);
        setCategories(response.categories);
        setTotal(response.total);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'Could not load the tools directory.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  function clearFilters() {
    setSearch('');
    setParams(new URLSearchParams());
  }

  const filtered = Boolean(category || pricing || debouncedSearch.trim());

  return (
    <div>
      <PageHeader
        eyebrow="Tools and calculators"
        title={<>Do the maths<br /><span className="italic text-brand-700">before you spend.</span></>}
        description="Free calculators that show the working, plus a directory of first-party tools and official portals. No account needed for the maths."
      />

      <section className="container-page py-10 sm:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {CALCULATORS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col rounded-2xl border border-paper-200 bg-white p-6 transition-colors hover:border-ink-400"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-2xl text-ink-950 group-hover:text-brand-700">{item.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                Open calculator <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-paper-200 bg-paper-50">
        <div className="container-page py-10 sm:py-14">
          <div className="flex flex-col gap-5 border-b border-paper-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">The directory</p>
              <h2 className="font-display text-3xl text-ink-950 sm:text-4xl">Software and official portals</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">
                First-party links only. We do not use affiliate links, and pricing is marked “check official site” when
                it changes too often to state reliably.
              </p>
            </div>
            <p className="text-xs text-ink-500">{loading ? 'Loading…' : `${total} ${total === 1 ? 'tool' : 'tools'}`}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <label htmlFor="tool-search" className="sr-only">Search tools</label>
              <input
                id="tool-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input h-[44px] pl-10"
                placeholder="Search: accounting, payments, design…"
              />
            </div>
            <div>
              <label htmlFor="tool-category" className="sr-only">Category</label>
              <select id="tool-category" value={category} onChange={(event) => updateParam('category', event.target.value)} className="select h-[44px]">
                <option value="">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tool-pricing" className="sr-only">Pricing</label>
              <select id="tool-pricing" value={pricing} onChange={(event) => updateParam('pricing', event.target.value)} className="select h-[44px]">
                {PRICING_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingBlock label="Loading the tools directory…" className="mt-8" />
          ) : error ? (
            <ErrorBlock message={error} className="mt-8" />
          ) : tools.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No tools match those filters"
                description="Try a different category or clear the search. The directory includes free software, freemium products and official government portals."
                action={filtered ? <button type="button" onClick={clearFilters} className="btn-primary btn-sm">Clear filters</button> : undefined}
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-paper-200 bg-white p-5 transition-colors hover:border-ink-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{tool.category}</p>
                      <h3 className="mt-1.5 font-display text-2xl leading-tight text-ink-950 group-hover:text-brand-700">{tool.name}</h3>
                    </div>
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-ink-300 group-hover:text-ink-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-6 text-ink-600">{tool.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-paper-200 pt-3">
                    <Badge tone={tool.pricing === 'FREE' ? 'green' : tool.pricing === 'PAID' ? 'amber' : 'neutral'}>
                      {pricingLabel(tool.pricing)}
                    </Badge>
                    <span className="text-[10px] text-ink-400">Checked {formatDate(tool.lastVerifiedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          <InfoNote className="mt-8">
            <strong className="text-ink-800">Pricing and features change.</strong> The label is a rough guide only.
            Always confirm the current price, limits and data terms on the official site. Listing a tool is not an
            endorsement, and no listing here is paid.
          </InfoNote>
        </div>
      </section>
    </div>
  );
}
