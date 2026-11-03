import { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/format';

interface BookmarkButtonProps {
  ideaId: string;
  initial?: boolean;
  onChange?: (bookmarked: boolean) => void;
  compact?: boolean;
  className?: string;
}

export function BookmarkButton({ ideaId, initial = false, onChange, compact = false, className }: BookmarkButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookmarked, setBookmarked] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setBookmarked(initial), [initial, ideaId]);

  async function toggle() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setPending(true);
    setError('');
    try {
      if (bookmarked) {
        await api(`/api/bookmarks/${ideaId}`, { method: 'DELETE' });
        setBookmarked(false);
        onChange?.(false);
      } else {
        await api(`/api/bookmarks/${ideaId}`, { method: 'POST', body: {} });
        setBookmarked(true);
        onChange?.(true);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update bookmark');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? 'Remove bookmark' : 'Save this business idea'}
        title={error || (bookmarked ? 'Saved' : 'Save idea')}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors',
          compact ? 'h-9 w-9' : 'min-h-[40px] px-3 py-2',
          bookmarked
            ? 'border-brand-300 bg-brand-50 text-brand-800'
            : 'border-paper-300 bg-white text-ink-600 hover:border-ink-400 hover:text-ink-900',
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} aria-hidden="true" />
        )}
        {!compact && <span>{bookmarked ? 'Saved' : 'Save'}</span>}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
