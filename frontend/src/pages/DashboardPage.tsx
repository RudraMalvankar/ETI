import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  FileText,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { useNavigate } from 'react-router-dom';

// APEX Autopilot Feature Integrations
import { CausalGraphView } from '../features/graph/CausalGraphView';
import { ExecutableRunbookEngine } from '../features/runbook/ExecutableRunbookEngine';
import { TagEntityInspector } from '../features/documents/TagEntityInspector';
import { ExpertCopilotDrawer } from '../features/copilot/ExpertCopilotDrawer';
import { ComplianceHubModal } from '../features/compliance/ComplianceHubModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);

  const incidentTimeline = [
    { time: '09:21', event: 'Sensor S-404 logged abnormal pressure & vibration spike (+4.2g)' },
    { time: '09:22', event: 'Causal Shadow-Run mapped failure blast radius to Valve V-102 & Pump P-202A' },
    { time: '09:23', event: 'Shadow Simulation completed (94.5% confidence of cascading failure)' },
    { time: '09:24', event: 'AI Decision Copilot generated LOTO recovery strategy with OISD-117 citations' },
    { time: '09:25', event: 'Executable Runbook pushed to field technician mobile devices' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      navigate('/dashboard/simulation');
    }, 1500);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] -m-4 md:-m-8 p-4 md:p-8 bg-[var(--bg-base)]">
      {/* Operations Center Grid Overlay */}
      <div className="absolute inset-0 ops-grid-bg opacity-30 pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 space-y-6">
        
        {/* Top Telemetry KPI Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Overall System Health" value="82.4%" icon={ShieldCheck} change="-1.2% (1h)" changeType="negative" isLive sparklineData={[90, 89, 91, 88, 86, 85, 83, 82.4]} />
          <StatCard title="Active Critical Alarms" value="1 Anomaly" icon={AlertOctagon} change="Reactor R-101" changeType="negative" isLive sparklineData={[0, 0, 0, 0, 0, 1, 1, 1]} />
          <StatCard title="Active Shadow Sims" value="1,402" icon={Activity} change="Live Tracing" changeType="neutral" isLive sparklineData={[1100, 1150, 1200, 1300, 1350, 1380, 1400, 1402]} />
          <StatCard title="OISD/PESO Posture" value="100% Audit" icon={FileText} change="Audit Ready" changeType="positive" sparklineData={[100, 100, 100, 100, 100, 100]} />
        </motion.div>

        {/* Priority 1 Alarm Control Center Banner */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-r from-red-950/60 via-[#111827] to-[#131B2B] border-2 border-red-500/50 rounded-2xl p-6 md:p-7 shadow-2xl shadow-red-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> PRIORITY 1 ALARM ACTIVE
              </span>
              <span className="text-xs font-mono text-slate-400">INCIDENT ID: #INC-2026-9042</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Time Saved by APEX: <strong className="text-emerald-400 font-bold">~45 Minutes</strong></span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight mb-2">
                Reactor R-101 Pressure Surge & Emergency Isolation Anomaly
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-inter">
                Telemetry sensor PT-401 indicates reactor pressure surging to <span className="text-red-400 font-mono font-bold">18.4 Bar</span> (exceeding safe operating limit of 15.0 Bar). Knowledge Graph projects high probability of failure propagation within <span className="text-red-400 font-bold font-mono">45 minutes</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/dashboard/runbook')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all hover:scale-102 flex items-center gap-2"
              >
                <span>Execute Field Runbook</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-xl bg-[#1A2333] hover:bg-[#222E42] border border-slate-700 text-white font-semibold text-xs transition-all hover:scale-102 flex items-center gap-2 shadow-sm"
              >
                {isSimulating ? <Activity className="w-4 h-4 animate-spin text-blue-400" /> : <Play className="w-4 h-4 text-blue-400" />}
                <span>{isSimulating ? 'Simulating...' : 'Run Shadow Simulator'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dual Core Engine Layout: Causal Failure Graph & Executable Runbook */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Causal Graph Panel */}
          <div className="lg:col-span-7 flex flex-col h-[540px]">
            <CausalGraphView />
          </div>

          {/* Executable Runbook Panel */}
          <div className="lg:col-span-5 flex flex-col h-[540px]">
            <ExecutableRunbookEngine />
          </div>
        </motion.div>

        {/* Bottom Intelligence Row: AI Copilot Recommendations & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Decision Copilot Card */}
          <motion.div variants={itemVariants} className="bg-[#0D131F] border border-blue-500/30 rounded-2xl p-5 flex flex-col min-h-[260px] shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-display">AI Autopilot Recommendation</h2>
                <p className="text-[10px] text-slate-400 font-mono">LLM Strategy Engine • 94.5% Confidence</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Mitigation Strategy
                </span>
                <p className="text-xs font-medium text-slate-200 leading-relaxed font-inter">
                  Isolate feed valve V-102 via Lockout/Tagout (LOTO). If V-102 jams open, engage Bypass Valve V-108 to redirect relief stream directly to Flare Stack FS-01.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-blue-400 font-bold">Document Citation:</span> OEM Manual Sec 4.2 & OISD-STD-117 Clause 7.3 (Hazardous Energy Control).
              </div>
            </div>
          </motion.div>

          {/* Command Center Chronolog Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col">
            <SectionCard title="Command Center Chronolog" subtitle="Real-time telemetry event stream" className="flex-1">
              <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-slate-800">
                <Timeline items={incidentTimeline} />
              </div>
            </SectionCard>
          </motion.div>
        </div>

        {/* Global Drawers & Modals */}
        <TagEntityInspector />
        <ExpertCopilotDrawer />
        <ComplianceHubModal />

      </motion.div>
    </div>
  );
};
