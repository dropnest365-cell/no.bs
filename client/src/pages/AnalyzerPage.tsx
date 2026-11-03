import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Lightbulb, Loader2, Save, Sparkles, Target, Users,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Analysis } from '../lib/types';
import { inrRange, inr } from '../lib/format';
import { PageHeader, ErrorBlock, Badge, InfoNote, LoadingBlock, SuccessNote } from '../components/ui';

function analysisToMarkdown(idea: string, analysis: Analysis): string {
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n');
  return `# Idea analysis: ${idea}

> Source: ${analysis.source === 'AI' ? 'AI-generated' : 'Rule-based'}. This analysis has been submitted for admin review and is not published automatically.

## Summary
${analysis.summary}

## Target market
${analysis.targetMarket}

## Customer problem
${analysis.customerProblem}

## Target audience
${analysis.targetAudience}

## Competition
${analysis.competition}

## Startup requirements
${list(analysis.startupRequirements)}

## Revenue models
${list(analysis.revenueModels)}

## Risks
${list(analysis.risks)}

## Advantages
${list(analysis.advantages)}

## Disadvantages
${list(analysis.disadvantages)}

## Skills needed
${list(analysis.skillsNeeded)}

## Suggested improvements
${list(analysis.improvements)}

## First steps
${list(analysis.firstSteps)}

## Verdict
${analysis.verdict}

${analysis.disclaimer}`;
}

export function AnalyzerPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [idea, setIdea] = useState(params.get('idea') || '');
  const [budget, setBudget] = useState(params.get('budget') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [source, setSource] = useState<'AI' | 'RULE_BASED' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (idea.trim().length < 10) {
      setError('Describe the idea in at least 10 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setSubmitMessage('');
    setSubmitError('');
    try {
      const response = await api<{ analysis: Analysis; source: 'AI' | 'RULE_BASED' }>('/api/analyzer/analyze', {
        method: 'POST',
        body: {
          idea: idea.trim(),
          budget: budget ? Number(budget) : undefined,
          location: location.trim() || undefined,
        },
      });
      setAnalysis(response.analysis);
      setSource(response.source);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not analyze the idea.');
    } finally {
      setLoading(false);
    }
  }

  async function submitForReview() {
    if (!analysis) return;
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    try {
      await api('/api/analyzer/submit-review', {
        method: 'POST',
        body: {
          idea,
          title: `Idea analysis: ${idea.slice(0, 100)}`,
          body: analysisToMarkdown(idea, analysis),
          source: analysis.source,
        },
      });
      setSubmitMessage('Submitted for admin review. It will not be published automatically.');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Could not submit the analysis.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Business idea analyzer"
        title={<>Pressure-test the idea<br /><span className="italic text-brand-700">before the market does.</span></>}
        description="Describe an idea and get a structured first-pass analysis: audience, problem, competition, requirements, risks and improvements. It is a thinking tool, not a prediction."
      />

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:gap-10">
          <section className="lg:sticky lg:top-[92px] lg:self-start">
            <form onSubmit={submit} className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-2xl text-ink-950">Describe your idea</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">The more specific you are, the more useful the output. No account needed to analyze.</p>

              <div className="mt-5">
                <label htmlFor="analyzer-idea" className="label">The business idea</label>
                <textarea
                  id="analyzer-idea"
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  className="textarea min-h-[160px]"
                  placeholder="Example: A subscription service that delivers fresh, ready-to-cook dinner kits to working professionals in Pune at ₹350–₹450 per meal."
                  maxLength={2000}
                />
                <p className="field-hint">{idea.length}/2000 · Include the customer, problem, location and rough price if you know them.</p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="analyzer-budget" className="label">Budget (₹)</label>
                  <input
                    id="analyzer-budget"
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="input"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label htmlFor="analyzer-location" className="label">Location</label>
                  <input
                    id="analyzer-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="input"
                    placeholder="Pune, Maharashtra"
                    maxLength={120}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {loading ? 'Analyzing…' : 'Analyze this idea'}
              </button>

              <div className="mt-4 border-t border-paper-200 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Try an example</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Home bakery in Jaipur', 'Freelance video editing studio', 'Mobile bike repair service', 'Online course for Excel skills'].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setIdea(example)}
                      className="rounded-full border border-paper-300 bg-paper-50 px-2.5 py-1 text-[11px] text-ink-600 hover:border-ink-400"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </form>
            <InfoNote className="mt-4">
              We do not send your idea to a third party unless an AI provider is configured. Even then, the output is not market research or a guarantee.
            </InfoNote>
          </section>

          <section aria-live="polite">
            {error && <ErrorBlock message={error} className="mb-5" />}
            {loading && <div className="rounded-2xl border border-paper-200 bg-white"><LoadingBlock label="Structuring the analysis…" /></div>}

            {!loading && !analysis && (
              <div className="flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-dashed border-paper-300 bg-white/60 px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Target className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-3xl text-ink-950">Your analysis will appear here</h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-ink-500">
                  You will get a structured view of the market, customer problem, competition, requirements, risks and next steps — with every estimate labelled.
                </p>
                <div className="mt-6 grid w-full max-w-md gap-2 text-left text-xs text-ink-500">
                  {['No invented market-size statistics', 'No income or success guarantees', 'Explicit assumptions and next steps'].map((item) => (
                    <p key={item} className="flex items-center gap-2 rounded-lg border border-paper-200 bg-white px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-moss-600" aria-hidden="true" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {!loading && analysis && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={source === 'AI' ? 'brand' : 'neutral'}>
                        {source === 'AI' ? 'AI-generated analysis' : 'Rule-based analysis'}
                      </Badge>
                      <span className="text-[11px] text-ink-400">Unverified · use as a starting hypothesis</span>
                    </div>
                    <button type="button" onClick={() => { setAnalysis(null); setSubmitMessage(''); }} className="text-xs font-semibold text-ink-500 hover:text-ink-900">
                      Start over
                    </button>
                  </div>
                  <h2 className="mt-4 font-display text-3xl leading-tight text-ink-950">First-pass assessment</h2>
                  <p className="mt-3 text-sm leading-7 text-ink-700">{analysis.summary}</p>
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-6 text-ink-700">
                    <p className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                      <span><strong>Verdict:</strong> {analysis.verdict}</span>
                    </p>
                  </div>
                </div>

                {(analysis.estimatedStartupCost || analysis.budgetCheck) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {analysis.estimatedStartupCost && (
                      <div className="rounded-2xl border border-paper-200 bg-white p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Similar guide's cost range</p>
                        <p className="mt-2 font-display text-3xl text-ink-950">{inrRange(analysis.estimatedStartupCost.min, analysis.estimatedStartupCost.max)}</p>
                        <p className="mt-2 text-xs leading-5 text-ink-500">{analysis.estimatedStartupCost.note}</p>
                      </div>
                    )}
                    {analysis.budgetCheck && (
                      <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Budget check</p>
                        <p className="mt-2 text-sm leading-6 text-ink-700">{analysis.budgetCheck}</p>
                        {budget && <p className="mt-2 text-xs text-ink-500">Stated budget: {inr(Number(budget))}</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <AnalysisBlock icon={<Target className="h-4 w-4" />} title="Target market" text={analysis.targetMarket} />
                  <AnalysisBlock icon={<Users className="h-4 w-4" />} title="Target audience" text={analysis.targetAudience} />
                  <AnalysisBlock title="Customer problem" text={analysis.customerProblem} />
                  <AnalysisBlock title="Competition" text={analysis.competition} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AnalysisList title="Startup requirements" items={analysis.startupRequirements} />
                  <AnalysisList title="Possible revenue models" items={analysis.revenueModels} />
                  <AnalysisList title="Skills needed" items={analysis.skillsNeeded} />
                  <AnalysisList title="Risks to plan for" items={analysis.risks} tone="warn" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AnalysisList title="Advantages" items={analysis.advantages} tone="good" />
                  <AnalysisList title="Disadvantages" items={analysis.disadvantages} tone="warn" />
                </div>

                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                    <Lightbulb className="h-5 w-5 text-brand-700" aria-hidden="true" /> Suggested improvements
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {analysis.improvements.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink-700">
                        <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />{item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
                  <h3 className="font-display text-2xl text-ink-950">Do this first</h3>
                  <ol className="mt-4 space-y-3">
                    {analysis.firstSteps.map((item, index) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-ink-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">{index + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                {analysis.relatedIdeas.length > 0 && (
                  <div className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
                    <h3 className="font-display text-2xl text-ink-950">Closest guides in the library</h3>
                    <div className="mt-4 divide-y divide-paper-200">
                      {analysis.relatedIdeas.map((item) => (
                        <Link key={item.slug} to={`/ideas/${item.slug}`} className="flex items-center justify-between gap-4 py-3 group">
                          <div>
                            <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{item.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{item.summary}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-ink-400">{inrRange(item.startingCostMin, item.startingCostMax)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-paper-300 bg-paper-100 p-4 text-xs leading-6 text-ink-500">
                  {analysis.disclaimer}
                </div>

                <div className="rounded-2xl border border-paper-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-ink-900">Save this analysis for admin review</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-500">
                    Optionally submit it to the review queue. An admin must approve it before any part becomes public community content. It will not be used to update factual guides automatically.
                  </p>
                  {submitMessage && <SuccessNote className="mt-3">{submitMessage}</SuccessNote>}
                  {submitError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{submitError}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {user ? (
                      <button type="button" onClick={submitForReview} disabled={submitting || Boolean(submitMessage)} className="btn-secondary btn-sm">
                        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
                        {submitMessage ? 'Submitted' : 'Submit for review'}
                      </button>
                    ) : (
                      <Link to="/login" className="btn-secondary btn-sm">Log in to save <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                    )}
                    <span className="text-[10px] text-ink-400">Nothing is published automatically.</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AnalysisBlock({ title, text, icon }: { title: string; text: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-paper-200 bg-white p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        {icon && <span className="text-brand-600">{icon}</span>}
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-7 text-ink-600">{text}</p>
    </div>
  );
}

function AnalysisList({ title, items, tone = 'neutral' }: { title: string; items: string[]; tone?: 'neutral' | 'warn' | 'good' }) {
  return (
    <div className="rounded-2xl border border-paper-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-ink-600">
            <span
              className={
                tone === 'warn'
                  ? 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600'
                  : tone === 'good'
                    ? 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-600'
                    : 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400'
              }
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
