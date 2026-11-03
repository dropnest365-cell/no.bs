import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, BookOpen, Check, ChevronRight, Eye, EyeOff, FolderTree, Inbox, LayoutDashboard,
  Lightbulb, Loader2, Mail, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, X,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type {
  AdminCategory, AdminStats, ContactMessage, Draft, Guide, Idea, IdeaCard, ResourceLink, Roadmap,
} from '../lib/types';
import { formatDate, formatDateTime, inrCompact, slugify } from '../lib/format';
import { Markdown } from '../components/Markdown';
import { Badge, EmptyState, ErrorBlock, LoadingBlock, Stat, SuccessNote } from '../components/ui';

type Tab = 'overview' | 'ideas' | 'categories' | 'guides' | 'drafts' | 'messages';

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentIdea {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

type AdminIdeaRow = IdeaCard & { published: boolean };

interface IdeaFormState {
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  mode: 'ONLINE' | 'OFFLINE';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeCommitment: string;
  startingCostMin: string;
  startingCostMax: string;
  skills: string;
  equipment: string;
  recurringExpenses: string;
  revenueStreams: string;
  targetCustomers: string;
  competition: string;
  steps: string;
  marketing: string;
  risks: string;
  legal: string;
  resources: string;
  published: boolean;
  featured: boolean;
  lastVerifiedAt: string;
}

interface GuideFormState {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  body: string;
  sources: string;
  published: boolean;
  lastVerifiedAt: string;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  mode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  icon: string;
  sortOrder: string;
}

const TABS: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'ideas', label: 'Business ideas', icon: Lightbulb },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'drafts', label: 'Review queue', icon: Inbox },
  { id: 'messages', label: 'Messages', icon: Mail },
];

const CATEGORY_ICONS = [
  'Tag', 'Laptop', 'Mic', 'ShoppingCart', 'Package', 'GraduationCap', 'Megaphone', 'PenTool', 'Camera',
  'Briefcase', 'UtensilsCrossed', 'Wrench', 'Car', 'Store', 'PawPrint', 'Truck', 'Scissors', 'Sun', 'Sofa', 'HeartPulse',
];

function lines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function parseResources(value: string): Array<ResourceLink> {
  return lines(value).map((line) => {
    const [label, url, note] = line.split('|').map((part) => part.trim());
    return { label: label || url || 'Source', url: url || '', note: note || undefined };
  }).filter((item) => item.url);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function blankIdea(categoryId: string): IdeaFormState {
  return {
    title: '',
    slug: '',
    summary: '',
    description: '',
    categoryId,
    mode: 'ONLINE',
    difficulty: 'BEGINNER',
    timeCommitment: '10–15 hours per week',
    startingCostMin: '0',
    startingCostMax: '50000',
    skills: '',
    equipment: '',
    recurringExpenses: '',
    revenueStreams: '',
    targetCustomers: '',
    competition: '',
    steps: '',
    marketing: '',
    risks: '',
    legal: '',
    resources: '',
    published: true,
    featured: false,
    lastVerifiedAt: today(),
  };
}

function ideaToForm(idea: Idea): IdeaFormState {
  const resources = (idea.resources || [])
    .map((resource) => [resource.label, resource.url, resource.note].filter(Boolean).join(' | '))
    .join('\n');
  return {
    title: idea.title,
    slug: idea.slug,
    summary: idea.summary,
    description: idea.description,
    categoryId: '',
    mode: idea.mode,
    difficulty: idea.difficulty,
    timeCommitment: idea.timeCommitment,
    startingCostMin: String(idea.startingCostMin),
    startingCostMax: String(idea.startingCostMax),
    skills: (idea.skills || []).join('\n'),
    equipment: (idea.equipment || []).join('\n'),
    recurringExpenses: (idea.recurringExpenses || []).join('\n'),
    revenueStreams: (idea.revenueStreams || []).join('\n'),
    targetCustomers: idea.targetCustomers,
    competition: idea.competition,
    steps: (idea.steps || []).join('\n'),
    marketing: (idea.marketing || []).join('\n'),
    risks: (idea.risks || []).join('\n'),
    legal: (idea.legal || []).join('\n'),
    resources,
    published: Boolean(idea.published),
    featured: idea.featured,
    lastVerifiedAt: idea.lastVerifiedAt ? String(idea.lastVerifiedAt).slice(0, 10) : today(),
  };
}

function blankGuide(): GuideFormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    category: 'Strategy',
    body: '',
    sources: '',
    published: false,
    lastVerifiedAt: today(),
  };
}

function guideToForm(guide: Guide): GuideFormState {
  return {
    title: guide.title,
    slug: guide.slug,
    excerpt: guide.excerpt,
    category: guide.category,
    body: guide.body || '',
    sources: (guide.sources || []).map((source) => [source.label, source.url, source.note].filter(Boolean).join(' | ')).join('\n'),
    published: guide.published,
    lastVerifiedAt: guide.lastVerifiedAt ? String(guide.lastVerifiedAt).slice(0, 10) : today(),
  };
}

function blankCategory(): CategoryFormState {
  return { name: '', slug: '', description: '', mode: 'ONLINE', icon: 'Tag', sortOrder: '0' };
}

function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`my-auto w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} rounded-2xl border border-paper-300 bg-white shadow-lift`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-paper-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl text-ink-950">{title}</h2>
            {description && <p className="mt-0.5 text-xs leading-5 text-ink-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab') as Tab | null;
  const tab: Tab = TABS.some((item) => item.id === rawTab) ? (rawTab as Tab) : 'overview';

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<RecentIdea[]>([]);
  const [ideas, setIdeas] = useState<AdminIdeaRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [ideaSearch, setIdeaSearch] = useState('');
  const [guideSearch, setGuideSearch] = useState('');
  const [draftFilter, setDraftFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const [ideaEditor, setIdeaEditor] = useState<{ id?: string } | null>(null);
  const [ideaForm, setIdeaForm] = useState<IdeaFormState>(blankIdea(''));
  const [savingIdea, setSavingIdea] = useState(false);
  const [ideaFormError, setIdeaFormError] = useState('');
  const [openingIdea, setOpeningIdea] = useState<string | null>(null);

  const [guideEditor, setGuideEditor] = useState<{ id?: string } | null>(null);
  const [guideForm, setGuideForm] = useState<GuideFormState>(blankGuide());
  const [savingGuide, setSavingGuide] = useState(false);
  const [guideFormError, setGuideFormError] = useState('');

  const [categoryEditor, setCategoryEditor] = useState<{ id?: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(blankCategory());
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');

  function setTab(value: Tab) {
    const next = new URLSearchParams(params);
    if (value === 'overview') next.delete('tab');
    else next.set('tab', value);
    setParams(next);
  }

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, ideasResponse, categoriesResponse, guidesResponse, draftsResponse, contactsResponse] = await Promise.all([
        api<{ stats: AdminStats; recentUsers: RecentUser[]; recentIdeas: RecentIdea[] }>('/api/admin/stats'),
        api<{ items: AdminIdeaRow[] }>('/api/admin/ideas'),
        api<{ items: AdminCategory[] }>('/api/admin/categories'),
        api<{ items: Guide[] }>('/api/admin/guides'),
        api<{ items: Draft[] }>('/api/admin/drafts'),
        api<{ items: ContactMessage[] }>('/api/admin/contacts'),
      ]);
      setStats(statsResponse.stats);
      setRecentUsers(statsResponse.recentUsers);
      setRecentIdeas(statsResponse.recentIdeas);
      setIdeas(ideasResponse.items);
      setCategories(categoriesResponse.items);
      setGuides(guidesResponse.items);
      setDrafts(draftsResponse.items);
      setContacts(contactsResponse.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshStats() {
    try {
      const response = await api<{ stats: AdminStats; recentUsers: RecentUser[]; recentIdeas: RecentIdea[] }>('/api/admin/stats');
      setStats(response.stats);
      setRecentUsers(response.recentUsers);
      setRecentIdeas(response.recentIdeas);
    } catch {
      // Non-critical refresh; keep current numbers.
    }
  }

  async function refreshDrafts() {
    try {
      const response = await api<{ items: Draft[] }>('/api/admin/drafts');
      setDrafts(response.items);
    } catch {
      // Keep the current list.
    }
  }

  function report(error: unknown, fallback: string) {
    setActionError(error instanceof ApiError ? error.message : fallback);
    setNotice('');
  }

  async function toggleIdea(idea: AdminIdeaRow) {
    setBusyId(idea.id);
    setActionError('');
    try {
      await api(`/api/admin/ideas/${idea.id}/publish`, { method: 'PATCH', body: { published: !idea.published } });
      setIdeas((current) => current.map((row) => row.id === idea.id ? { ...row, published: !row.published } : row));
      setNotice(`“${idea.title}” is now ${idea.published ? 'unpublished' : 'published'}.`);
      void refreshStats();
    } catch (err) {
      report(err, 'Could not change the publish state.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteIdea(idea: AdminIdeaRow) {
    if (!window.confirm(`Delete “${idea.title}”? This removes the guide permanently.`)) return;
    setBusyId(idea.id);
    setActionError('');
    try {
      await api(`/api/admin/ideas/${idea.id}`, { method: 'DELETE' });
      setIdeas((current) => current.filter((row) => row.id !== idea.id));
      setNotice('Business idea deleted.');
      void refreshStats();
    } catch (err) {
      report(err, 'Could not delete the business idea.');
    } finally {
      setBusyId(null);
    }
  }

  async function openIdeaEditor(id: string) {
    setOpeningIdea(id);
    setActionError('');
    try {
      const response = await api<{ idea: Idea }>(`/api/admin/ideas/${id}`);
      const form = ideaToForm(response.idea);
      form.categoryId = categories.find((category) => category.slug === response.idea.category?.slug)?.id || categories[0]?.id || '';
      setIdeaForm(form);
      setIdeaFormError('');
      setIdeaEditor({ id });
    } catch (err) {
      report(err, 'Could not load the business idea.');
    } finally {
      setOpeningIdea(null);
    }
  }

  function openNewIdea() {
    if (categories.length === 0) {
      setActionError('Create a category before adding a business idea.');
      return;
    }
    setIdeaForm(blankIdea(categories[0].id));
    setIdeaFormError('');
    setIdeaEditor({});
  }

  function updateIdeaField<K extends keyof IdeaFormState>(key: K, value: IdeaFormState[K]) {
    setIdeaForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !ideaEditor?.id) next.slug = slugify(String(value));
      return next;
    });
  }

  async function saveIdea(event: FormEvent) {
    event.preventDefault();
    setSavingIdea(true);
    setIdeaFormError('');
    try {
      const payload = {
        title: ideaForm.title,
        slug: ideaForm.slug,
        summary: ideaForm.summary,
        description: ideaForm.description,
        categoryId: ideaForm.categoryId,
        mode: ideaForm.mode,
        difficulty: ideaForm.difficulty,
        timeCommitment: ideaForm.timeCommitment,
        startingCostMin: Number(ideaForm.startingCostMin) || 0,
        startingCostMax: Number(ideaForm.startingCostMax) || 0,
        skills: lines(ideaForm.skills),
        equipment: lines(ideaForm.equipment),
        recurringExpenses: lines(ideaForm.recurringExpenses),
        revenueStreams: lines(ideaForm.revenueStreams),
        targetCustomers: ideaForm.targetCustomers,
        competition: ideaForm.competition,
        steps: lines(ideaForm.steps),
        marketing: lines(ideaForm.marketing),
        risks: lines(ideaForm.risks),
        legal: lines(ideaForm.legal),
        resources: parseResources(ideaForm.resources),
        published: ideaForm.published,
        featured: ideaForm.featured,
        lastVerifiedAt: ideaForm.lastVerifiedAt || undefined,
      };
      if (ideaEditor?.id) {
        await api(`/api/admin/ideas/${ideaEditor.id}`, { method: 'PATCH', body: payload });
        setNotice('Business idea updated.');
      } else {
        await api('/api/admin/ideas', { method: 'POST', body: payload });
        setNotice('Business idea created.');
      }
      setIdeaEditor(null);
      const response = await api<{ items: AdminIdeaRow[] }>('/api/admin/ideas');
      setIdeas(response.items);
      void refreshStats();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details?.map((detail) => `${detail.path}: ${detail.message}`).join(' · ');
        setIdeaFormError(details ? `${err.message} — ${details}` : err.message);
      } else {
        setIdeaFormError('Could not save the business idea.');
      }
    } finally {
      setSavingIdea(false);
    }
  }

  async function toggleGuide(guide: Guide) {
    setBusyId(guide.id);
    setActionError('');
    try {
      await api(`/api/admin/guides/${guide.id}/publish`, { method: 'PATCH', body: { published: !guide.published } });
      setGuides((current) => current.map((row) => row.id === guide.id ? { ...row, published: !row.published } : row));
      setNotice(`Guide ${guide.published ? 'unpublished' : 'published'}.`);
      void refreshStats();
    } catch (err) {
      report(err, 'Could not change the publish state.');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteGuide(guide: Guide) {
    if (!window.confirm(`Delete “${guide.title}”? This cannot be undone.`)) return;
    setBusyId(guide.id);
    setActionError('');
    try {
      await api(`/api/admin/guides/${guide.id}`, { method: 'DELETE' });
      setGuides((current) => current.filter((row) => row.id !== guide.id));
      setNotice('Guide deleted.');
      void refreshStats();
    } catch (err) {
      report(err, 'Could not delete the guide.');
    } finally {
      setBusyId(null);
    }
  }

  function openNewGuide() {
    setGuideForm(blankGuide());
    setGuideFormError('');
    setGuideEditor({});
  }

  function openEditGuide(guide: Guide) {
    setGuideForm(guideToForm(guide));
    setGuideFormError('');
    setGuideEditor({ id: guide.id });
  }

  function updateGuideField<K extends keyof GuideFormState>(key: K, value: GuideFormState[K]) {
    setGuideForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !guideEditor?.id) next.slug = slugify(String(value));
      return next;
    });
  }

  async function saveGuide(event: FormEvent) {
    event.preventDefault();
    setSavingGuide(true);
    setGuideFormError('');
    try {
      const payload = {
        title: guideForm.title,
        slug: guideForm.slug,
        excerpt: guideForm.excerpt,
        category: guideForm.category,
        body: guideForm.body,
        sources: parseResources(guideForm.sources),
        published: guideForm.published,
        lastVerifiedAt: guideForm.lastVerifiedAt || undefined,
      };
      if (guideEditor?.id) {
        await api(`/api/admin/guides/${guideEditor.id}`, { method: 'PATCH', body: payload });
        setNotice('Guide updated.');
      } else {
        await api('/api/admin/guides', { method: 'POST', body: payload });
        setNotice('Guide created.');
      }
      setGuideEditor(null);
      const response = await api<{ items: Guide[] }>('/api/admin/guides');
      setGuides(response.items);
      void refreshStats();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details?.map((detail) => `${detail.path}: ${detail.message}`).join(' · ');
        setGuideFormError(details ? `${err.message} — ${details}` : err.message);
      } else {
        setGuideFormError('Could not save the guide.');
      }
    } finally {
      setSavingGuide(false);
    }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    setSavingCategory(true);
    setCategoryFormError('');
    try {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        mode: categoryForm.mode,
        icon: categoryForm.icon,
        sortOrder: Number(categoryForm.sortOrder) || 0,
      };
      if (categoryEditor?.id) {
        await api(`/api/admin/categories/${categoryEditor.id}`, { method: 'PATCH', body: payload });
        setNotice('Category updated.');
      } else {
        await api('/api/admin/categories', { method: 'POST', body: payload });
        setNotice('Category created.');
      }
      setCategoryEditor(null);
      const response = await api<{ items: AdminCategory[] }>('/api/admin/categories');
      setCategories(response.items);
      void refreshStats();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details?.map((detail) => `${detail.path}: ${detail.message}`).join(' · ');
        setCategoryFormError(details ? `${err.message} — ${details}` : err.message);
      } else {
        setCategoryFormError('Could not save the category.');
      }
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteCategory(category: AdminCategory) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    setBusyId(category.id);
    setActionError('');
    try {
      await api(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
      setCategories((current) => current.filter((row) => row.id !== category.id));
      setNotice('Category deleted.');
      void refreshStats();
    } catch (err) {
      report(err, 'Could not delete the category. Move its ideas first.');
    } finally {
      setBusyId(null);
    }
  }

  async function reviewDraft(draft: Draft, action: 'APPROVE' | 'REJECT') {
    if (action === 'APPROVE' && !window.confirm('Approve this draft and publish it as a labelled community guide?')) return;
    setBusyId(draft.id);
    setActionError('');
    try {
      await api(`/api/admin/drafts/${draft.id}/review`, {
        method: 'PATCH',
        body: { action, reviewerNote: reviewNotes[draft.id] || '' },
      });
      setNotice(action === 'APPROVE' ? 'Draft approved and published as a community answer.' : 'Draft rejected.');
      await refreshDrafts();
      const guideResponse = await api<{ items: Guide[] }>('/api/admin/guides');
      setGuides(guideResponse.items);
      void refreshStats();
    } catch (err) {
      report(err, 'Could not review the draft.');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleContact(contact: ContactMessage) {
    setBusyId(contact.id);
    setActionError('');
    try {
      await api(`/api/admin/contacts/${contact.id}`, { method: 'PATCH', body: { handled: !contact.handled } });
      setContacts((current) => current.map((row) => row.id === contact.id ? { ...row, handled: !row.handled } : row));
      void refreshStats();
    } catch (err) {
      report(err, 'Could not update the message.');
    } finally {
      setBusyId(null);
    }
  }

  const filteredIdeas = useMemo(() => {
    const query = ideaSearch.trim().toLowerCase();
    if (!query) return ideas;
    return ideas.filter((idea) => idea.title.toLowerCase().includes(query) || idea.slug.toLowerCase().includes(query));
  }, [ideas, ideaSearch]);

  const filteredGuides = useMemo(() => {
    const query = guideSearch.trim().toLowerCase();
    if (!query) return guides;
    return guides.filter((guide) => guide.title.toLowerCase().includes(query) || guide.category.toLowerCase().includes(query));
  }, [guides, guideSearch]);

  const filteredDrafts = useMemo(
    () => (draftFilter === 'ALL' ? drafts : drafts.filter((draft) => draft.status === draftFilter)),
    [drafts, draftFilter],
  );

  if (loading) {
    return <div className="container-page py-20"><LoadingBlock label="Loading the admin workbench…" /></div>;
  }

  if (error || !stats) {
    return (
      <div className="container-page py-20">
        <ErrorBlock message={error || 'Admin data unavailable'} onRetry={loadAll} />
      </div>
    );
  }

  return (
    <div>
      <header className="border-b border-ink-800 bg-ink-950 text-paper-100">
        <div className="container-page py-8 sm:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Admin workbench
              </p>
              <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Keep the library honest.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-paper-200/70">
                Publish with sources, review AI drafts before anything goes public, and keep estimates labelled.
                Permissions are enforced by the API, not just by hiding buttons.
              </p>
            </div>
            <button type="button" onClick={() => void loadAll()} className="btn border-paper-300/30 bg-transparent text-paper-100 hover:bg-white/10">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh data
            </button>
          </div>
        </div>
      </header>

      <div className="container-page py-8 sm:py-10">
        {notice && <SuccessNote className="mb-4">{notice}</SuccessNote>}
        {actionError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{actionError}</span>
            <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-xl border border-paper-200 bg-white p-1.5">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
                {item.id === 'drafts' && stats.pendingDrafts > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {stats.pendingDrafts}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Users" value={stats.users} />
              <Stat label="Ideas" value={stats.ideas} hint={`${stats.publishedIdeas} published`} />
              <Stat label="Guides" value={stats.guides} />
              <Stat label="Pending reviews" value={stats.pendingDrafts} hint="Needs a decision" />
              <Stat label="Unread messages" value={stats.unreadContacts} hint="Stored locally" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-paper-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-3">
                  <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                    <Users className="h-5 w-5 text-brand-600" aria-hidden="true" /> Newest users
                  </h2>
                  <span className="text-[11px] text-ink-400">Latest 5</span>
                </div>
                {recentUsers.length === 0 ? (
                  <p className="py-6 text-sm text-ink-500">No users yet.</p>
                ) : (
                  <ul className="divide-y divide-paper-100">
                    {recentUsers.map((user) => (
                      <li key={user.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
                          <p className="truncate text-[11px] text-ink-500">{user.email}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge tone={user.role === 'ADMIN' ? 'dark' : 'neutral'}>{user.role === 'ADMIN' ? 'Admin' : 'User'}</Badge>
                          <p className="mt-1 text-[10px] text-ink-400">{formatDate(user.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-paper-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 border-b border-paper-200 pb-3">
                  <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
                    <BookOpen className="h-5 w-5 text-brand-600" aria-hidden="true" /> Recently updated ideas
                  </h2>
                  <button type="button" onClick={() => setTab('ideas')} className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700">
                    Manage <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                {recentIdeas.length === 0 ? (
                  <p className="py-6 text-sm text-ink-500">No business ideas yet.</p>
                ) : (
                  <ul className="divide-y divide-paper-100">
                    {recentIdeas.map((idea) => (
                      <li key={idea.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-900">{idea.title}</p>
                          <p className="truncate text-[11px] text-ink-500">/{idea.slug}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge tone={idea.published ? 'green' : 'neutral'}>{idea.published ? 'Published' : 'Draft'}</Badge>
                          <p className="mt-1 text-[10px] text-ink-400">{formatDate(idea.updatedAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-paper-200 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Other content</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  {stats.tools} tools · {stats.roadmaps} roadmaps · {stats.bookmarks} bookmarks · {stats.conversations} conversations
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden="true" /> Review queue
                </p>
                <p className="mt-1.5 text-xs leading-6 text-ink-600">
                  AI and user drafts stay private until an admin approves them. Approval creates a page labelled
                  “Community answer”, not a verified guide.
                </p>
                <button type="button" onClick={() => setTab('drafts')} className="btn-secondary btn-sm mt-3">Open queue</button>
              </div>
              <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <ShieldCheck className="h-4 w-4 text-moss-600" aria-hidden="true" /> Admin safety
                </p>
                <p className="mt-1.5 text-xs leading-6 text-ink-600">
                  Every admin route requires an authenticated ADMIN role server-side. Do not share admin credentials;
                  use <code className="rounded bg-paper-200 px-1">npm run make-admin</code> to promote a real account.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'ideas' && (
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-3xl text-ink-950">Business ideas</h2>
                <p className="mt-1 text-sm text-ink-500">{ideas.length} total · {ideas.filter((idea) => idea.published).length} published</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <input value={ideaSearch} onChange={(event) => setIdeaSearch(event.target.value)} className="input h-[38px] w-full pl-9 text-xs sm:w-64" placeholder="Search title or slug…" aria-label="Search business ideas" />
                </div>
                <button type="button" onClick={openNewIdea} className="btn-primary btn-sm">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New idea
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Idea</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-ink-500">No ideas match that search.</td></tr>
                  ) : filteredIdeas.map((idea) => (
                    <tr key={idea.id}>
                      <td>
                        <p className="font-medium text-ink-900">{idea.title}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">/{idea.slug} · {inrCompact(idea.startingCostMin)}–{inrCompact(idea.startingCostMax)}</p>
                      </td>
                      <td>
                        <p className="text-xs text-ink-600">{idea.category?.name || '—'}</p>
                        <p className="text-[10px] text-ink-400">{idea.mode === 'ONLINE' ? 'Online' : 'Offline'}</p>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={idea.published ? 'green' : 'neutral'}>{idea.published ? 'Published' : 'Draft'}</Badge>
                          {idea.featured && <Badge tone="brand">Featured</Badge>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-xs text-ink-500">{formatDate(idea.updatedAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void toggleIdea(idea)}
                            disabled={busyId === idea.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900"
                            title={idea.published ? 'Unpublish' : 'Publish'}
                            aria-label={idea.published ? `Unpublish ${idea.title}` : `Publish ${idea.title}`}
                          >
                            {busyId === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : idea.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => void openIdeaEditor(idea.id)}
                            disabled={openingIdea === idea.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900"
                            title="Edit"
                            aria-label={`Edit ${idea.title}`}
                          >
                            {openingIdea === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteIdea(idea)}
                            disabled={busyId === idea.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-700"
                            title="Delete"
                            aria-label={`Delete ${idea.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'categories' && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-ink-950">Categories</h2>
                <p className="mt-1 text-sm text-ink-500">Categories with ideas attached cannot be deleted.</p>
              </div>
              <button
                type="button"
                onClick={() => { setCategoryForm(blankCategory()); setCategoryFormError(''); setCategoryEditor({}); }}
                className="btn-primary btn-sm"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New category
              </button>
            </div>
            <div className="table-wrap">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Mode</th>
                    <th>Ideas</th>
                    <th>Order</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <p className="font-medium text-ink-900">{category.name}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">/{category.slug} · icon: {category.icon || 'Tag'}</p>
                      </td>
                      <td><Badge tone={category.mode === 'BOTH' ? 'neutral' : category.mode === 'ONLINE' ? 'brand' : 'green'}>{category.mode}</Badge></td>
                      <td className="text-ink-600">{category.ideaCount ?? 0}</td>
                      <td className="text-ink-600">{category.sortOrder}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryForm({
                                name: category.name,
                                slug: category.slug,
                                description: category.description,
                                mode: category.mode as CategoryFormState['mode'],
                                icon: category.icon || 'Tag',
                                sortOrder: String(category.sortOrder),
                              });
                              setCategoryFormError('');
                              setCategoryEditor({ id: category.id });
                            }}
                            className="rounded p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteCategory(category)}
                            disabled={busyId === category.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'guides' && (
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-3xl text-ink-950">Editorial guides</h2>
                <p className="mt-1 text-sm text-ink-500">Official-source guides plus approved community answers.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                  <input value={guideSearch} onChange={(event) => setGuideSearch(event.target.value)} className="input h-[38px] w-full pl-9 text-xs sm:w-64" placeholder="Search guides…" aria-label="Search guides" />
                </div>
                <button type="button" onClick={openNewGuide} className="btn-primary btn-sm">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New guide
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Guide</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Reviewed</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuides.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-ink-500">No guides match that search.</td></tr>
                  ) : filteredGuides.map((guide) => (
                    <tr key={guide.id}>
                      <td>
                        <p className="font-medium text-ink-900">{guide.title}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">/{guide.slug} · {guide.sources.length} source{guide.sources.length === 1 ? '' : 's'}</p>
                      </td>
                      <td><p className="text-xs text-ink-600">{guide.category}</p></td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={guide.published ? 'green' : 'neutral'}>{guide.published ? 'Published' : 'Draft'}</Badge>
                          {guide.isCommunity && <Badge tone="amber">Community</Badge>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-xs text-ink-500">{formatDate(guide.lastVerifiedAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void toggleGuide(guide)}
                            disabled={busyId === guide.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900"
                            title={guide.published ? 'Unpublish' : 'Publish'}
                            aria-label={guide.published ? `Unpublish ${guide.title}` : `Publish ${guide.title}`}
                          >
                            {busyId === guide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : guide.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditGuide(guide)}
                            className="rounded p-1.5 text-ink-400 hover:bg-paper-100 hover:text-ink-900"
                            aria-label={`Edit ${guide.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteGuide(guide)}
                            disabled={busyId === guide.id}
                            className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete ${guide.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'drafts' && (
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-3xl text-ink-950">Review queue</h2>
                <p className="mt-1 text-sm text-ink-500">Approve only what you would stand behind. Approval publishes a labelled community answer.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraftFilter(value)}
                    className={draftFilter === value ? 'btn-dark btn-sm' : 'btn-secondary btn-sm'}
                  >
                    {value === 'ALL' ? 'All' : value.charAt(0) + value.slice(1).toLowerCase()}
                    <span className="text-[10px] opacity-70">
                      {value === 'ALL' ? drafts.length : drafts.filter((draft) => draft.status === value).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredDrafts.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5" aria-hidden="true" />}
                title={draftFilter === 'PENDING' ? 'The queue is clear' : 'Nothing here'}
                description={draftFilter === 'PENDING' ? 'No drafts are waiting for review. New mentor answers and analyses will appear here when users submit them.' : 'Try a different status filter.'}
              />
            ) : (
              <div className="space-y-4">
                {filteredDrafts.map((draft) => (
                  <article key={draft.id} className="rounded-2xl border border-paper-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={draft.status === 'PENDING' ? 'amber' : draft.status === 'APPROVED' ? 'green' : 'red'}>{draft.status.toLowerCase()}</Badge>
                          <Badge tone={draft.source === 'AI' ? 'brand' : 'neutral'}>{draft.source === 'AI' ? 'AI-generated' : 'Rule-based'}</Badge>
                          <span className="text-[10px] uppercase tracking-wider text-ink-400">{draft.type}</span>
                        </div>
                        <h3 className="mt-2 font-display text-2xl leading-tight text-ink-950">{draft.title}</h3>
                        <p className="mt-1 text-[11px] text-ink-500">
                          {draft.user ? `${draft.user.name} · ${draft.user.email}` : 'System draft'} · {formatDateTime(draft.createdAt)}
                        </p>
                      </div>
                    </div>

                    <details className="mt-4 rounded-xl border border-paper-200 bg-paper-50">
                      <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-ink-700">Read the full draft</summary>
                      <div className="max-h-[420px] overflow-y-auto border-t border-paper-200 bg-white px-4 py-2">
                        <Markdown content={draft.body} />
                      </div>
                    </details>

                    {draft.reviewerNote && (
                      <p className="mt-3 rounded-lg bg-paper-100 px-3 py-2 text-xs text-ink-600">
                        <strong>Reviewer note:</strong> {draft.reviewerNote}
                      </p>
                    )}

                    {draft.status === 'PENDING' && (
                      <div className="mt-4 flex flex-col gap-2 border-t border-paper-200 pt-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label htmlFor={`note-${draft.id}`} className="label">Reviewer note (optional)</label>
                          <input
                            id={`note-${draft.id}`}
                            value={reviewNotes[draft.id] || ''}
                            onChange={(event) => setReviewNotes((current) => ({ ...current, [draft.id]: event.target.value }))}
                            className="input h-[38px] text-xs"
                            placeholder="Why was it approved or rejected?"
                            maxLength={1000}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => void reviewDraft(draft, 'REJECT')} disabled={busyId === draft.id} className="btn-danger btn-sm">
                            Reject
                          </button>
                          <button type="button" onClick={() => void reviewDraft(draft, 'APPROVE')} disabled={busyId === draft.id} className="btn-primary btn-sm">
                            {busyId === draft.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Approve &amp; publish
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'messages' && (
          <section>
            <div className="mb-4">
              <h2 className="font-display text-3xl text-ink-950">Contact messages</h2>
              <p className="mt-1 text-sm text-ink-500">
                Messages are stored in the local database. This build does not send email notifications.
              </p>
            </div>
            {contacts.length === 0 ? (
              <EmptyState icon={<Mail className="h-5 w-5" aria-hidden="true" />} title="No messages yet" description="Messages sent through the contact form will appear here." />
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <article key={contact.id} className={`rounded-2xl border p-5 ${contact.handled ? 'border-paper-200 bg-paper-50' : 'border-paper-300 bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">{contact.name}</p>
                          <Badge tone={contact.handled ? 'green' : 'amber'}>{contact.handled ? 'Handled' : 'New'}</Badge>
                        </div>
                        <a href={`mailto:${contact.email}`} className="mt-0.5 block text-xs text-brand-700 hover:underline">{contact.email}</a>
                        <p className="mt-1 text-[11px] text-ink-400">{formatDateTime(contact.createdAt)}</p>
                      </div>
                      <button type="button" onClick={() => void toggleContact(contact)} disabled={busyId === contact.id} className="btn-secondary btn-sm">
                        {busyId === contact.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Mark {contact.handled ? 'unhandled' : 'handled'}
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{contact.message}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        open={Boolean(ideaEditor)}
        onClose={() => setIdeaEditor(null)}
        title={ideaEditor?.id ? 'Edit business idea' : 'New business idea'}
        description="Arrays use one item per line. Resources use Label | URL | Note."
        wide
      >
        <form onSubmit={saveIdea} className="space-y-4">
          {ideaFormError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">{ideaFormError}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-idea-title" className="label">Title</label>
              <input id="admin-idea-title" value={ideaForm.title} onChange={(event) => updateIdeaField('title', event.target.value)} className="input" required />
            </div>
            <div>
              <label htmlFor="admin-idea-slug" className="label">Slug</label>
              <input id="admin-idea-slug" value={ideaForm.slug} onChange={(event) => updateIdeaField('slug', event.target.value)} className="input" required placeholder="lowercase-with-hyphens" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-idea-summary" className="label">Summary</label>
            <textarea id="admin-idea-summary" value={ideaForm.summary} onChange={(event) => updateIdeaField('summary', event.target.value)} className="textarea min-h-[70px]" required />
          </div>
          <div>
            <label htmlFor="admin-idea-description" className="label">Description</label>
            <textarea id="admin-idea-description" value={ideaForm.description} onChange={(event) => updateIdeaField('description', event.target.value)} className="textarea min-h-[120px]" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="admin-idea-category" className="label">Category</label>
              <select id="admin-idea-category" value={ideaForm.categoryId} onChange={(event) => updateIdeaField('categoryId', event.target.value)} className="select" required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="admin-idea-mode" className="label">Mode</label>
              <select id="admin-idea-mode" value={ideaForm.mode} onChange={(event) => updateIdeaField('mode', event.target.value as IdeaFormState['mode'])} className="select">
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
            <div>
              <label htmlFor="admin-idea-difficulty" className="label">Difficulty</label>
              <select id="admin-idea-difficulty" value={ideaForm.difficulty} onChange={(event) => updateIdeaField('difficulty', event.target.value as IdeaFormState['difficulty'])} className="select">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="admin-idea-min" className="label">Starting cost min (₹)</label>
              <input id="admin-idea-min" type="number" min="0" value={ideaForm.startingCostMin} onChange={(event) => updateIdeaField('startingCostMin', event.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="admin-idea-max" className="label">Starting cost max (₹)</label>
              <input id="admin-idea-max" type="number" min="0" value={ideaForm.startingCostMax} onChange={(event) => updateIdeaField('startingCostMax', event.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="admin-idea-time" className="label">Time commitment</label>
              <input id="admin-idea-time" value={ideaForm.timeCommitment} onChange={(event) => updateIdeaField('timeCommitment', event.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-idea-customers" className="label">Target customers</label>
            <textarea id="admin-idea-customers" value={ideaForm.targetCustomers} onChange={(event) => updateIdeaField('targetCustomers', event.target.value)} className="textarea min-h-[70px]" required />
          </div>
          <div>
            <label htmlFor="admin-idea-competition" className="label">Competition</label>
            <textarea id="admin-idea-competition" value={ideaForm.competition} onChange={(event) => updateIdeaField('competition', event.target.value)} className="textarea min-h-[70px]" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['skills', 'Skills (one per line)'],
              ['equipment', 'Equipment (one per line)'],
              ['recurringExpenses', 'Recurring expenses (one per line)'],
              ['revenueStreams', 'Revenue streams (one per line)'],
              ['steps', 'Setup steps (one per line)'],
              ['marketing', 'Marketing ideas (one per line)'],
              ['risks', 'Risks (one per line)'],
              ['legal', 'Legal notes (one per line)'],
            ] as Array<[keyof IdeaFormState, string]>).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`admin-idea-${key}`} className="label">{label}</label>
                <textarea
                  id={`admin-idea-${key}`}
                  value={String(ideaForm[key])}
                  onChange={(event) => updateIdeaField(key, event.target.value as never)}
                  className="textarea min-h-[80px] font-mono text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="admin-idea-resources" className="label">Resources (Label | URL | Note)</label>
            <textarea
              id="admin-idea-resources"
              value={ideaForm.resources}
              onChange={(event) => updateIdeaField('resources', event.target.value)}
              className="textarea min-h-[90px] font-mono text-xs"
              placeholder="Udyam Registration | https://udyamregistration.gov.in/ | Official MSME portal"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-idea-reviewed" className="label">Last reviewed</label>
              <input id="admin-idea-reviewed" type="date" value={ideaForm.lastVerifiedAt} onChange={(event) => updateIdeaField('lastVerifiedAt', event.target.value)} className="input" />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-700">
                <input type="checkbox" checked={ideaForm.published} onChange={(event) => updateIdeaField('published', event.target.checked)} className="h-4 w-4 rounded accent-brand-700" />
                Published
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-ink-700">
                <input type="checkbox" checked={ideaForm.featured} onChange={(event) => updateIdeaField('featured', event.target.checked)} className="h-4 w-4 rounded accent-brand-700" />
                Featured
              </label>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" onClick={() => setIdeaEditor(null)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={savingIdea} className="btn-primary btn-sm">
              {savingIdea && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save idea
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(guideEditor)}
        onClose={() => setGuideEditor(null)}
        title={guideEditor?.id ? 'Edit guide' : 'New guide'}
        description="Sources use Label | URL | Note. Published guides appear in the public library."
        wide
      >
        <form onSubmit={saveGuide} className="space-y-4">
          {guideFormError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">{guideFormError}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-guide-title" className="label">Title</label>
              <input id="admin-guide-title" value={guideForm.title} onChange={(event) => updateGuideField('title', event.target.value)} className="input" required />
            </div>
            <div>
              <label htmlFor="admin-guide-slug" className="label">Slug</label>
              <input id="admin-guide-slug" value={guideForm.slug} onChange={(event) => updateGuideField('slug', event.target.value)} className="input" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="admin-guide-category" className="label">Category</label>
              <input id="admin-guide-category" value={guideForm.category} onChange={(event) => updateGuideField('category', event.target.value)} className="input" required />
            </div>
            <div>
              <label htmlFor="admin-guide-reviewed" className="label">Last reviewed</label>
              <input id="admin-guide-reviewed" type="date" value={guideForm.lastVerifiedAt} onChange={(event) => updateGuideField('lastVerifiedAt', event.target.value)} className="input" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-700">
                <input type="checkbox" checked={guideForm.published} onChange={(event) => updateGuideField('published', event.target.checked)} className="h-4 w-4 rounded accent-brand-700" />
                Published
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="admin-guide-excerpt" className="label">Excerpt</label>
            <textarea id="admin-guide-excerpt" value={guideForm.excerpt} onChange={(event) => updateGuideField('excerpt', event.target.value)} className="textarea min-h-[70px]" required />
          </div>
          <div>
            <label htmlFor="admin-guide-body" className="label">Body (Markdown)</label>
            <textarea id="admin-guide-body" value={guideForm.body} onChange={(event) => updateGuideField('body', event.target.value)} className="textarea min-h-[240px] font-mono text-xs" required />
          </div>
          <div>
            <label htmlFor="admin-guide-sources" className="label">Sources (Label | URL | Note)</label>
            <textarea id="admin-guide-sources" value={guideForm.sources} onChange={(event) => updateGuideField('sources', event.target.value)} className="textarea min-h-[100px] font-mono text-xs" />
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" onClick={() => setGuideEditor(null)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={savingGuide} className="btn-primary btn-sm">
              {savingGuide && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save guide
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(categoryEditor)}
        onClose={() => setCategoryEditor(null)}
        title={categoryEditor?.id ? 'Edit category' : 'New category'}
      >
        <form onSubmit={saveCategory} className="space-y-4">
          {categoryFormError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">{categoryFormError}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-cat-name" className="label">Name</label>
              <input
                id="admin-cat-name"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: categoryEditor?.id ? current.slug : slugify(event.target.value),
                }))}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-cat-slug" className="label">Slug</label>
              <input id="admin-cat-slug" value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} className="input" required />
            </div>
          </div>
          <div>
            <label htmlFor="admin-cat-description" className="label">Description</label>
            <textarea id="admin-cat-description" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} className="textarea min-h-[80px]" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="admin-cat-mode" className="label">Mode</label>
              <select id="admin-cat-mode" value={categoryForm.mode} onChange={(event) => setCategoryForm((current) => ({ ...current, mode: event.target.value as CategoryFormState['mode'] }))} className="select">
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div>
              <label htmlFor="admin-cat-icon" className="label">Icon</label>
              <select id="admin-cat-icon" value={categoryForm.icon} onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))} className="select">
                {CATEGORY_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="admin-cat-order" className="label">Sort order</label>
              <input id="admin-cat-order" type="number" min="0" max="999" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))} className="input" />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" onClick={() => setCategoryEditor(null)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={savingCategory} className="btn-primary btn-sm">
              {savingCategory && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
