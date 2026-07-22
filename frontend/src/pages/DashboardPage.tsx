import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  FileText,
  ShieldCheck,
  ArrowRight,
  Clock,
  Database,
  Network,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { checkBackendHealth } from '../services/apiClient';
import {
  getGraphStatistics,
  getIncidents,
  getMemoryTrends,
  listDocuments,
} from '../services/apexServices';
import { useApexStore } from '../store/useApexStore';

interface DashboardSnapshot {
  health: boolean;
  documents: number;
  indexedChunks: number;
  incidents: number;
  resolutionRate: number;
  criticalAsset: string;
  commonFailure: string;
  graphNodes: number;
  graphEdges: number;
}

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  health: false,
  documents: 0,
  indexedChunks: 0,
  incidents: 0,
  resolutionRate: 0,
  criticalAsset: 'N/A',
  commonFailure: 'N/A',
  graphNodes: 0,
  graphEdges: 0,
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSimulation, currentRunbook, currentUser } = useApexStore();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY_SNAPSHOT);
  const [timelineItems, setTimelineItems] = useState<Array<{ time: string; event: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      const [health, documents, incidents, trends, graphStats] = await Promise.all([
        checkBackendHealth(),
        listDocuments(),
        getIncidents(),
        getMemoryTrends(),
        getGraphStatistics(),
      ]);

      setSnapshot({
        health,
        documents: documents.length,
        indexedChunks: documents.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0),
        incidents: incidents.length,
        resolutionRate: trends?.resolution_rate || 0,
        criticalAsset: trends?.most_vulnerable_asset || 'N/A',
        commonFailure: trends?.most_common_failure_type || 'N/A',
        graphNodes: graphStats?.total_nodes || 0,
        graphEdges: graphStats?.total_edges || 0,
      });

      const latestIncidents = [...incidents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map(incident => ({
          time: new Date(incident.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          event: `${incident.failed_asset} ${incident.failure_type.replace(/_/g, ' ')} -> ${incident.outcome}`,
        }));
      setTimelineItems(latestIncidents);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to load dashboard snapshot.';
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const activeOperationSummary = useMemo(() => {
    if (currentSimulation?.simulation_id) {
      return {
        title: `Live Simulation: ${currentSimulation.request.failed_asset}`,
        body: `Failure mode ${currentSimulation.request.failure_type.replace(/_/g, ' ')} has ${currentSimulation.scenarios.length} backend scenarios available for analysis.`,
        cta: 'Open Maintenance Intelligence',
        href: '/dashboard/simulation',
      };
    }

    if (currentRunbook?.runbook_id) {
      return {
        title: `Runbook Active for ${currentRunbook.failed_asset}`,
        body: `${currentRunbook.steps.length} live runbook step(s) are available with backend status tracking.`,
        cta: 'Open Runbook',
        href: '/dashboard/runbook',
      };
    }

    return {
      title: 'No Active Incident Context',
      body: 'Upload documents, run a simulation, or persist incidents to build a live operational picture.',
      cta: 'Open Documents',
      href: '/dashboard/documents',
    };
  }, [currentRunbook, currentSimulation]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Unified Asset & Operations Brain
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-3xl">
            Live summary of backend health, document intelligence coverage, incident memory, and knowledge graph readiness for the signed-in role.
          </p>
        </div>

        <button
          onClick={refreshDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Backend Health"
          value={snapshot.health ? 'Connected' : 'Offline'}
          icon={ShieldCheck}
          change={currentUser?.role || 'Unknown Role'}
          changeType={snapshot.health ? 'positive' : 'negative'}
          isLive
        />
        <StatCard
          title="Indexed Documents"
          value={snapshot.documents}
          icon={FileText}
          change={`${snapshot.indexedChunks} chunks`}
          changeType="neutral"
          isLive
        />
        <StatCard
          title="Stored Incidents"
          value={snapshot.incidents}
          icon={Database}
          change={`${snapshot.resolutionRate}% resolved`}
          changeType={snapshot.resolutionRate >= 80 ? 'positive' : 'neutral'}
          isLive
        />
        <StatCard
          title="Knowledge Graph"
          value={snapshot.graphNodes}
          icon={Network}
          change={`${snapshot.graphEdges} edges`}
          changeType="neutral"
          isLive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={activeOperationSummary.title}
            subtitle="Live workflow state from the current session"
            action={
              <button
                onClick={() => navigate(activeOperationSummary.href)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
              >
                <span>{activeOperationSummary.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {activeOperationSummary.body}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                  Most Vulnerable Asset
                </span>
                <p className="text-lg font-bold text-white">{snapshot.criticalAsset}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                  Common Failure Type
                </span>
                <p className="text-lg font-bold text-white capitalize">
                  {snapshot.commonFailure.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                  Simulation Scenarios
                </span>
                <p className="text-lg font-bold text-white">
                  {currentSimulation?.scenarios.length || 0}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Current Focus" subtitle="Recommended next workflow">
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/documents')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-left hover:border-brand-500/40 transition"
              >
                <div>
                  <p className="text-sm font-bold text-white">Document Intelligence</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Upload and index manuals, SOPs, and logs
                  </p>
                </div>
                <FileText className="w-4 h-4 text-brand-400" />
              </button>

              <button
                onClick={() => navigate('/dashboard/simulation')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-left hover:border-brand-500/40 transition"
              >
                <div>
                  <p className="text-sm font-bold text-white">Maintenance Intelligence</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Run propagation scenarios from real graph context
                  </p>
                </div>
                <Activity className="w-4 h-4 text-brand-400" />
              </button>

              <button
                onClick={() => navigate('/dashboard/memory')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-left hover:border-brand-500/40 transition"
              >
                <div>
                  <p className="text-sm font-bold text-white">Lessons Learned</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Review stored incidents and organizational memory
                  </p>
                </div>
                <Clock className="w-4 h-4 text-brand-400" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Recent Incident Chronology" subtitle="Latest stored operational events from backend memory">
            {timelineItems.length ? (
              <Timeline items={timelineItems} />
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
                No stored incidents are available yet.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Platform Signals" subtitle="Backend-derived operational posture">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] text-xs">Critical Asset Exposure</span>
                <span className="text-sm font-bold text-white">{snapshot.criticalAsset}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] text-xs">Common Failure Mode</span>
                <span className="text-sm font-bold text-white capitalize">
                  {snapshot.commonFailure.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] text-xs">Connection State</span>
                <span className={`text-sm font-bold ${snapshot.health ? 'text-accent-emerald' : 'text-accent-red'}`}>
                  {snapshot.health ? 'Healthy' : 'Unavailable'}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Attention Queue" subtitle="What still needs enterprise follow-through">
            <div className="space-y-3 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <AlertOctagon className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
                <span>Dashboard values now come from backend APIs, but notifications and some shell chrome still need real event sources.</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <Activity className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <span>Live validation against the actual backend services configured in `.env` is still needed beyond build-time checks.</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
