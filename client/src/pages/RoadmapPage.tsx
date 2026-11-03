import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Loader2, Map, Plus, Save, ShieldCheck, Trash2, Wallet,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Roadmap, RoadmapStage } from '../lib/types';
import { formatDate, inr, inrCompact } from '../lib/format';
import { PageHeader, ErrorBlock, LoadingBlock, Badge, EmptyState, SuccessNote } from '../components/ui';

const TIME_OPTIONS = ['5–10 hours per week', '10–15 hours per week', '15–25 hours per week', '25–40 hours per week', 'Full-time (40+ hours)'];

function computeProgress(stages: RoadmapStage[]): number {
  const tasks = stages.flatMap((stage) => stage.tasks);
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
}

export function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [idea, setIdea] = useState(params.get('idea') || '');
  const [budget, setBudget] = useState(params.get('budget') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [skills, setSkills] = useState(params.get('skills') || '');
  const [timeAvailable, setTimeAvailable] = useState('10–15 hours per week');
  const [goals, setGoals] = useState(params.get('goals') || '');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingTasks, setSavingTasks] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const openId = params.get('open');

  useEffect(() => {
    if (!user) {
      setSavedRoadmaps([]);
      return;
    }
    setLoadingList(true);
    api<{ items: Roadmap[] }>('/api/roadmaps')
      .then((response) => setSavedRoadmaps(response.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your saved roadmaps.'))
      .finally(() => setLoadingList(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user || !openId || savedId === openId) return;
    const item = savedRoadmaps.find((roadmap) => roadmap.id === openId);
    if (item) openRoadmap(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, savedRoadmaps, user?.id, savedId]);

  const overallTaskCount = useMemo(() => roadmap?.stages.flatMap((stage) => stage.tasks).length || 0, [roadmap]);
  const doneTaskCount = useMemo(() => roadmap?.stages.flatMap((stage) => stage.tasks).filter((task) => task.done).length || 0, [roadmap]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (idea.trim().length < 3) {
      setError('Describe the business idea first.');
      return;
    }
    if (!location.trim()) {
      setError('Add a city or service area.');
      return;
    }
    setGenerating(true);
    setError('');
    setNotice('');
    const payload = {
      idea: idea.trim(),
      budget: Number(budget) || 0,
      location: location.trim(),
      skills: skills.trim(),
      timeAvailable,
      goals: goals.trim(),
    };
    try {
      if (user) {
        const response = await api<{ roadmap: Roadmap; saved: boolean }>('/api/roadmaps', { method: 'POST', body: payload });
        setRoadmap(response.roadmap);
        setSavedId(response.roadmap.id || null);
        setNotice('Roadmap saved to your account. Tick tasks as you complete them.');
        setSavedRoadmaps((current) => [response.roadmap, ...current.filter((item) => item.id !== response.roadmap.id)]);
      } else {
        const response = await api<{ roadmap: Roadmap; saved: boolean }>('/api/roadmaps/preview', { method: 'POST', body: payload });
        setRoadmap(response.roadmap);
        setSavedId(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate the roadmap.');
    } finally {
      setGenerating(false);
    }
  }

  function openRoadmap(item: Roadmap) {
    setRoadmap(item);
    setSavedId(item.id || null);
    setIdea(item.idea);
    setBudget(String(item.budget));
    setLocation(item.location);
    setSkills(item.skills);
    setTimeAvailable(item.timeAvailable);
    setGoals(item.goals);
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleTask(stageKey: string, taskId: string) {
    if (!roadmap) return;
    const updatedStages = roadmap.stages.map((stage) =>
      stage.key === stageKey
        ? { ...stage, tasks: stage.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) }
        : stage,
    );
    const updated = { ...roadmap, stages: updatedStages, progress: computeProgress(updatedStages) };
    setRoadmap(updated);
    if (!savedId) return;
    setSavingTasks(true);
    try {
      await api(`/api/roadmaps/${savedId}`, {
        method: 'PATCH',
        body: {
          stages: updatedStages.map((stage) => ({
            key: stage.key,
            title: stage.title,
            summary: stage.summary,
            timeline: stage.timeline,
            tasks: stage.tasks.map((task) => ({ id: task.id, title: task.title, priority: task.priority, done: task.done })),
          })),
        },
      });
      setSavedRoadmaps((current) => current.map((item) => item.id === savedId ? { ...updated, updatedAt: new Date().toISOString() } : item));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your progress.');
    } finally {
      setSavingTasks(false);
    }
  }

  async function deleteRoadmap(id: string) {
    if (!window.confirm('Delete this saved roadmap? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api(`/api/roadmaps/${id}`, { method: 'DELETE' });
      setSavedRoadmaps((current) => current.filter((item) => item.id !== id));
      if (savedId === id) {
        setRoadmap(null);
        setSavedId(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the roadmap.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Business roadmap generator"
        title={<>A plan you can<br /><span className="italic text-brand-700">actually follow.</span></>}
        description="Turn a business idea, budget and available time into a six-stage plan with tasks, priorities and progress tracking. Save it to your account and come back to it."
        actions={user ? <span className="chip"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Saved to your account</span> : <Link to="/login" className="btn-secondary btn-sm">Log in to save roadmaps</Link>}
      />

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-5 lg:sticky lg:top-[92px] lg:self-start">
            <form onSubmit={generate} className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-2xl text-ink-950">Your starting point</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">Be honest about time and money. The plan is built from your constraints.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="roadmap-idea" className="label">Business idea</label>
                  <input id="roadmap-idea" value={idea} onChange={(event) => setIdea(event.target.value)} className="input" placeholder="Home bakery, tutoring centre, web design…" maxLength={500} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="roadmap-budget" className="label">Budget (₹)</label>
                    <input id="roadmap-budget" type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} className="input" placeholder="50000" />
                  </div>
                  <div>
                    <label htmlFor="roadmap-location" className="label">Location</label>
                    <input id="roadmap-location" value={location} onChange={(event) => setLocation(event.target.value)} className="input" placeholder="City / area" maxLength={120} />
                  </div>
                </div>
                <div>
                  <label htmlFor="roadmap-skills" className="label">Skills you already have</label>
                  <textarea id="roadmap-skills" value={skills} onChange={(event) => setSkills(event.target.value)} className="textarea min-h-[76px]" placeholder="Baking, basic bookkeeping, Instagram content…" maxLength={1000} />
                </div>
                <div>
                  <label htmlFor="roadmap-time" className="label">Time available</label>
                  <select id="roadmap-time" value={timeAvailable} onChange={(event) => setTimeAvailable(event.target.value)} className="select">
                    {TIME_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="roadmap-goals" className="label">Your goal for 6 months</label>
                  <textarea id="roadmap-goals" value={goals} onChange={(event) => setGoals(event.target.value)} className="textarea min-h-[76px]" placeholder="First 20 paying customers and ₹30,000 monthly revenue…" maxLength={1000} />
                </div>
              </div>

              <button type="submit" disabled={generating} className="btn-primary mt-5 w-full">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Map className="h-4 w-4" aria-hidden="true" />}
                {generating ? 'Building your roadmap…' : user ? 'Generate and save roadmap' : 'Generate free preview'}
              </button>
              {!user && (
                <p className="mt-2 text-center text-[11px] leading-5 text-ink-400">
                  No account needed for a preview. <Link to="/register" className="font-semibold text-brand-700">Register free</Link> to save it and track progress.
                </p>
              )}
            </form>

            {user && (
              <div className="rounded-2xl border border-paper-200 bg-white">
                <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Saved roadmaps</h2>
                  <button type="button" onClick={() => { setRoadmap(null); setSavedId(null); setNotice(''); }} className="text-ink-400 hover:text-ink-900" aria-label="Start a new roadmap">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {loadingList ? (
                  <div className="p-4 text-sm text-ink-500">Loading…</div>
                ) : savedRoadmaps.length === 0 ? (
                  <p className="p-4 text-xs leading-5 text-ink-500">No saved roadmaps yet. Generate one above.</p>
                ) : (
                  <ul className="max-h-[380px] overflow-y-auto p-2">
                    {savedRoadmaps.map((item) => (
                      <li key={item.id} className="group rounded-lg p-2.5 hover:bg-paper-50">
                        <div className="flex items-start gap-2">
                          <button type="button" onClick={() => openRoadmap(item)} className="min-w-0 flex-1 text-left">
                            <p className={`truncate text-sm ${savedId === item.id ? 'font-semibold text-brand-700' : 'text-ink-800'}`}>{item.title}</p>
                            <p className="mt-0.5 text-[11px] text-ink-400">{item.progress}% complete · {formatDate(item.updatedAt)}</p>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-200">
                              <div className="h-full rounded-full bg-brand-600" style={{ width: `${item.progress}%` }} />
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => item.id && void deleteRoadmap(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded p-1 text-ink-300 opacity-0 hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
                            aria-label={`Delete roadmap ${item.title}`}
                          >
                            {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="rounded-xl border border-paper-200 bg-paper-50 p-4 text-xs leading-5 text-ink-500">
              <p className="font-semibold text-ink-700">Planning assumptions</p>
              <p className="mt-1">Timelines are estimates. Registrations, licensing and location decisions can change the sequence. Verify official requirements before committing money.</p>
            </div>
          </div>

          <section aria-live="polite">
            {error && <ErrorBlock message={error} className="mb-5" />}
            {notice && <SuccessNote className="mb-5">{notice}</SuccessNote>}
            {generating && !roadmap && <div className="rounded-2xl border border-paper-200 bg-white"><LoadingBlock label="Building a six-stage plan…" /></div>}

            {!generating && !roadmap && (
              <div className="flex min-h-[560px] flex-col items-center justify-center rounded-2xl border border-dashed border-paper-300 bg-white/60 px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Map className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-3xl text-ink-950">Research → launch → grow</h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-ink-500">
                  Your roadmap will cover research, preparation, setup, launch, marketing and growth, with concrete tasks and a budget allocation.
                </p>
                <div className="mt-6 grid w-full max-w-md gap-2 text-left text-xs text-ink-500">
                  {['Specific tasks, not vague advice', 'Priorities and estimated timelines', 'A budget split with a reserve', 'Progress tracking when saved'].map((item) => (
                    <p key={item} className="flex items-center gap-2 rounded-lg border border-paper-200 bg-white px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-moss-600" aria-hidden="true" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {roadmap && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-paper-300 bg-white p-5 shadow-soft sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">Rule-based planner</Badge>
                        {savedId ? <Badge tone="green">Saved</Badge> : <Badge tone="amber">Preview · not saved</Badge>}
                      </div>
                      <h2 className="font-display text-3xl leading-tight text-ink-950 sm:text-4xl">{roadmap.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{roadmap.summary}</p>
                    </div>
                    <div className="w-full shrink-0 sm:w-auto">
                      <div className="rounded-xl border border-paper-200 bg-paper-50 p-4 text-center">
                        <p className="font-display text-4xl text-ink-950">{roadmap.progress}%</p>
                        <p className="text-[10px] uppercase tracking-wider text-ink-500">{doneTaskCount} of {overallTaskCount} tasks</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-200">
                    <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${roadmap.progress}%` }} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-paper-200 pt-4 text-xs text-ink-500">
                    <span>{inr(roadmap.budget)} budget</span>
                    <span>{roadmap.location}</span>
                    <span>{roadmap.timeAvailable}</span>
                    {savingTasks && <span className="inline-flex items-center gap-1 text-brand-700"><Loader2 className="h-3 w-3 animate-spin" /> Saving progress…</span>}
                  </div>

                  {!savedId && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-ink-700">
                      This preview is not saved. <Link to="/register" className="font-semibold underline underline-offset-2">Create an account</Link> or <Link to="/login" className="font-semibold underline underline-offset-2">log in</Link>, then generate it again to track progress.
                    </div>
                  )}
                </div>

                {roadmap.budgetPlan && roadmap.budgetPlan.length > 0 && (
                  <div className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
                    <h3 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                      <Wallet className="h-5 w-5 text-brand-600" aria-hidden="true" /> Suggested budget split
                    </h3>
                    <p className="mt-1 text-xs text-ink-500">A planning suggestion, not financial advice. Keep the reserve untouched if possible.</p>
                    <div className="mt-4 space-y-3">
                      {roadmap.budgetPlan.map((line) => {
                        const percent = roadmap.budget > 0 ? Math.round((line.amount / roadmap.budget) * 100) : 0;
                        return (
                          <div key={line.label}>
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                              <span className="font-medium text-ink-800">{line.label}</span>
                              <span className="font-semibold text-ink-900">{inr(line.amount)} <span className="font-normal text-ink-400">({percent}%)</span></span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-200">
                              <div className="h-full rounded-full bg-ink-700" style={{ width: `${percent}%` }} />
                            </div>
                            <p className="mt-1 text-[11px] text-ink-500">{line.note}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {roadmap.stages.map((stage, stageIndex) => {
                    const done = stage.tasks.filter((task) => task.done).length;
                    return (
                      <details key={stage.key} open={stageIndex < 2} className="group rounded-2xl border border-paper-200 bg-white">
                        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-paper-300 bg-paper-50 text-xs font-bold text-ink-700">
                            {String(stageIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-2xl text-ink-950">{stage.title}</h3>
                              <span className="text-[11px] font-medium text-ink-400">{stage.timeline}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-ink-500">{stage.summary}</p>
                          </div>
                          <span className="hidden shrink-0 text-[11px] font-medium text-ink-500 sm:block">{done}/{stage.tasks.length}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="border-t border-paper-200 px-5 pb-5">
                          <ul className="divide-y divide-paper-100">
                            {stage.tasks.map((task) => (
                              <li key={task.id} className="flex items-start gap-3 py-3">
                                <input
                                  id={`task-${task.id}`}
                                  type="checkbox"
                                  checked={task.done}
                                  disabled={savingTasks}
                                  onChange={() => void toggleTask(stage.key, task.id)}
                                  className="mt-1 h-4 w-4 shrink-0 rounded border-paper-400 text-brand-700 accent-brand-700"
                                />
                                <label htmlFor={`task-${task.id}`} className={`flex flex-1 cursor-pointer flex-col gap-1 text-sm leading-6 sm:flex-row sm:items-start sm:gap-3 ${task.done ? 'text-ink-400 line-through' : 'text-ink-700'}`}>
                                  <span className="flex-1">{task.title}</span>
                                  <span className={`inline-flex w-fit shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${task.priority === 'HIGH' ? 'border-brand-200 bg-brand-50 text-brand-800' : task.priority === 'LOW' ? 'border-paper-300 bg-paper-100 text-ink-500' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                                    {task.priority === 'HIGH' ? 'Priority' : task.priority === 'LOW' ? 'Later' : 'Important'}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-ink-700">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <span>{roadmap.disclaimer || 'This roadmap is a planning aid, not a guarantee. Timelines and costs are estimates; verify legal and licensing requirements on official portals.'}</span>
                  </p>
                </div>

                {roadmap.reference && (
                  <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Related guide</p>
                    <Link to={`/ideas/${roadmap.reference.slug}`} className="mt-2 flex items-center justify-between gap-4 group">
                      <div>
                        <p className="font-display text-2xl text-ink-950 group-hover:text-brand-700">{roadmap.reference.title}</p>
                        <p className="mt-0.5 text-xs text-ink-500">Planning range {inrCompact(roadmap.reference.startingCostMin)}–{inrCompact(roadmap.reference.startingCostMax)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
                    </Link>
                  </div>
                )}

                {savedId && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => { setRoadmap(null); setSavedId(null); }} className="btn-secondary btn-sm">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Plan another business
                    </button>
                    <span className="text-[11px] text-ink-400">Progress saves automatically when you tick a task.</span>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
