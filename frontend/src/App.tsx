import { JSX, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { shallow } from 'zustand/shallow';
import { Layout } from './components/layout/Layout';
import { useApexStore } from './store/useApexStore';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { fetchCurrentUser } from './services/authServices';
import { checkBackendHealth } from './services/apiClient';

// Dashboard Pages
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);
const DocumentsPage = lazy(() =>
  import('./pages/DocumentsPage').then(m => ({ default: m.DocumentsPage }))
);
const KnowledgeGraphPage = lazy(() =>
  import('./pages/KnowledgeGraphPage').then(m => ({ default: m.KnowledgeGraphPage }))
);
const SimulationPage = lazy(() =>
  import('./pages/SimulationPage').then(m => ({ default: m.SimulationPage }))
);
const DecisionPage = lazy(() =>
  import('./pages/DecisionPage').then(m => ({ default: m.DecisionPage }))
);
const RunbookPage = lazy(() =>
  import('./pages/RunbookPage').then(m => ({ default: m.RunbookPage }))
);
const MemoryPage = lazy(() => import('./pages/MemoryPage').then(m => ({ default: m.MemoryPage })));
const CompliancePage = lazy(() =>
  import('./pages/CompliancePage').then(m => ({ default: m.CompliancePage }))
);
const IncidentHistoryPage = lazy(() =>
  import('./pages/IncidentHistoryPage').then(m => ({ default: m.IncidentHistoryPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage }))
);

// Public Pages
const LandingPage = lazy(() =>
  import('./pages/LandingPage')
    .then(m => ({ default: m.LandingPage }))
    .catch(() => ({ default: () => <div>Landing Page</div> }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage')
    .then(m => ({ default: m.LoginPage }))
    .catch(() => ({ default: () => <div>Login Page</div> }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage')
    .then(m => ({ default: m.RegisterPage }))
    .catch(() => ({ default: () => <div>Register Page</div> }))
);

const ProtectedRoute = ({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: JSX.Element;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  const {
    isDarkMode,
    isAuthenticated,
    currentUser,
    setCurrentUser,
    clearAuthSession,
    setConnectionState,
  } = useApexStore(
    state => ({
      isDarkMode: state.isDarkMode,
      isAuthenticated: state.isAuthenticated,
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
      clearAuthSession: state.clearAuthSession,
      setConnectionState: state.setConnectionState,
    }),
    shallow
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isAuthenticated || currentUser) {
      return;
    }

    fetchCurrentUser()
      .then(profile => {
        setCurrentUser(profile);
      })
      .catch(() => {
        clearAuthSession();
      });
  }, [clearAuthSession, currentUser, isAuthenticated, setCurrentUser]);

  useEffect(() => {
    checkBackendHealth()
      .then(isHealthy => {
        setConnectionState(isHealthy ? 'connected' : 'offline');
      })
      .catch(() => {
        setConnectionState('offline');
      });
  }, [setConnectionState]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="h-screen w-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <LoadingSkeleton count={1} height="h-12" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/documents"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <DocumentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/graph"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <KnowledgeGraphPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/simulation"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <SimulationPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decision"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <DecisionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/runbook"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <RunbookPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/memory"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <MemoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/compliance"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <CompliancePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <IncidentHistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <Toaster theme={isDarkMode ? 'dark' : 'light'} position="top-right" />
    </BrowserRouter>
  );
}
