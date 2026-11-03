import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoadingBlock } from './components/ui';
import { HomePage } from './pages/HomePage';
import { IdeasPage } from './pages/IdeasPage';
import { IdeaDetailPage } from './pages/IdeaDetailPage';
import { MentorPage } from './pages/MentorPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ToolsPage } from './pages/ToolsPage';
import { StartupCostCalculatorPage } from './pages/StartupCostCalculatorPage';
import { ProfitCalculatorPage } from './pages/ProfitCalculatorPage';
import { PricingCalculatorPage } from './pages/PricingCalculatorPage';
import { GuidesPage } from './pages/GuidesPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
