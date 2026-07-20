import { lazy, Suspense, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useApexStore } from './store/useApexStore';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

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

export function App() {
  const { activeTab, isDarkMode } = useApexStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'graph':
        return <KnowledgeGraphPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'decision':
        return <DecisionPage />;
      case 'runbook':
        return <RunbookPage />;
      case 'memory':
        return <MemoryPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'history':
        return <IncidentHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout>
      <Suspense fallback={<LoadingSkeleton count={4} height="h-24" />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}
