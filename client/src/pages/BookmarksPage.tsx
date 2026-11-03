import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { IdeaCard } from '../lib/types';
import { formatDate } from '../lib/format';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyState, InfoNote } from '../components/ui';
import { IdeaCard as IdeaCardComponent } from '../components/IdeaCard';

interface BookmarkRow {
  id: string;
  createdAt: string;
  idea: IdeaCard;
}

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ items: BookmarkRow[] }>('/api/bookmarks');
      setBookmarks(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your saved ideas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function remove(ideaId: string) {
    setBookmarks((current) => current.filter((row) => row.idea.id !== ideaId));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title={<>Saved ideas,<br /><span className="italic text-brand-700">ready to revisit.</span></>}
        description="A shortlist is useful only if you return to it. Re-read the risks and numbers before committing money."
        actions={<Link to="/ideas" className="btn-secondary">Find more ideas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      />

      <div className="container-page py-10 sm:py-12">
        {loading ? (
          <LoadingBlock label="Loading your saved ideas…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
            title="Nothing saved yet"
            description="Tap the bookmark icon on any business idea to keep it here. Saved ideas are private to your account."
            action={<Link to="/ideas" className="btn-primary btn-sm">Browse ideas</Link>}
          />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-500">
                <strong className="font-semibold text-ink-900">{bookmarks.length}</strong> saved idea{bookmarks.length === 1 ? '' : 's'}
              </p>
              <p className="text-[11px] text-ink-400">Most recently saved first</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((row) => (
                <div key={row.id} className="flex flex-col">
                  <IdeaCardComponent idea={row.idea} onBookmarkChange={() => remove(row.idea.id)} />
                  <p className="mt-1.5 px-1 text-[10px] text-ink-400">Saved {formatDate(row.createdAt)}</p>
                </div>
              ))}
            </div>
            <InfoNote className="mt-8">
              Your shortlist is not a recommendation and does not replace customer research. The cost ranges on each
              guide are planning estimates, not quotes.
            </InfoNote>
          </>
        )}
      </div>
    </div>
  );
}
