import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { IdeaCard as IdeaCardType } from '../lib/types';
import { inrCompact, cn } from '../lib/format';
import { BookmarkButton } from './BookmarkButton';
import { DifficultyBadge, ModeBadge } from './ui';

interface Props {
  idea: IdeaCardType;
  onBookmarkChange?: (bookmarked: boolean) => void;
  compact?: boolean;
}

export function IdeaCard({ idea, onBookmarkChange, compact = false }: Props) {
  return (
    <article className={cn('group relative flex h-full flex-col rounded-2xl border border-paper-200 bg-white p-5 transition-all hover:border-ink-400 hover:shadow-lift sm:p-6', compact && 'p-4')}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={idea.mode} />
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{idea.category?.name}</span>
        </div>
        <BookmarkButton ideaId={idea.id} initial={idea.bookmarked} onChange={onBookmarkChange} compact />
      </div>

      <h3 className="font-display text-2xl leading-tight text-ink-950">
        <Link to={`/ideas/${idea.slug}`} className="transition-colors hover:text-brand-700">
          {idea.title}
        </Link>
      </h3>
      <p className={cn('mt-2 flex-1 text-sm leading-6 text-ink-600', compact && 'line-clamp-2')}>{idea.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-paper-200 pt-4 text-xs text-ink-500">
        <span className="font-semibold text-ink-800">
          {inrCompact(idea.startingCostMin)}–{inrCompact(idea.startingCostMax)}
          <span className="ml-1 font-normal text-ink-400">est. start</span>
        </span>
        <DifficultyBadge difficulty={idea.difficulty} />
        <span className="inline-flex items-center gap-1 text-ink-500">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {idea.timeCommitment.split(';')[0]}
        </span>
      </div>

      <Link
        to={`/ideas/${idea.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
      >
        Read the full guide
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}
