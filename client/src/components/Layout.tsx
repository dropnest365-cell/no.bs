import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, ChevronRight, LayoutDashboard, LogOut, Menu, ShieldCheck, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn, initial } from '../lib/format';

const NAV = [
  { to: '/ideas', label: 'Explore ideas' },
  { to: '/ideas/online', label: 'Online' },
  { to: '/ideas/offline', label: 'Offline' },
  { to: '/mentor', label: 'AI mentor' },
  { to: '/tools', label: 'Tools' },
  { to: '/guides', label: 'Guides' },
];

function Logo() {
  return (
    <Link to="/" className="group inline-flex items-baseline gap-0.5" aria-label="NO BS home">
      <span className="font-display text-[28px] font-normal leading-none tracking-tight text-ink-950">NO BS</span>
      <span className="mb-0.5 block h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
    </Link>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-50/95 backdrop-blur">
        <div className="container-page flex h-[68px] items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/ideas'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                      isActive && item.to !== '/ideas'
                        ? 'bg-paper-200 text-ink-900'
                        : isActive
                          ? 'text-ink-900'
                          : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-paper-200" />
            ) : user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn-ghost btn-sm">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="btn-secondary btn-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                    {initial(user.name)}
                  </span>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md p-2 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Start free
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md border border-paper-300 bg-white p-2 text-ink-700 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-paper-200 bg-paper-50 md:hidden">
            <nav className="container-page flex flex-col py-4" aria-label="Mobile navigation">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between border-b border-paper-200 py-3 text-sm font-medium',
                      isActive ? 'text-brand-700' : 'text-ink-700',
                    )
                  }
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn-secondary w-full">Dashboard</Link>
                    {user.role === 'ADMIN' && <Link to="/admin" className="btn-dark w-full">Admin dashboard</Link>}
                    <button type="button" onClick={handleLogout} className="btn-ghost w-full">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary w-full">Log in</Link>
                    <Link to="/register" className="btn-primary w-full">Create a free account</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-paper-200">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl text-paper-50">NO BS</span>
              <span className="mb-1 h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-paper-300/80">
              Make money. Build something real. Practical business guidance, honest estimates and free tools for India.
            </p>
            <p className="mt-4 max-w-xs text-xs leading-5 text-paper-300/60">
              NO BS does not guarantee income or business success. All cost and profit figures are estimates.
            </p>
          </div>

          <FooterColumn title="Explore">
            <FooterLink to="/ideas">All business ideas</FooterLink>
            <FooterLink to="/ideas/online">Online businesses</FooterLink>
            <FooterLink to="/ideas/offline">Offline businesses</FooterLink>
            <FooterLink to="/bookmarks">Saved ideas</FooterLink>
          </FooterColumn>

          <FooterColumn title="Use the tools">
            <FooterLink to="/mentor">AI business mentor</FooterLink>
            <FooterLink to="/analyzer">Idea analyzer</FooterLink>
            <FooterLink to="/roadmap">Roadmap generator</FooterLink>
            <FooterLink to="/tools/startup-cost-calculator">Startup cost calculator</FooterLink>
            <FooterLink to="/tools/profit-calculator">Profit calculator</FooterLink>
          </FooterColumn>

          <FooterColumn title="NO BS">
            <FooterLink to="/about">About &amp; method</FooterLink>
            <FooterLink to="/guides">Guides</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/privacy">Privacy</FooterLink>
            <FooterLink to="/terms">Terms</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-800 pt-6 text-xs text-paper-300/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NO BS. Built for India. Prices in INR.</p>
          <p className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Content reviewed with links to official sources.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-300/60">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-paper-200/80 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
