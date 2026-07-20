import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  FileText,
  ShieldCheck,
  TrendingUp,
  Play,
  CheckCircle2,
  Zap,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { useApexStore } from '../store/useApexStore';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export const DashboardPage: React.FC = () => {
  const { setActiveTab } = useApexStore();
  const [isSimulating, setIsSimulating] = useState(false);

  const incidentTimeline = [
    { time: '09:21', event: 'Sensor S-404 logged abnormal vibration spike (+4.2g)' },
    { time: '09:22', event: 'Knowledge Graph mapped blast radius to V-202' },
    { time: '09:23', event: 'Shadow Simulation completed (94.5% confidence of failure)' },
    { time: '09:24', event: 'AI Decision Copilot generated recovery strategy' },
    { time: '09:25', event: 'Recovery Runbook drafted and pending execution' },
  ];

  const graphNodes = [
    { id: 'P-101', data: { label: 'P-101' }, position: { x: 100, y: 150 }, style: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '2px solid #ef4444', borderRadius: '12px', padding: '15px' } },
    { id: 'V-202', data: { label: 'V-202' }, position: { x: 400, y: 150 }, style: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '2px solid #f59e0b', borderRadius: '12px', padding: '15px' } },
    { id: 'HE-303', data: { label: 'HE-303' }, position: { x: 700, y: 150 }, style: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '2px solid #10b981', borderRadius: '12px', padding: '15px' } },
  ];
  const graphEdges = [
    { id: 'e1', source: 'P-101', target: 'V-202', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e2', source: 'V-202', target: 'HE-303', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setActiveTab('simulation');
    }, 1500);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
      
      {/* 1. AI Copilot Hero & Recommended Action */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 glass-panel border border-[var(--glass-border)] group">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 group-hover:bg-brand-500/15 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 group-hover:bg-accent-purple/15 transition-all duration-1000" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold mb-6">
                <Zap className="w-3.5 h-3.5" /> Critical Incident Detected
              </div>
              <h1 className="heading-1 mb-4 leading-tight">P-101 Bearing Overheat</h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-6">
                Sensor telemetry indicates bearing friction exceeding nominal thresholds. Knowledge graph analysis projects a high probability of cascading failure to V-202 isolation valve within 45 minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={() => setActiveTab('runbook')}
                className="px-6 py-3.5 rounded-xl bg-accent-red text-white font-bold shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Execute Recovery Runbook <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-6 py-3.5 rounded-xl glass-panel text-[var(--text-primary)] hover:border-brand-500/40 font-semibold transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSimulating ? <Zap className="w-4 h-4 animate-pulse text-brand-500" /> : <Play className="w-4 h-4 text-brand-500" />}
                {isSimulating ? 'Simulating...' : 'Run Shadow Simulation'}
              </button>
            </div>
          </div>

          {/* Dedicated AI Copilot Panel */}
          <div className="glass-panel p-6 rounded-2xl border-brand-500/30 bg-[var(--bg-primary)]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[50px] rounded-full" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="heading-2 text-lg">AI Recommendation</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                <span className="block text-[10px] uppercase font-semibold text-[var(--text-secondary)] tracking-wider mb-1">Confidence</span>
                <span className="text-2xl font-extrabold text-accent-emerald">94.5%</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                <span className="block text-[10px] uppercase font-semibold text-[var(--text-secondary)] tracking-wider mb-1">Est. Downtime</span>
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">45m</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/20 mb-6">
              <span className="block text-[10px] uppercase font-semibold text-accent-amber tracking-wider mb-2">Primary Recovery Strategy</span>
              <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                Immediately isolate inlet valve V-202 via LOTO and depressurize housing to prevent mechanical shearing.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab('compliance')}
              className="w-full py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] text-xs font-bold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Compliance Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Knowledge Graph Live Visualization */}
      <motion.div variants={itemVariants}>
        <SectionCard 
          title="Live Blast Radius Topology" 
          subtitle="Real-time propagation map based on current telemetry"
          action={<button onClick={() => setActiveTab('graph')} className="text-brand-500 text-xs font-bold hover:underline flex items-center gap-1">Open Workspace <ArrowRight className="w-3 h-3" /></button>}
          className="h-[400px] flex flex-col"
        >
          <div className="flex-1 rounded-xl overflow-hidden border border-[var(--glass-border)] relative bg-[var(--bg-secondary)]">
            <ReactFlow nodes={graphNodes} edges={graphEdges} fitView attributionPosition="bottom-right">
              <Background color="#475569" gap={20} size={1} />
              <Controls />
            </ReactFlow>
            <div className="absolute top-4 left-4 glass-panel px-3 py-2 rounded-xl flex items-center gap-3 shadow-lg">
              <span className="flex items-center gap-2 text-xs font-semibold text-accent-red">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse" /> Critical
              </span>
              <span className="w-px h-3 bg-[var(--glass-border)]" />
              <span className="flex items-center gap-2 text-xs font-semibold text-accent-amber">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" /> At Risk
              </span>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* 3. Shadow Simulation & Live Telemetry Intelligence */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard title="Active Incident Risk" value="Critical" icon={AlertOctagon} change="Propagation Active" changeType="negative" accentColor="red" />
        <StatCard title="Simulation Cycles" value="1,402" icon={Activity} change="Last 60 mins" changeType="neutral" accentColor="blue" />
        <StatCard title="System Health" value="82%" icon={ShieldCheck} change="-18% from nominal" changeType="negative" accentColor="amber" />
        <StatCard title="Resolution Progress" value="Pending" icon={TrendingUp} change="Awaiting execution" changeType="neutral" accentColor="purple" />
      </motion.div>

      {/* 4. Incident Timeline & Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Live Operational Timeline" subtitle="Chronological incident events">
          <Timeline items={incidentTimeline} />
        </SectionCard>

        <SectionCard title="System Sub-Services" subtitle="Engine liveness checks">
          <div className="space-y-4">
            {['FastAPI Backend', 'Qdrant Vector DB', 'Shadow Simulation Engine', 'Knowledge Graph Store'].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] group hover:border-brand-500/30 transition-all">
                <span className="text-[var(--text-primary)] font-medium text-sm">{service}</span>
                <span className="inline-flex items-center gap-2 text-accent-emerald font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Operational
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

    </motion.div>
  );
};
