import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, ExternalLink, Landmark,
  ListChecks, Megaphone, ShieldCheck, Sparkles, Target, TrendingUp, Users, Wallet, Wrench,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Idea } from '../lib/types';
import { formatDate, inr, inrRange } from '../lib/format';
import { safeExternalUrl } from '../lib/url';
import { BookmarkButton } from '../components/BookmarkButton';
import { IdeaCard } from '../components/IdeaCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { ErrorBlock, LoadingBlock, ModeBadge, DifficultyBadge, TimeNote, InfoNote, Badge } from '../components/ui';

export function IdeaDetailPage() {
  const { slug } = useParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [related, setRelated] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError('');
    setNotFound(false);
    api<{ idea: Idea; related: Idea[] }>(`/api/ideas/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!active) return;
        setIdea(response.idea);
        setRelated(response.related);
        document.title = `${response.idea.title} — NO BS`;
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          document.title = 'Idea not found — NO BS';
        } else {
          setError(err instanceof ApiError ? err.message : 'Could not load this business idea.');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <div className="container-page py-20"><LoadingBlock label="Loading the full guide…" /></div>;
  }

  if (notFound) {
    return (
      <div className="container-page py-20 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-display text-5xl text-ink-950">That guide does not exist</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">It may have been unpublished or the link may be incorrect.</p>
        <Link to="/ideas" className="btn-primary mt-6">Browse all ideas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    );
  }

  if (error || !idea) {
    return <div className="container-page py-20"><ErrorBlock message={error || 'Guide unavailable'} /></div>;
  }

  return (
    <div>
      <div className="border-b border-paper-200 bg-paper-50">
        <div className="container-page py-6">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/ideas" className="hover:text-ink-900">Ideas</Link>
            <span aria-hidden="true">/</span>
            <Link to={idea.mode === 'ONLINE' ? '/ideas/online' : '/ideas/offline'} className="hover:text-ink-900">
              {idea.mode === 'ONLINE' ? 'Online' : 'Offline'}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-ink-700">{idea.title}</span>
          </nav>
        </div>
      </div>

      <header className="border-b border-paper-200 bg-white">
        <div className="container-page py-8 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <ModeBadge mode={idea.mode} />
                <DifficultyBadge difficulty={idea.difficulty} />
                <span className="chip">
                  <CategoryIcon slug={idea.category?.slug} className="h-3 w-3" />
                  {idea.category?.name}
                </span>
              </div>
              <h1 className="font-display text-4xl leading-[1.02] text-ink-950 sm:text-5xl lg:text-6xl">{idea.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-ink-600 sm:text-lg">{idea.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  <strong className="font-semibold text-ink-800">{inrRange(idea.startingCostMin, idea.startingCostMax)}</strong> est. starting cost
                </span>
                <TimeNote>{idea.timeCommitment}</TimeNote>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Last reviewed {formatDate(idea.lastVerifiedAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <BookmarkButton ideaId={idea.id} initial={idea.bookmarked} />
              <Link to={`/mentor?q=${encodeURIComponent(`How do I start a ${idea.title.toLowerCase()} business in India?`)}`} className="btn-secondary">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Ask the mentor
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <InfoNote className="mb-8">
              <strong className="text-ink-800">Estimates, not guarantees.</strong> Cost ranges are planning estimates based on typical Indian market conditions.
              They vary by city, supplier, scale and whether you already own equipment. Revenue figures are deliberately not promised.
            </InfoNote>

            <section aria-labelledby="overview">
              <h2 id="overview" className="font-display text-3xl text-ink-950">The honest overview</h2>
              <div className="mt-4 space-y-4">
                {idea.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-[15px] leading-7 text-ink-700">{paragraph}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="glance" className="mt-10">
              <h2 id="glance" className="font-display text-3xl text-ink-950">At a glance</h2>
              <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-paper-200 bg-paper-200 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Model', value: idea.mode === 'ONLINE' ? 'Online business' : 'Offline business' },
                  { label: 'Category', value: idea.category?.name || '—' },
                  { label: 'Difficulty', value: idea.difficulty.charAt(0) + idea.difficulty.slice(1).toLowerCase() },
                  { label: 'Starting cost (est.)', value: inrRange(idea.startingCostMin, idea.startingCostMax) },
                  { label: 'Time commitment', value: idea.timeCommitment.split(';')[0] },
                  { label: 'Last reviewed', value: formatDate(idea.lastVerifiedAt) },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{item.label}</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-ink-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="requirements" className="mt-10">
              <h2 id="requirements" className="font-display text-3xl text-ink-950">What you need</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-paper-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <Target className="h-4 w-4 text-brand-600" aria-hidden="true" /> Skills
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {idea.skills.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-ink-600">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-paper-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <Wrench className="h-4 w-4 text-brand-600" aria-hidden="true" /> Equipment and resources
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {idea.equipment.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-ink-600">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="money" className="mt-10">
              <h2 id="money" className="font-display text-3xl text-ink-950">Money: estimates and streams</h2>
              <div className="mt-4 rounded-xl border border-paper-200 bg-paper-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Estimated starting cost</p>
                <p className="mt-1 font-display text-4xl text-ink-950">{inrRange(idea.startingCostMin, idea.startingCostMax)}</p>
                <p className="mt-1 text-xs text-ink-500">
                  Planning range only — {inr(idea.startingCostMin)} to {inr(idea.startingCostMax)}. Not a quote or a loan estimate.
                </p>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Recurring expenses</h3>
                  <ul className="mt-3 space-y-2">
                    {idea.recurringExpenses.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-ink-600">
                        <span className="text-ink-400">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Ways to earn revenue</h3>
                  <ul className="mt-3 space-y-2">
                    {idea.revenueStreams.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-ink-600">
                        <TrendingUp className="mt-1 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="customers" className="mt-10">
              <h2 id="customers" className="font-display text-3xl text-ink-950">Customers and competition</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <Users className="h-4 w-4 text-brand-600" aria-hidden="true" /> Target customers
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-ink-600">{idea.targetCustomers}</p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" /> Competition reality
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-ink-600">{idea.competition}</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="steps" className="mt-10">
              <h2 id="steps" className="font-display text-3xl text-ink-950">How to start, step by step</h2>
              <ol className="mt-5 space-y-5">
                {idea.steps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-xs font-bold text-brand-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-sm leading-7 text-ink-700">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="marketing" className="mt-10">
              <h2 id="marketing" className="flex items-center gap-2 font-display text-3xl text-ink-950">
                <Megaphone className="h-6 w-6 text-brand-600" aria-hidden="true" /> Marketing that fits
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {idea.marketing.map((item) => (
                  <li key={item} className="flex gap-2 rounded-lg border border-paper-200 bg-white p-3 text-sm leading-6 text-ink-600">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-moss-600" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="risks" className="mt-10">
              <h2 id="risks" className="flex items-center gap-2 font-display text-3xl text-ink-950">
                <AlertTriangle className="h-6 w-6 text-brand-600" aria-hidden="true" /> Risks and challenges
              </h2>
              <ul className="mt-4 space-y-3">
                {idea.risks.map((item) => (
                  <li key={item} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm leading-6 text-ink-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="legal" className="mt-10">
              <h2 id="legal" className="flex items-center gap-2 font-display text-3xl text-ink-950">
                <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden="true" /> Legal and registration
              </h2>
              <ul className="mt-4 space-y-3">
                {idea.legal.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-ink-700">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-ink-500">
                This is general information, not legal or tax advice. Rules, fees and thresholds change. Verify requirements for your state and activity on official portals.
              </p>
            </section>

            <section aria-labelledby="resources" className="mt-10">
              <h2 id="resources" className="font-display text-3xl text-ink-950">Official resources</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {idea.resources.map((resource) => {
                  const href = safeExternalUrl(resource.url);
                  const body = (
                    <div>
                      <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{resource.label}</p>
                      {resource.note && <p className="mt-1 text-xs leading-5 text-ink-500">{resource.note}</p>}
                      <p className="mt-2 break-all text-[11px] text-ink-400">{resource.url}</p>
                    </div>
                  );
                  const className = 'group flex items-start justify-between gap-3 rounded-xl border border-paper-200 bg-white p-4 transition-colors hover:border-ink-400';
                  return href ? (
                    <a key={resource.url + resource.label} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                      {body}
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                    </a>
                  ) : (
                    <div key={resource.url + resource.label} className={className}>{body}</div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-xl border border-paper-200 bg-paper-50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                  <Landmark className="h-4 w-4" aria-hidden="true" /> Sources and verification
                </p>
                <p className="mt-2 text-xs leading-6 text-ink-500">
                  Official links above were last checked on {formatDate(idea.lastVerifiedAt)}. Cost ranges and operational claims are estimates, not government statistics.
                  Government rules and fees can change; always confirm on the linked portal. If a link is outdated, please report it via the contact page.
                </p>
              </div>
            </section>

            {related.length > 0 && (
              <section className="mt-12 border-t border-paper-200 pt-8" aria-labelledby="related">
                <h2 id="related" className="font-display text-3xl text-ink-950">Related business ideas</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => <IdeaCard key={item.id} idea={item} />)}
                </div>
              </section>
            )}
          </article>

          <aside className="lg:sticky lg:top-[92px] lg:self-start">
            <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft">
              <p className="eyebrow">Plan it properly</p>
              <p className="mt-3 font-display text-3xl text-ink-950">{inrRange(idea.startingCostMin, idea.startingCostMax)}</p>
              <p className="text-xs text-ink-500">Estimated starting range, not a quote</p>

              <div className="mt-4 space-y-3 border-t border-paper-200 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">Difficulty</span>
                  <DifficultyBadge difficulty={idea.difficulty} />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink-500">Time</span>
                  <span className="max-w-[180px] text-right text-xs leading-5 text-ink-700">{idea.timeCommitment}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">Category</span>
                  <Badge>{idea.category?.name}</Badge>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link to={`/roadmap?idea=${encodeURIComponent(idea.title)}&budget=${idea.startingCostMin}`} className="btn-primary w-full">
                  <ListChecks className="h-4 w-4" aria-hidden="true" /> Build a roadmap
                </Link>
                <Link to={`/analyzer?idea=${encodeURIComponent(`I want to start a ${idea.title.toLowerCase()} business.`)}`} className="btn-secondary w-full">
                  Analyze this idea
                </Link>
                <Link to="/tools/startup-cost-calculator" className="btn-secondary w-full">
                  <Wallet className="h-4 w-4" aria-hidden="true" /> Cost calculator
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Verified vs estimated
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-ink-500">
                <li><strong className="text-ink-700">Official links:</strong> point to government or first-party sources.</li>
                <li><strong className="text-ink-700">Costs and time:</strong> planning estimates, clearly labelled.</li>
                <li><strong className="text-ink-700">Income:</strong> never guaranteed or predicted.</li>
              </ul>
            </div>

            <Link to="/ideas" className="mt-4 inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-ink-500 hover:text-ink-900">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to all ideas
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
