import React from 'react';
import {
  Activity,
  AlertOctagon,
  FileText,
  ShieldCheck,
  TrendingUp,
  Upload,
  Play,
  FileCheck,
  History,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { useApexStore } from '../store/useApexStore';

export const DashboardPage: React.FC = () => {
  const { setActiveTab } = useApexStore();

  const recentTimeline = [
    { time: '10 mins ago', event: 'Shadow Simulation executed for Asset P-101 (Bearing Overheat)' },
    { time: '25 mins ago', event: 'AI Decision recommendation generated (Confidence: 94.5%)' },
    { time: '40 mins ago', event: 'Dynamic Runbook updated with technician feedback for Step 1' },
    { time: '1 hr ago', event: 'Operational Memory serialized and stored for Incident #7370' },
    { time: '2 hrs ago', event: 'Industrial PDF Manual sample_manual.pdf indexed into Qdrant' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Command Center"
        description="Real-time decision intelligence, shadow simulation telemetry, and plant health monitoring."
        icon={Activity}
        actions={
          <button
            onClick={() => setActiveTab('simulation')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Shadow Sim</span>
          </button>
        }
      />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Incidents"
          value="1"
          icon={AlertOctagon}
          change="-50%"
          changeType="positive"
          description="P-101 Bearing Overheat"
          accentColor="amber"
        />
        <StatCard
          title="Critical Assets"
          value="12"
          icon={Activity}
          change="Nominal"
          changeType="neutral"
          description="High pressure valves & pumps"
          accentColor="blue"
        />
        <StatCard
          title="Documents Indexed"
          value="8"
          icon={FileText}
          change="+2 this week"
          changeType="positive"
          description="RAG vector store indexed"
          accentColor="emerald"
        />
        <StatCard
          title="Avg Risk Score"
          value="18.5%"
          icon={TrendingUp}
          change="-4.2%"
          changeType="positive"
          description="Evaluated via Monte Carlo"
          accentColor="purple"
        />
        <StatCard
          title="Compliance Score"
          value="98.2%"
          icon={ShieldCheck}
          change="Passed"
          changeType="positive"
          description="Enterprise audit compliant"
          accentColor="emerald"
        />
      </div>

      {/* Main Grid: Quick Actions & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <SectionCard title="Quick Command Actions" subtitle="Instant shortcuts to core engine features">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => setActiveTab('documents')}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/30 transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Upload Document</span>
                <span className="block text-[10px] text-slate-400">Ingest industrial PDF manuals</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/30 transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Run Simulation</span>
                <span className="block text-[10px] text-slate-400">Model risk & blast radius</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/30 transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Generate Report</span>
                <span className="block text-[10px] text-slate-400">Export audit PDF / DOCX</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/30 transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Incident History</span>
                <span className="block text-[10px] text-slate-400">View operational memory</span>
              </div>
            </button>
          </div>
        </SectionCard>

        {/* System Health */}
        <SectionCard title="System Telemetry Status" subtitle="Engine sub-service liveness check">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 font-medium">FastAPI Backend</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Qdrant Vector DB</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Knowledge Graph Store</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 12 Assets
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Shadow Simulation Engine</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity Timeline */}
      <SectionCard title="Recent Incident Telemetry Timeline" subtitle="Live stream of decision & simulation events">
        <Timeline items={recentTimeline} />
      </SectionCard>
    </div>
  );
};
