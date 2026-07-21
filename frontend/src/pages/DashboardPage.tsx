import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  FileText,
  ShieldCheck,
  Play,
  CheckCircle2,
  Zap,
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
    <div className="relative min-h-[calc(100vh-80px)] -mt-8 -mx-8 p-8 overflow-hidden">
      {/* Operations Center Background Grid */}
      <div className="absolute inset-0 premium-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 space-y-8">
        
        {/* Top Telemetry Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Overall System Health" value="82.4%" icon={ShieldCheck} change="-1.2% (1h)" changeType="negative" accentColor="amber" />
          <StatCard title="Active Incidents" value="1 Critical" icon={AlertOctagon} change="P-101 anomaly" changeType="negative" accentColor="red" />
          <StatCard title="Active Shadow Sims" value="1,402" icon={Activity} change="Running" changeType="neutral" accentColor="blue" />
          <StatCard title="Compliance Posture" value="Ready" icon={FileText} change="100% Audit" changeType="positive" accentColor="emerald" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Action Panel - The Copilot & Critical Alert */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] p-8 glass-panel border border-accent-red/20 group bg-gradient-to-br from-[var(--bg-secondary)] to-accent-red/5 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-red/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold mb-6 animate-pulse">
                  <Zap className="w-3.5 h-3.5" /> PRIORITY 1 ALERT
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">P-101 Bearing Overheat</h1>
                <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl font-medium">
                  Telemetry indicates bearing friction exceeding nominal thresholds. Knowledge graph analysis projects a high probability of cascading failure to V-202 isolation valve within <span className="text-accent-red font-bold">45 minutes</span>.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigate('/dashboard/runbook')}
                    className="px-6 py-4 rounded-xl bg-accent-red text-white font-bold shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    Execute Recovery Runbook <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-6 py-4 rounded-xl glass-panel text-white hover:bg-brand-500/10 hover:border-brand-500/40 font-semibold transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isSimulating ? <Zap className="w-4 h-4 animate-pulse text-brand-500" /> : <Play className="w-4 h-4 text-brand-500" />}
                    {isSimulating ? 'Simulating...' : 'Run Shadow Simulation'}
                  </button>
                </div>
              </div>
            </div>

            {/* Knowledge Graph Snapshot */}
            <SectionCard 
              title="Live Topology & Blast Radius" 
              subtitle="Real-time propagation mapping"
              action={<button onClick={() => navigate('/dashboard/graph')} className="text-brand-500 text-xs font-bold hover:underline flex items-center gap-1">Open Full Map <ArrowRight className="w-3 h-3" /></button>}
              className="h-[350px] flex flex-col"
            >
              <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--glass-border)] relative bg-[#0B0F17]">
                <ReactFlow nodes={graphNodes} edges={graphEdges} fitView attributionPosition="bottom-right">
                  <Background color="rgba(255,255,255,0.05)" gap={24} size={1} />
                  <Controls className="!bg-[var(--bg-secondary)] !border-[var(--glass-border)] !fill-[var(--text-secondary)]" />
                </ReactFlow>
                <div className="absolute top-4 left-4 glass-panel px-3 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                  <span className="flex items-center gap-2 text-xs font-semibold text-accent-red">
                    <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" /> Critical Path
                  </span>
                </div>
              </div>
            </SectionCard>

          </motion.div>

          {/* Right Sidebar - AI Copilot & Live Feed */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* AI Copilot Panel */}
            <div className="glass-panel p-6 rounded-[2rem] border-brand-500/30 bg-gradient-to-b from-brand-500/5 to-transparent relative overflow-hidden h-[300px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">AI Copilot Recommendation</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                <div className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20">
                  <span className="block text-[10px] uppercase font-bold text-accent-emerald tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Safest Strategy (94.5% Confidence)
                  </span>
                  <p className="text-sm font-medium text-white/90 leading-relaxed">
                    Immediately isolate inlet valve V-202 via LOTO and depressurize housing. Proceed to runbook execution to avoid mechanical shearing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                   <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                     <span className="text-brand-400 font-bold">Citation:</span> OEM Manual Sec 4.2 recommends this procedure for high-friction anomalies on P-class centrifugal pumps.
                   </p>
                </div>
              </div>
            </div>

            {/* Live Operational Feed */}
            <SectionCard title="Command Center Feed" subtitle="Live chronolog">
              <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--glass-border)] before:to-transparent">
                <Timeline items={incidentTimeline} />
              </div>
            </SectionCard>

          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};
