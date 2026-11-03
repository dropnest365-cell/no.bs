import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, ExternalLink, Landmark, ShieldCheck,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Guide } from '../lib/types';
import { formatDate } from '../lib/format';
import { Markdown } from '../components/Markdown';
import { Badge, ErrorBlock, LoadingBlock } from '../components/ui';

export function GuideDetailPage() {
  const { slug } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [related, setRelated] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError('');
    setNotFound(false);
    api<{ guide: Guide; related: Guide[] }>(`/api/guides/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!active) return;
        setGuide(response.guide);
        setRelated(response.related);
        document.title = `${response.guide.title} — NO BS`;
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiError ? err.message : 'Could not load this guide.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <div className="container-page py-20"><LoadingBlock label="Loading the guide…" /></div>;
  }

  if (notFound) {
    return (
      <div className="container-page py-20 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-display text-5xl text-ink-950">That guide does not exist</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">It may have been unpublished or the link may be incorrect.</p>
        <Link to="/guides" className="btn-primary mt-6">Browse all guides</Link>
      </div>
    );
  }

  if (error || !guide) {
    return <div className="container-page py-20"><ErrorBlock message={error || 'Guide unavailable'} /></div>;
  }

  return (
    <div>
      <div className="border-b border-paper-200 bg-paper-50">
        <div className="container-page py-5">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/guides" className="hover:text-ink-900">Guides</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-ink-700">{guide.title}</span>
          </nav>
        </div>
      </div>

      <header className="border-b border-paper-200 bg-white">
        <div className="container-page py-8 sm:py-12">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={guide.isCommunity ? 'amber' : 'brand'}>
                {guide.isCommunity ? 'Community answer' : guide.category}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Last reviewed {formatDate(guide.lastVerifiedAt)}
              </span>
            </div>
            <h1 className="font-display text-4xl leading-[1.02] text-ink-950 sm:text-5xl lg:text-6xl">{guide.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-600 sm:text-lg">{guide.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            {guide.isCommunity ? (
              <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-ink-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink-900">This is a community-reviewed answer</p>
                  <p className="mt-1">
                    It was approved by an administrator but is not a professionally verified guide and may have no
                    official sources. Verify legal, tax and licensing details on official portals before acting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex items-start gap-3 rounded-xl border border-paper-300 bg-paper-50 p-4 text-sm leading-6 text-ink-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink-800">General information, not professional advice</p>
                  <p className="mt-1">
                    This guide explains the landscape and links to official portals. Rules, fees and thresholds
                    change; confirm the current requirement for your state and activity.
                  </p>
                </div>
              </div>
            )}

            <Markdown content={guide.body || ''} />

            <div className="mt-10 rounded-xl border border-paper-200 bg-paper-50 p-5">
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                <BookOpen className="h-5 w-5 text-brand-600" aria-hidden="true" /> How to use this guide
              </h2>
              <p className="mt-2 text-sm leading-7 text-ink-600">
                Turn the guidance into a small next step: check one official link, write down one question for a
                professional, or run the numbers in a calculator. This page is a map, not a substitute for a
                chartered accountant or lawyer.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/roadmap" className="btn-secondary btn-sm">Build a roadmap</Link>
                <Link to="/tools" className="btn-secondary btn-sm">Open calculators</Link>
                <Link to="/contact" className="btn-ghost btn-sm">Report an outdated link</Link>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-12 border-t border-paper-200 pt-8">
                <h2 className="font-display text-3xl text-ink-950">Related guides</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      to={`/guides/${item.slug}`}
                      className="group rounded-xl border border-paper-200 bg-white p-5 transition-colors hover:border-ink-400"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{item.category}</p>
                      <h3 className="mt-2 font-display text-2xl leading-tight text-ink-950 group-hover:text-brand-700">{item.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-500">{item.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <Landmark className="h-4 w-4" aria-hidden="true" /> Sources to verify
              </p>
              {guide.sources.length > 0 ? (
                <ul className="mt-3 divide-y divide-paper-100">
                  {guide.sources.map((source) => (
                    <li key={source.url + source.label}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-2 py-2.5"
                      >
                        <span>
                          <span className="block text-sm font-medium text-ink-800 group-hover:text-brand-700">{source.label}</span>
                          {source.note && <span className="mt-0.5 block text-[11px] leading-4 text-ink-500">{source.note}</span>}
                          <span className="mt-0.5 block break-all text-[10px] text-ink-400">{source.url}</span>
                        </span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300 group-hover:text-ink-700" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs leading-5 text-ink-500">
                  No official sources are attached to this community answer. Treat the claims as unverified and
                  check the relevant government portal.
                </p>
              )}
              <p className="mt-3 border-t border-paper-200 pt-3 text-[10px] leading-4 text-ink-400">
                Links were last checked on {formatDate(guide.lastVerifiedAt)}. Government pages can move; if a link
                fails, search the department name directly.
              </p>
            </div>

            <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Next step</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">
                Reading is not the same as deciding. Write down what you will verify, who you will ask and what
                small test you can run this week.
              </p>
              <Link to="/analyzer" className="btn-primary mt-4 w-full">
                Analyze your idea
              </Link>
            </div>

            <Link to="/guides" className="inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-ink-500 hover:text-ink-900">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All guides
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
