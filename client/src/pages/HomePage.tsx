import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Calculator, Check, ChevronRight, Compass, ExternalLink,
  Lightbulb, Map, Search, Sparkles, Target, Wallet,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Category, Guide, IdeaCard, Tool } from '../lib/types';
import { formatDate, inrCompact, pricingLabel } from '../lib/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { IdeaCard as IdeaCardComponent } from '../components/IdeaCard';
import { ErrorBlock, LoadingBlock, SectionHeading } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState<IdeaCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [ideasResponse, categoriesResponse, guidesResponse, toolsResponse] = await Promise.all([
        api<{ items: IdeaCard[] }>('/api/ideas?featured=true&limit=6&sort=featured'),
        api<{ items: Category[] }>('/api/categories'),
        api<{ items: Guide[] }>('/api/guides'),
        api<{ items: Tool[] }>('/api/tools'),
      ]);
      setFeatured(ideasResponse.items);
      setCategories(categoriesResponse.items);
      setGuides(guidesResponse.items.slice(0, 3));
      setTools(toolsResponse.items.slice(0, 6));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the homepage content.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/ideas?q=${encodeURIComponent(trimmed)}` : '/ideas');
  }

  return (
    <div>
      <section className="border-b border-paper-200 bg-paper-50">
        <div className="container-page py-12 sm:py-16 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-5 inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
                Business, without the noise
              </p>
              <h1 className="max-w-3xl font-display text-[3.4rem] leading-[0.95] tracking-tight text-ink-950 sm:text-7xl lg:text-[5.5rem]">
                Stop scrolling.
                <br />
                <span className="italic text-brand-700">Start building.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-600 sm:text-lg">
                NO BS helps you find a viable business idea, understand what it really takes,
                run the numbers and plan your first 90 days — built for India, priced in rupees,
                with the hype removed.
              </p>

              <form onSubmit={submitSearch} className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row" role="search">
                <label htmlFor="home-search" className="sr-only">Search business ideas</label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <input
                    id="home-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search: bakery, tutoring, web design…"
                    className="input h-[48px] pl-10"
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="btn-primary h-[48px] shrink-0 px-5">
                  Search ideas
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/ideas/online" className="btn-dark group">
                  Explore online businesses
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link to="/ideas/offline" className="btn-secondary group">
                  Explore offline businesses
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-moss-600" aria-hidden="true" /> 40 detailed guides</span>
                <span className="inline-flex items-center gap-1.5"><Compass className="h-4 w-4 text-moss-600" aria-hidden="true" /> 19 categories</span>
                <span className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-moss-600" aria-hidden="true" /> INR estimates, clearly labelled</span>
              </div>
            </div>

            <aside className="relative lg:mt-10">
              <div className="rounded-2xl border border-paper-300 bg-white p-6 shadow-soft sm:p-7">
                <div className="flex items-center justify-between border-b border-paper-200 pb-4">
                  <span className="eyebrow">A field guide, not a hype machine</span>
                  <Lightbulb className="h-5 w-5 text-brand-600" aria-hidden="true" />
                </div>
                <ul className="mt-5 space-y-4">
                  {[
                    'Costs, steps and risks on every idea — not just a list of buzzwords.',
                    'Official government links separated from our planning estimates.',
                    'Free calculators that show the maths, not a magic success number.',
                    'No income guarantees. No fake guru screenshots. No "passive income" promises.',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-ink-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid grid-cols-3 divide-x divide-paper-200 border-t border-paper-200 pt-5 text-center">
                  <div>
                    <p className="font-display text-2xl text-ink-950">40</p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">Business guides</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-ink-950">3</p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">Free calculators</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-ink-950">₹0</p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">To use NO BS</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 px-2 text-[11px] leading-5 text-ink-400">
                Costs are planning estimates for India and vary by city, supplier and scale. Always verify official requirements.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-paper-200 bg-white">
        <div className="container-page grid gap-4 py-6 sm:grid-cols-3">
          {[
            { icon: Target, title: 'Specific, not generic', text: 'Every guide names customers, costs, setup steps and real risks.' },
            { icon: BadgeCheck, title: 'Sources you can check', text: 'Official portals linked. Estimates labelled as estimates.' },
            { icon: Calculator, title: 'Numbers that add up', text: 'Calculators for startup cost, profit and pricing in INR.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-ink-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="Start here"
          title="Featured business ideas"
          description="Selected guides for people who want to start small, test demand and avoid unnecessary spend."
          action={<Link to="/ideas" className="btn-secondary btn-sm">View all 40 ideas <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
        />
        {loading ? (
          <LoadingBlock label="Loading featured ideas…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((idea) => <IdeaCardComponent key={idea.id} idea={idea} />)}
          </div>
        )}
      </section>

      <section className="border-y border-paper-200 bg-paper-50">
        <div className="container-page py-14 sm:py-20">
          <SectionHeading
            eyebrow="Find your lane"
            title="Popular categories"
            description="Online services you can run from a laptop, or local businesses built on footfall and trust."
            action={<Link to="/ideas" className="btn-ghost btn-sm">Browse everything <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
          />
          {loading ? (
            <LoadingBlock label="Loading categories…" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.slug}
                  to={`/ideas?category=${category.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-paper-200 bg-white p-4 transition-colors hover:border-ink-400"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-100 text-ink-700 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{category.name}</span>
                    <span className="text-[11px] text-ink-500">{category.ideaCount} guides</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="The method"
          title="How NO BS works"
          description="A simple loop: choose something specific, test the numbers, then earn evidence before you spend big."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Pick a real idea',
              text: 'Filter by online or offline, budget, category and difficulty. Read the full guide before deciding — including the risks.',
              link: '/ideas',
              linkText: 'Browse the library',
            },
            {
              step: '02',
              title: 'Check the numbers',
              text: 'Model startup costs, profit margins and selling price with free calculators. Label every assumption and keep a reserve.',
              link: '/tools',
              linkText: 'Open the calculators',
            },
            {
              step: '03',
              title: 'Build a plan',
              text: 'Generate a six-stage roadmap, save it, and track tasks from customer research through launch and growth.',
              link: '/roadmap',
              linkText: 'Generate a roadmap',
            },
          ].map((item) => (
            <div key={item.step} className="relative rounded-2xl border border-paper-200 bg-white p-6 sm:p-7">
              <span className="font-display text-4xl text-brand-300">{item.step}</span>
              <h3 className="mt-4 font-display text-2xl text-ink-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
              <Link to={item.link} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900">
                {item.linkText} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-paper-200 bg-ink-950 text-paper-100">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI business mentor
            </p>
            <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
              Ask the awkward questions.
              <br />
              <span className="italic text-brand-300">Get a usable next step.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-paper-200/70">
              Use the mentor to compare ideas, think through pricing, plan customer outreach and understand
              registration basics. It is a thinking partner, not an oracle — answers may be incomplete and need verification.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/mentor" className="btn-primary">
                Open the mentor <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/analyzer" className="btn border-paper-300/30 bg-transparent text-paper-100 hover:bg-white/10">
                Analyze an idea
              </Link>
            </div>
            <p className="mt-5 max-w-md text-[11px] leading-5 text-paper-300/50">
              Works without an AI API key using a rule-based mentor. If an AI provider is configured, responses are clearly labelled and still require verification.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-300/50">Example exchange</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-paper-300/60">Illustrative</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="ml-8 rounded-xl rounded-tr-sm bg-paper-100 p-3.5 text-ink-900">
                I have ₹50,000 and 15 hours a week. Should I start a cloud kitchen or freelance web design?
              </div>
              <div className="mr-4 rounded-xl rounded-tl-sm border border-white/10 bg-ink-900 p-4 text-paper-200/85">
                <p className="font-semibold text-white">Both can start small, but they are not the same risk.</p>
                <p className="mt-2 leading-6">
                  A cloud kitchen is capital- and operations-heavy: licensing, kitchen setup, food waste and daily delivery.
                  Web design is skill-based: your main constraint is finding clients, not buying equipment.
                </p>
                <p className="mt-2 leading-6">
                  With ₹50,000, I would test web design first if you can already ship work. Keep the kitchen as a later option
                  after you have customer evidence and a working menu.
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-4 text-paper-300/40">
              This is an illustrative example, not a live AI response or financial advice. Your own mentor answers will be labelled by source.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="Do the maths"
          title="Useful business tools"
          description="Free calculators and a directory of verified official links. No sign-up required for the calculators."
          action={<Link to="/tools" className="btn-secondary btn-sm">All tools <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Startup Cost Calculator', text: 'Add equipment, rent, stock, marketing and registration to see a realistic starting range.', to: '/tools/startup-cost-calculator', icon: Wallet },
            { title: 'Profit Calculator', text: 'Work out gross profit, net profit and margin from revenue, COGS and operating costs.', to: '/tools/profit-calculator', icon: Calculator },
            { title: 'Pricing Calculator', text: 'Set a selling price from product cost, operating expenses and a target margin.', to: '/tools/pricing-calculator', icon: Target },
          ].map((item) => (
            <Link key={item.title} to={item.to} className="group rounded-2xl border border-paper-200 bg-white p-6 transition-colors hover:border-ink-400">
              <item.icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 font-display text-2xl text-ink-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                Open calculator <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        {!loading && tools.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-paper-200 bg-white">
            {tools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 border-b border-paper-200 px-5 py-3.5 last:border-b-0 hover:bg-paper-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{tool.name}</p>
                  <p className="truncate text-xs text-ink-500">{tool.category}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-paper-300 bg-paper-100 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                    {pricingLabel(tool.pricing)}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-paper-200 bg-paper-50">
        <div className="container-page py-14 sm:py-20">
          <SectionHeading
            eyebrow="Read before you spend"
            title="Latest guides"
            description="Plain-language explanations of registration, tax, pricing, bookkeeping and compliance — with official links."
            action={<Link to="/guides" className="btn-secondary btn-sm">All guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
          />
          {loading ? (
            <LoadingBlock label="Loading guides…" />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {guides.map((guide) => (
                <Link key={guide.slug} to={`/guides/${guide.slug}`} className="group flex h-full flex-col rounded-2xl border border-paper-200 bg-white p-6 transition-colors hover:border-ink-400">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{guide.category}</span>
                    <span className="text-[11px] text-ink-400">{formatDate(guide.lastVerifiedAt)}</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight text-ink-950 group-hover:text-brand-700">{guide.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-ink-600">{guide.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    Read guide <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="overflow-hidden rounded-2xl border border-paper-300 bg-white">
          <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:p-12">
            <div>
              <p className="eyebrow mb-3">Start with evidence</p>
              <h2 className="font-display text-4xl leading-tight text-ink-950 sm:text-5xl">
                One free account. A clearer next step.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-ink-600">
                Save ideas, keep roadmaps, track progress and return to your mentor conversations.
                Registration is free and takes less than a minute.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary">Create a free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/analyzer" className="btn-secondary">Try the idea analyzer</Link>
              </div>
            </div>
            <div className="rounded-xl border border-paper-200 bg-paper-50 p-5 text-sm">
              <div className="flex items-center gap-2 font-semibold text-ink-900">
                <Map className="h-4 w-4 text-brand-600" aria-hidden="true" />
                What you can save
              </div>
              <ul className="mt-4 space-y-2.5 text-ink-600">
                {['Bookmarked business ideas', 'Six-stage roadmaps with progress', 'Mentor conversation history', 'Analysis drafts for admin review'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-moss-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-paper-200 pt-3 text-[11px] leading-5 text-ink-400">
                Your email is used for login only. No marketing email is sent by this local app.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
