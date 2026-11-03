import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { api, ApiError, buildQuery } from '../lib/api';
import type { Category, IdeaCard, Mode, Pagination } from '../lib/types';
import { useDebouncedValue } from '../lib/hooks';
import { PageHeader, ErrorBlock, LoadingBlock, EmptyState, Pagination as PaginationBar, InfoNote } from '../components/ui';
import { IdeaCard as IdeaCardComponent } from '../components/IdeaCard';

const BUDGETS = [
  { value: '', label: 'Any budget' },
  { value: '10000', label: 'Under ₹10,000' },
  { value: '50000', label: 'Under ₹50,000' },
  { value: '100000', label: 'Under ₹1 lakh' },
  { value: '500000', label: 'Under ₹5 lakh' },
  { value: '1000000', label: 'Under ₹10 lakh' },
];

export function IdeasPage({ mode }: { mode?: Mode }) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get('category') || '';
  const difficulty = params.get('difficulty') || '';
  const budget = params.get('budget') || '';
  const sort = params.get('sort') || 'featured';
  const modeFilter = mode || (params.get('mode') as Mode | null) || '';
  const page = Number(params.get('page') || 1);

  const queryString = useMemo(
    () =>
      buildQuery({
        q: debouncedSearch.trim(),
        category,
        difficulty,
        budget,
        sort,
        mode: modeFilter,
        page,
        limit: 12,
      }),
    [debouncedSearch, category, difficulty, budget, sort, modeFilter, page],
  );

  useEffect(() => {
    api<{ items: Category[] }>('/api/categories')
      .then((response) => setCategories(response.items))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const currentQ = params.get('q') || '';
    if (debouncedSearch.trim() !== currentQ) {
      const next = new URLSearchParams(params);
      if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
      else next.delete('q');
      next.delete('page');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api<{ items: IdeaCard[]; pagination: Pagination }>(`/api/ideas${queryString}`, { signal: controller.signal })
      .then((response) => {
        setIdeas(response.items);
        setPagination(response.pagination);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'Could not load business ideas.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [queryString]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }

  function clearFilters() {
    setSearch('');
    const next = new URLSearchParams();
    if (mode) next.set('mode', mode);
    setParams(next);
  }

  const activeFilters = [category, difficulty, budget, modeFilter, search.trim()].filter(Boolean).length;

  const title = mode === 'ONLINE'
    ? 'Online business ideas'
    : mode === 'OFFLINE'
      ? 'Offline business ideas'
      : 'Explore business ideas';
  const description = mode === 'ONLINE'
    ? 'Businesses you can run from a laptop: services, content, e-commerce, digital products and software. Filter by budget and difficulty.'
    : mode === 'OFFLINE'
      ? 'Local businesses built on footfall, trust and operations: food, retail, services and repairs. Compare setup costs before committing.'
      : '40 detailed guides across online and offline businesses. Filter by budget, category and difficulty, then read the full guide before spending money.';

  function setMode(value: string) {
    updateParam('mode', value);
  }

  const filterContent = (
    <div className="space-y-5">
      <div>
        <label htmlFor="filter-category" className="label">Category</label>
        <select id="filter-category" value={category} onChange={(event) => updateParam('category', event.target.value)} className="select">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name} ({item.ideaCount})</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-difficulty" className="label">Difficulty</label>
        <select id="filter-difficulty" value={difficulty} onChange={(event) => updateParam('difficulty', event.target.value)} className="select">
          <option value="">Any difficulty</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>
      <div>
        <label htmlFor="filter-budget" className="label">Starting budget</label>
        <select id="filter-budget" value={budget} onChange={(event) => updateParam('budget', event.target.value)} className="select">
          {BUDGETS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <p className="field-hint">Shows ideas whose estimated minimum starting cost fits the budget.</p>
      </div>
      {!mode && (
        <div>
          <label htmlFor="filter-mode" className="label">Business type</label>
          <select id="filter-mode" value={modeFilter} onChange={(event) => setMode(event.target.value)} className="select">
            <option value="">Online and offline</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      )}
      <div>
        <label htmlFor="filter-sort" className="label">Sort by</label>
        <select id="filter-sort" value={sort} onChange={(event) => updateParam('sort', event.target.value)} className="select">
          <option value="featured">Featured first</option>
          <option value="newest">Newest</option>
          <option value="cost-low">Lowest starting cost</option>
          <option value="cost-high">Highest starting cost</option>
          <option value="title">A–Z</option>
        </select>
      </div>
      <button type="button" onClick={clearFilters} className="btn-secondary btn-sm w-full">
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear filters
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={mode === 'ONLINE' ? 'Work from anywhere' : mode === 'OFFLINE' ? 'Build locally' : 'The library'}
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            {!mode && (
              <>
                <button type="button" onClick={() => setMode('ONLINE')} className={modeFilter === 'ONLINE' ? 'btn-dark btn-sm' : 'btn-secondary btn-sm'}>Online</button>
                <button type="button" onClick={() => setMode('OFFLINE')} className={modeFilter === 'OFFLINE' ? 'btn-dark btn-sm' : 'btn-secondary btn-sm'}>Offline</button>
              </>
            )}
            {mode && (
              <Link to={mode === 'ONLINE' ? '/ideas/offline' : '/ideas/online'} className="btn-secondary btn-sm">
                View {mode === 'ONLINE' ? 'offline' : 'online'} ideas
              </Link>
            )}
          </div>
        }
      />

      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-full shrink-0 lg:block lg:w-[260px]">
            <div className="sticky top-[92px] rounded-2xl border border-paper-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
                </h2>
                {activeFilters > 0 && <span className="text-[11px] text-ink-500">{activeFilters} active</span>}
              </div>
              {filterContent}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <label htmlFor="idea-search" className="sr-only">Search business ideas</label>
                <input
                  id="idea-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ideas, skills or customer types…"
                  className="input h-[44px] pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="btn-secondary btn-sm lg:hidden">
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" /> Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
                </button>
                <p className="whitespace-nowrap text-xs text-ink-500">
                  {loading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'idea' : 'ideas'}`}
                </p>
              </div>
            </div>

            {filtersOpen && (
              <div className="mb-5 rounded-2xl border border-paper-200 bg-white p-5 lg:hidden">
                {filterContent}
              </div>
            )}

            {loading ? (
              <LoadingBlock label="Loading business ideas…" />
            ) : error ? (
              <ErrorBlock message={error} />
            ) : ideas.length === 0 ? (
              <EmptyState
                title="No ideas match those filters"
                description="Try a higher budget, a different category, or clear the search. The full library has 40 guides."
                action={<button type="button" onClick={clearFilters} className="btn-primary btn-sm">Clear filters</button>}
              />
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  {ideas.map((idea) => (
                    <IdeaCardComponent
                      key={idea.id}
                      idea={idea}
                      onBookmarkChange={(bookmarked) =>
                        setIdeas((current) => current.map((item) => item.id === idea.id ? { ...item, bookmarked } : item))
                      }
                    />
                  ))}
                </div>
                <PaginationBar page={pagination.page} pages={pagination.pages} onChange={(nextPage) => updateParam('page', String(nextPage))} />
              </>
            )}

            <div className="mt-8">
              <InfoNote>
                Starting costs are planning estimates, not quotes. Actual costs vary by city, supplier, scale and whether you already own equipment.
                Read each guide's risks and legal notes before committing money.
              </InfoNote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
