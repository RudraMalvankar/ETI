import React from 'react';
import { motion } from 'framer-motion';
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
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { useApexStore } from '../store/useApexStore';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export const DashboardPage: React.FC = () => {
  const { setActiveTab } = useApexStore();

  const recentTimeline = [
    { time: '10 mins ago', event: 'Shadow Simulation executed for Asset P-101 (Bearing Overheat)' },
    { time: '25 mins ago', event: 'AI Decision recommendation generated (Confidence: 94.5%)' },
    { time: '40 mins ago', event: 'Dynamic Runbook updated with technician feedback for Step 1' },
    { time: '1 hr ago', event: 'Operational Memory serialized and stored for Incident #7370' },
    { time: '2 hrs ago', event: 'Industrial PDF Manual sample_manual.pdf indexed into Qdrant' },
  ];

  const previewNodes = [
    { id: 'P-101', data: { label: 'P-101 (Critical)' }, position: { x: 50, y: 50 }, style: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px' } },
    { id: 'V-202', data: { label: 'V-202' }, position: { x: 250, y: 50 }, style: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '8px' } },
  ];
  const previewEdges = [
    { id: 'e1', source: 'P-101', target: 'V-202', animated: true, style: { stroke: '#ef4444' } }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 1. AI Copilot Hero */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-[var(--glass-border)] glass-panel group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-brand-500/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-purple/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 group-hover:bg-accent-purple/20 transition-all duration-700" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold mb-6">
              <Zap className="w-3.5 h-3.5" /> Active Incident Detected
            </div>
            <h1 className="heading-1 mb-4">P-101 Bearing Overheat</h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-8 max-w-xl">
              The AI Engine has detected a critical anomaly in Centrifugal Pump P-101. 
              Knowledge graph analysis indicates a high probability of cascading failure to V-202 within 45 minutes.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveTab('runbook')}
                className="px-6 py-3 rounded-xl bg-brand-500 text-white font-bold shadow-[0_4px_15px_rgba(14,165,233,0.4)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Execute Recovery Runbook <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className="px-6 py-3 rounded-xl glass-panel text-[var(--text-primary)] hover:bg-[var(--glass-border)] font-semibold transition-all"
              >
                Simulate Risk (94.5% Conf.)
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            {/* Quick KPI stats for the incident */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-accent-red/20 bg-accent-red/5">
                <span className="block text-xs font-semibold text-accent-red uppercase tracking-wide mb-1">Risk Level</span>
                <span className="text-3xl font-extrabold text-[var(--text-primary)]">Critical</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel">
                <span className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Time to Impact</span>
                <span className="text-3xl font-extrabold text-[var(--text-primary)]">45m</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel">
                <span className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Affected Asset</span>
                <span className="text-3xl font-extrabold text-[var(--text-primary)]">P-101</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel">
                <span className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">AI Confidence</span>
                <span className="text-3xl font-extrabold text-accent-emerald">94.5%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Knowledge Graph & Simulation Preview row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Knowledge Graph Preview" 
          subtitle="Live blast radius propagation"
          action={<button onClick={() => setActiveTab('graph')} className="text-brand-500 text-xs font-semibold hover:underline">View Full Graph</button>}
          className="h-72 flex flex-col"
        >
          <div className="flex-1 rounded-xl overflow-hidden border border-[var(--glass-border)] relative">
            <ReactFlow nodes={previewNodes} edges={previewEdges} fitView attributionPosition="bottom-right">
              <Background color="#475569" gap={16} size={1} />
            </ReactFlow>
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-accent-red bg-[var(--glass-bg)] px-2 py-1 rounded-lg backdrop-blur-md border border-accent-red/20">
                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" /> Live
              </span>
            </div>
          </div>
        </SectionCard>

        {/* System Health replaced with cleaner telemetry */}
        <SectionCard title="Engine Telemetry" subtitle="Sub-system health metrics">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] group hover:border-brand-500/30 transition-colors">
              <span className="text-[var(--text-primary)] font-medium">FastAPI Backend</span>
              <span className="inline-flex items-center gap-2 text-accent-emerald font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] group hover:border-brand-500/30 transition-colors">
              <span className="text-[var(--text-primary)] font-medium">Qdrant Vector DB</span>
              <span className="inline-flex items-center gap-2 text-accent-emerald font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] group hover:border-brand-500/30 transition-colors">
              <span className="text-[var(--text-primary)] font-medium">Shadow Simulation Engine</span>
              <span className="inline-flex items-center gap-2 text-accent-emerald font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* 3. Operational KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Incidents"
          value="1"
          icon={AlertOctagon}
          change="-50%"
          changeType="positive"
          accentColor="red"
        />
        <StatCard
          title="Documents Indexed"
          value="8"
          icon={FileText}
          change="+2 this week"
          changeType="positive"
          accentColor="emerald"
        />
        <StatCard
          title="Avg Risk Score"
          value="18.5%"
          icon={TrendingUp}
          change="-4.2%"
          changeType="positive"
          accentColor="purple"
        />
        <StatCard
          title="Compliance"
          value="98.2%"
          icon={ShieldCheck}
          change="Passed"
          changeType="positive"
          accentColor="blue"
        />
      </motion.div>

      {/* 4. Recent Activity Timeline */}
      <motion.div variants={itemVariants}>
        <SectionCard title="Recent Incident Telemetry Timeline" subtitle="Live stream of decision & simulation events">
          <Timeline items={recentTimeline} />
        </SectionCard>
      </motion.div>
    </motion.div>
  );
};
