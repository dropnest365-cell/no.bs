import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-3 font-display text-5xl text-ink-950 sm:text-6xl">This page wandered off</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-ink-500">
        The link may be outdated, or the page may have moved. Start from the business idea library or
        head back home.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Go home <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/ideas" className="btn-secondary">Browse business ideas</Link>
      </div>
    </div>
  );
}
