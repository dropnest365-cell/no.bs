import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bookmark, Bot, CheckCircle2, FileText, Loader2, Map, MessageSquare, ShieldCheck,
  Sparkles, UserRound, Wallet,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ConversationSummary, IdeaCard, Roadmap, User } from '../lib/types';
import { formatDate, formatDateTime, inr, initial } from '../lib/format';
import { PageHeader, LoadingBlock, ErrorBlock, Badge, Stat, EmptyState, SuccessNote, FieldError } from '../components/ui';

interface DashboardData {
  user: User;
  counts: { bookmarks: number; roadmaps: number; conversations: number; drafts: number };
  bookmarks: Array<{ id: string; createdAt: string; idea: IdeaCard }>;
  roadmaps: Roadmap[];
  conversations: ConversationSummary[];
  drafts: Array<{ id: string; title: string; type: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string }>;
}

const STATUS_TONE = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
} as const;

export function DashboardPage() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api<DashboardData>('/api/dashboard');
      setData(response);
      setName(response.user.name);
      setBio(response.user.bio || '');
      setCity(response.user.city || '');
      setUser(response.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    if (name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters.');
      return;
    }
    setSavingProfile(true);
    try {
      const response = await api<{ user: User }>('/api/auth/me', {
        method: 'PATCH',
        body: { name: name.trim(), bio: bio.trim(), city: city.trim() },
      });
      setUser(response.user);
      setData((current) => (current ? { ...current, user: response.user } : current));
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Could not update your profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    setPasswordError('');
    setPasswordMessage('');
    if (!currentPassword) errors.currentPassword = 'Enter your current password.';
    if (newPassword.length < 10) errors.newPassword = 'Use at least 10 characters.';
    if (newPassword !== confirmPassword) errors.confirm = 'Passwords do not match.';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated. Your current session stays signed in.');
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Could not update your password.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="container-page py-20"><LoadingBlock label="Loading your dashboard…" /></div>;
  }

  if (error || !data) {
    return (
      <div className="container-page py-20">
        <ErrorBlock message={error || 'Dashboard unavailable'} onRetry={load} />
      </div>
    );
  }

  const activeUser = data.user;

  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title={<>Hello, {activeUser.name.split(' ')[0]}.<br /><span className="italic text-brand-700">What are you building?</span></>}
        description="Your saved ideas, roadmaps, mentor conversations and review submissions. Nothing here is public unless an admin explicitly publishes it."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/ideas" className="btn-secondary btn-sm">Browse ideas</Link>
            <Link to="/roadmap" className="btn-primary btn-sm">New roadmap <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
          </div>
        }
      />

      <div className="container-page py-10 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/bookmarks" className="block transition-transform hover:-translate-y-0.5">
            <Stat label="Saved ideas" value={data.counts.bookmarks} hint="Private shortlist" />
          </Link>
          <Link to="/roadmap" className="block transition-transform hover:-translate-y-0.5">
            <Stat label="Roadmaps" value={data.counts.roadmaps} hint="Saved plans" />
          </Link>
          <Link to="/mentor" className="block transition-transform hover:-translate-y-0.5">
            <Stat label="Mentor chats" value={data.counts.conversations} hint="Conversation history" />
          </Link>
          <div>
            <Stat label="Review drafts" value={data.counts.drafts} hint="Submitted, not necessarily published" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-4">
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                  <Map className="h-5 w-5 text-brand-600" aria-hidden="true" /> Your roadmaps
                </h2>
                <Link to="/roadmap" className="text-xs font-semibold text-brand-700 hover:text-brand-900">Open planner</Link>
              </div>
              {data.roadmaps.length === 0 ? (
                <p className="py-6 text-sm leading-6 text-ink-500">
                  No roadmaps saved yet. <Link to="/roadmap" className="font-semibold text-brand-700">Generate a six-stage plan</Link> from a business idea, budget and the time you actually have.
                </p>
              ) : (
                <ul className="divide-y divide-paper-100">
                  {data.roadmaps.map((roadmap) => (
                    <li key={roadmap.id} className="py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">{roadmap.title}</p>
                          <p className="mt-0.5 text-[11px] text-ink-500">
                            {inr(roadmap.budget)} budget · {roadmap.location} · updated {formatDate(roadmap.updatedAt)}
                          </p>
                        </div>
                        <Link to={`/roadmap?open=${roadmap.id}`} className="text-xs font-semibold text-brand-700 hover:text-brand-900">
                          Open
                        </Link>
                      </div>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-200">
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${roadmap.progress}%` }} />
                        </div>
                        <span className="w-10 text-right text-[11px] font-medium text-ink-500">{roadmap.progress}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-4">
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                  <Bookmark className="h-5 w-5 text-brand-600" aria-hidden="true" /> Saved ideas
                </h2>
                <Link to="/bookmarks" className="text-xs font-semibold text-brand-700 hover:text-brand-900">View all</Link>
              </div>
              {data.bookmarks.length === 0 ? (
                <p className="py-6 text-sm leading-6 text-ink-500">
                  No bookmarks yet. Save an idea from the library and it will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-paper-100">
                  {data.bookmarks.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-4 py-3.5">
                      <div className="min-w-0">
                        <Link to={`/ideas/${row.idea.slug}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                          {row.idea.title}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-ink-500">
                          {row.idea.category?.name} · {row.idea.mode === 'ONLINE' ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-400">{formatDate(row.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-4">
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                  <FileText className="h-5 w-5 text-brand-600" aria-hidden="true" /> Review submissions
                </h2>
              </div>
              {data.drafts.length === 0 ? (
                <p className="py-6 text-sm leading-6 text-ink-500">
                  Nothing submitted for review. Mentor answers and analyses can be submitted from their pages; an admin
                  must approve them before anything becomes public.
                </p>
              ) : (
                <ul className="divide-y divide-paper-100">
                  {data.drafts.map((draft) => (
                    <li key={draft.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{draft.title}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{draft.type} · {formatDate(draft.createdAt)}</p>
                      </div>
                      <Badge tone={STATUS_TONE[draft.status]}>{draft.status.toLowerCase()}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-4">
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                  <Bot className="h-5 w-5 text-brand-600" aria-hidden="true" /> Mentor chats
                </h2>
                <Link to="/mentor" className="text-xs font-semibold text-brand-700 hover:text-brand-900">Open</Link>
              </div>
              {data.conversations.length === 0 ? (
                <p className="py-6 text-sm leading-6 text-ink-500">
                  No conversations yet. <Link to="/mentor" className="font-semibold text-brand-700">Ask the mentor</Link> about customers, pricing or registration basics.
                </p>
              ) : (
                <ul className="divide-y divide-paper-100">
                  {data.conversations.map((conversation) => (
                    <li key={conversation.id} className="py-3.5">
                      <Link to={`/mentor?conversation=${conversation.id}`} className="group block">
                        <p className="truncate text-sm font-medium text-ink-900 group-hover:text-brand-700">{conversation.title}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">
                          {conversation.messageCount} messages · {formatDateTime(conversation.updatedAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                <UserRound className="h-5 w-5 text-brand-600" aria-hidden="true" /> Account
              </h2>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-paper-200 bg-paper-50 p-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white">
                  {initial(activeUser.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{activeUser.name}</p>
                  <p className="truncate text-[11px] text-ink-500">{activeUser.email}</p>
                </div>
                {activeUser.role === 'ADMIN' && (
                  <Badge tone="dark" className="ml-auto shrink-0"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
                )}
              </div>
              <p className="mt-2 text-[11px] text-ink-400">Member since {formatDate(activeUser.createdAt)}</p>

              <form onSubmit={saveProfile} className="mt-4 space-y-3">
                {profileMessage && <SuccessNote className="text-xs">{profileMessage}</SuccessNote>}
                {profileError && <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">{profileError}</p>}
                <div>
                  <label htmlFor="dash-name" className="label">Name</label>
                  <input id="dash-name" value={name} onChange={(event) => setName(event.target.value)} className="input" maxLength={80} />
                </div>
                <div>
                  <label htmlFor="dash-city" className="label">City</label>
                  <input id="dash-city" value={city} onChange={(event) => setCity(event.target.value)} className="input" placeholder="Optional" maxLength={100} />
                </div>
                <div>
                  <label htmlFor="dash-bio" className="label">Short bio</label>
                  <textarea id="dash-bio" value={bio} onChange={(event) => setBio(event.target.value)} className="textarea min-h-[74px]" placeholder="What are you working on?" maxLength={500} />
                </div>
                <button type="submit" disabled={savingProfile} className="btn-secondary btn-sm w-full">
                  {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />} Save profile
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 sm:p-6">
              <h2 className="font-display text-2xl text-ink-950">Change password</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">Use at least 10 characters. Your current session stays active.</p>
              <form onSubmit={changePassword} className="mt-4 space-y-3">
                {passwordMessage && <SuccessNote className="text-xs">{passwordMessage}</SuccessNote>}
                {passwordError && <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">{passwordError}</p>}
                <div>
                  <label htmlFor="dash-current" className="label">Current password</label>
                  <input id="dash-current" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="input" />
                  <FieldError>{passwordErrors.currentPassword}</FieldError>
                </div>
                <div>
                  <label htmlFor="dash-new" className="label">New password</label>
                  <input id="dash-new" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="input" />
                  <FieldError>{passwordErrors.newPassword}</FieldError>
                </div>
                <div>
                  <label htmlFor="dash-confirm" className="label">Confirm new password</label>
                  <input id="dash-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input" />
                  <FieldError>{passwordErrors.confirm}</FieldError>
                </div>
                <button type="submit" disabled={savingPassword} className="btn-secondary btn-sm w-full">
                  {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />} Update password
                </button>
              </form>
            </section>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-ink-700">
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" /> Keep your expectations honest
              </p>
              <p className="mt-1">
                NO BS does not guarantee income. Saved plans and analyses are thinking tools; customer evidence and
                official verification still matter more than any dashboard number.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Wallet, label: 'Check the setup cost', to: '/tools/startup-cost-calculator' },
            { icon: MessageSquare, label: 'Ask the mentor a question', to: '/mentor' },
            { icon: CheckCircle2, label: 'Read the validation guide', to: '/guides/validate-business-idea-before-spending' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl border border-paper-200 bg-white px-4 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-400">
              <item.icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {item.label}
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
