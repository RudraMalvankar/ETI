import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { useApexStore } from './store/useApexStore';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

// Dashboard Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const KnowledgeGraphPage = lazy(() => import('./pages/KnowledgeGraphPage').then(m => ({ default: m.KnowledgeGraphPage })));
const SimulationPage = lazy(() => import('./pages/SimulationPage').then(m => ({ default: m.SimulationPage })));
const DecisionPage = lazy(() => import('./pages/DecisionPage').then(m => ({ default: m.DecisionPage })));
const RunbookPage = lazy(() => import('./pages/RunbookPage').then(m => ({ default: m.RunbookPage })));
const MemoryPage = lazy(() => import('./pages/MemoryPage').then(m => ({ default: m.MemoryPage })));
const CompliancePage = lazy(() => import('./pages/CompliancePage').then(m => ({ default: m.CompliancePage })));
const IncidentHistoryPage = lazy(() => import('./pages/IncidentHistoryPage').then(m => ({ default: m.IncidentHistoryPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Public Pages (Will create these next)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })).catch(() => ({ default: () => <div>Landing Page (Coming Soon)</div> })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })).catch(() => ({ default: () => <div>Login Page (Coming Soon)</div> })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })).catch(() => ({ default: () => <div>Register Page (Coming Soon)</div> })));

export function App() {
  const { isDarkMode } = useApexStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="h-screen w-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <LoadingSkeleton count={1} height="h-12" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/dashboard/documents" element={<Layout><DocumentsPage /></Layout>} />
          <Route path="/dashboard/graph" element={<Layout><KnowledgeGraphPage /></Layout>} />
          <Route path="/dashboard/simulation" element={<Layout><SimulationPage /></Layout>} />
          <Route path="/dashboard/decision" element={<Layout><DecisionPage /></Layout>} />
          <Route path="/dashboard/runbook" element={<Layout><RunbookPage /></Layout>} />
          <Route path="/dashboard/memory" element={<Layout><MemoryPage /></Layout>} />
          <Route path="/dashboard/compliance" element={<Layout><CompliancePage /></Layout>} />
            <Route path="/dashboard/history" element={<Layout><IncidentHistoryPage /></Layout>} />
            <Route path="/dashboard/settings" element={<Layout><SettingsPage /></Layout>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster theme={isDarkMode ? 'dark' : 'light'} position="top-right" />
      </BrowserRouter>
    );
  }
