import { lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoadingBlock } from './components/ui';
import { HomePage } from './pages/HomePage';

// Route-level code splitting keeps the first load small. The Layout provides the
// Suspense boundary so the header and footer stay visible while a page loads.
const IdeasPage = lazy(() => import('./pages/IdeasPage').then((m) => ({ default: m.IdeasPage })));
const IdeaDetailPage = lazy(() => import('./pages/IdeaDetailPage').then((m) => ({ default: m.IdeaDetailPage })));
const MentorPage = lazy(() => import('./pages/MentorPage').then((m) => ({ default: m.MentorPage })));
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage').then((m) => ({ default: m.AnalyzerPage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })));
const StartupCostCalculatorPage = lazy(() =>
  import('./pages/StartupCostCalculatorPage').then((m) => ({ default: m.StartupCostCalculatorPage })),
);
const ProfitCalculatorPage = lazy(() =>
  import('./pages/ProfitCalculatorPage').then((m) => ({ default: m.ProfitCalculatorPage })),
);
const PricingCalculatorPage = lazy(() =>
  import('./pages/PricingCalculatorPage').then((m) => ({ default: m.PricingCalculatorPage })),
);
const GuidesPage = lazy(() => import('./pages/GuidesPage').then((m) => ({ default: m.GuidesPage })));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage').then((m) => ({ default: m.GuideDetailPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then((m) => ({ default: m.BookmarksPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function ProtectedRoute({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-page py-24">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (admin && user.role !== 'ADMIN') {
    return (
      <div className="container-page py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <h1 className="mt-3 font-display text-3xl text-ink-950">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            This area is restricted to administrators. If you should have access, ask the site owner to
            promote your account.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="ideas/online" element={<IdeasPage mode="ONLINE" />} />
        <Route path="ideas/offline" element={<IdeasPage mode="OFFLINE" />} />
        <Route path="ideas/:slug" element={<IdeaDetailPage />} />

        <Route path="mentor" element={<MentorPage />} />
        <Route path="analyzer" element={<AnalyzerPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />

        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/startup-cost-calculator" element={<StartupCostCalculatorPage />} />
        <Route path="tools/profit-calculator" element={<ProfitCalculatorPage />} />
        <Route path="tools/pricing-calculator" element={<PricingCalculatorPage />} />

        <Route path="guides" element={<GuidesPage />} />
        <Route path="guides/:slug" element={<GuideDetailPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route
          path="bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute admin>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
