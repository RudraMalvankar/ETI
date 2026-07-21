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
  BrainCircuit
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { SectionCard } from '../components/common/SectionCard';
import { Timeline } from '../components/common/Timeline';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
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
      navigate('/dashboard/simulation');
    }, 1500);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] -m-4 md:-m-8 p-4 md:p-8 bg-[var(--bg-base)]">
      {/* Strict Operations Center Grid */}
      <div className="absolute inset-0 ops-grid-bg opacity-40 pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 space-y-6">
        
        {/* Top Telemetry Row - Dense and technical */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Overall System Health" value="82.4%" icon={ShieldCheck} change="-1.2% (1h)" changeType="negative" />
          <StatCard title="Active Incidents" value="1 Critical" icon={AlertOctagon} change="P-101 anomaly" changeType="negative" />
          <StatCard title="Active Shadow Sims" value="1,402" icon={Activity} change="Running" changeType="neutral" />
          <StatCard title="Compliance Posture" value="Ready" icon={FileText} change="100% Audit" changeType="positive" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Action Panel - The Copilot & Critical Alert */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="bg-[var(--bg-elevated)] border-2 border-accent-red rounded-lg p-6 md:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] uppercase font-bold tracking-widest mb-4">
                <AlertTriangle className="w-3 h-3" /> Priority 1 Alert
              </div>
              
              <h1 className="heading-lg font-bold mb-2">P-101 Bearing Overheat</h1>
              <p className="text-body text-sm mb-6 max-w-xl">
                Telemetry indicates bearing friction exceeding nominal thresholds. Knowledge graph analysis projects a high probability of cascading failure to V-202 isolation valve within <span className="text-accent-red font-bold">45 minutes</span>.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard/runbook')}
                  className="px-4 py-2 rounded bg-accent-red hover:bg-accent-red/90 text-white font-medium text-sm transition-colors flex items-center gap-2"
                >
                  Execute Recovery Runbook <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSimulating ? <Activity className="w-4 h-4 animate-pulse text-primary-500" /> : <Play className="w-4 h-4 text-primary-500" />}
                  {isSimulating ? 'Simulating...' : 'Run Shadow Simulation'}
                </button>
              </div>
            </div>

            {/* Knowledge Graph Snapshot */}
            <SectionCard 
              title="Live Topology & Blast Radius" 
              subtitle="Real-time propagation mapping based on P-101 telemetry"
              action={<button onClick={() => navigate('/dashboard/graph')} className="text-primary-500 text-xs font-semibold hover:underline flex items-center gap-1">Open Full Map <ArrowRight className="w-3 h-3" /></button>}
              className="flex-1 min-h-[400px] flex flex-col"
            >
              <div className="flex-1 rounded border border-[var(--border-strong)] relative bg-[var(--bg-base)]">
                <ReactFlow nodes={graphNodes} edges={graphEdges} fitView attributionPosition="bottom-right">
                  <Background color="rgba(156, 163, 175, 0.1)" gap={20} size={1} />
                  <Controls className="!bg-[var(--bg-surface)] !border-[var(--border-strong)] !fill-[var(--text-secondary)]" />
                </ReactFlow>
                <div className="absolute top-3 left-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] px-2 py-1 rounded flex items-center gap-2 shadow-soft">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-red uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" /> Critical Path
                  </span>
                </div>
              </div>
            </SectionCard>

          </motion.div>

          {/* Right Sidebar - AI Copilot & Live Feed */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            
            {/* AI Copilot Panel */}
            <div className="bg-[var(--bg-elevated)] border border-primary-500/30 rounded-lg p-5 flex flex-col min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border-muted)]">
                <div className="p-1.5 rounded bg-primary-500/10 text-primary-500">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] uppercase">AI Copilot Recommendation</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                <div className="p-3 rounded bg-accent-emerald/5 border border-accent-emerald/20">
                  <span className="block text-[10px] uppercase font-bold text-accent-emerald tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Safest Strategy (94.5%)
                  </span>
                  <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
                    Immediately isolate inlet valve V-202 via LOTO and depressurize housing. Proceed to runbook execution to avoid mechanical shearing.
                  </p>
                </div>

                <div className="p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                   <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                     <span className="text-primary-500 font-bold">Citation:</span> OEM Manual Sec 4.2 recommends this procedure for high-friction anomalies on P-class centrifugal pumps.
                   </p>
                </div>
              </div>
            </div>

            {/* Live Operational Feed */}
            <SectionCard title="Command Center Feed" subtitle="Live system chronolog" className="flex-1">
              <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-[var(--border-strong)]">
                <Timeline items={incidentTimeline} />
              </div>
            </SectionCard>

          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};
