import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Search, ShieldCheck } from 'lucide-react';
import { api, ApiError, buildQuery } from '../lib/api';
import type { Guide } from '../lib/types';
import { useDebouncedValue } from '../lib/hooks';
import { formatDate } from '../lib/format';
import { PageHeader, ErrorBlock, LoadingBlock, EmptyState, Badge } from '../components/ui';

export function GuidesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const debouncedSearch = useDebouncedValue(search, 350);
  const category = params.get('category') || '';
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(
    () => buildQuery({ q: debouncedSearch.trim(), category }),
    [debouncedSearch, category],
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
    api<{ items: Guide[]; categories: string[] }>(`/api/guides${query}`, { signal: controller.signal })
      .then((response) => {
        setGuides(response.items);
        setCategories(response.categories);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'Could not load the guides.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  function setCategory(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set('category', value);
    else next.delete('category');
    setParams(next);
  }

  function clearFilters() {
    setSearch('');
    setParams(new URLSearchParams());
  }

  return (
    <div>
      <PageHeader
        eyebrow="Read before you spend"
        title={<>The boring parts,<br /><span className="italic text-brand-700">explained properly.</span></>}
        description="Registration, tax, licensing, bookkeeping and pricing — written in plain language and linked to official portals so you can verify the current rules."
      />

      <div className="container-page py-10 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-paper-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={category === '' ? 'btn-dark btn-sm' : 'btn-secondary btn-sm'}
            >
              All guides
            </button>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={category === item ? 'btn-dark btn-sm' : 'btn-secondary btn-sm'}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <label htmlFor="guide-search" className="sr-only">Search guides</label>
            <input
              id="guide-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input h-[44px] pl-10"
              placeholder="Search: GST, Udyam, pricing…"
            />
          </div>
        </div>

        {loading ? (
          <LoadingBlock label="Loading guides…" className="mt-8" />
        ) : error ? (
          <ErrorBlock message={error} className="mt-8" />
        ) : guides.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No guides match that search"
              description="Try a broader term or a different category. The library covers registration, tax, compliance, finance and strategy."
              action={<button type="button" onClick={clearFilters} className="btn-primary btn-sm">Clear filters</button>}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                to={`/guides/${guide.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-paper-200 bg-white p-6 transition-colors hover:border-ink-400"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={guide.isCommunity ? 'amber' : 'brand'}>{guide.isCommunity ? 'Community answer' : guide.category}</Badge>
                  {!guide.isCommunity && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink-400">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" /> {guide.sources.length} source{guide.sources.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-display text-2xl leading-tight text-ink-950 group-hover:text-brand-700">{guide.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{guide.excerpt}</p>
                <div className="mt-5 flex items-center justify-between border-t border-paper-200 pt-4">
                  <span className="text-[11px] text-ink-400">Reviewed {formatDate(guide.lastVerifiedAt)}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    Read <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-paper-300 bg-ink-950 p-6 text-paper-100 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Editorial standard
              </p>
              <h2 className="mt-2 font-display text-3xl text-white">Official links, labelled estimates, no fake certainty.</h2>
              <p className="mt-2 text-sm leading-6 text-paper-200/70">
                Rules and fees change. Each guide points to the first-party portal so you can check the current
                position for your state and activity. Community answers are labelled separately.
              </p>
            </div>
            <Link to="/about" className="btn-primary shrink-0">
              How we review content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
