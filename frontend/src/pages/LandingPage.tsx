import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Hexagon, 
  Activity, 
  Network, 
  Database, 
  BrainCircuit,
  AlertTriangle,
  Factory,
  BarChart,
  TerminalSquare,
  Lock,
  Server,
  Layers,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      
      {/* 0. Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-[var(--border-muted)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-600 text-white">
            <Hexagon className="w-5 h-5" />
          </div>
          <span className="text-sm font-display font-semibold tracking-tight">APEX</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Sign In</button>
          <button onClick={() => navigate('/register')} className="px-4 py-2 rounded text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface)] transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* 1. Hero */}
      <section className="relative pt-[160px] pb-[120px] px-6 border-b border-[var(--border-muted)] bg-[var(--bg-base)]">
        <div className="absolute inset-0 ops-grid-bg opacity-30" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-medium text-xs mb-8"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            APEX is now available for Enterprise
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="heading-xl mb-6 leading-tight max-w-4xl mx-auto"
          >
            The Decision Intelligence <br /> Platform for Industry.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-body text-lg mb-10 max-w-2xl mx-auto"
          >
            APEX combines causal shadow simulation, live knowledge graphs, and executable runbooks to keep mission-critical assets running. Predict failures before they happen.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors w-full sm:w-auto"
            >
              Deploy APEX
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-sm transition-colors w-full sm:w-auto">
              Read the Docs
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, type: 'spring', stiffness: 100 }}
            className="mt-16 mx-auto max-w-4xl relative"
          >
            <div className="w-full aspect-video rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col relative z-20">
              <div className="w-full h-8 border-b border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-red/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald/80"></div>
                <div className="mx-auto text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> apex.enterprise/dashboard
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col gap-4 bg-[var(--bg-base)]">
                 <div className="grid grid-cols-4 gap-4 h-1/4">
                   <div className="bg-[var(--bg-surface)] rounded border border-[var(--border-muted)]"></div>
                   <div className="bg-[var(--bg-surface)] rounded border border-[var(--border-muted)]"></div>
                   <div className="bg-[var(--bg-surface)] rounded border border-[var(--border-muted)]"></div>
                   <div className="bg-[var(--bg-surface)] rounded border border-[var(--border-muted)]"></div>
                 </div>
                 <div className="flex gap-4 h-3/4">
                   <div className="w-2/3 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] flex items-center justify-center relative overflow-hidden">
                      {/* Fake Topology */}
                      <svg className="w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M20 50 Q 50 20 80 50" stroke="currentColor" fill="none" />
                         <circle cx="20" cy="50" r="2" fill="currentColor" />
                         <circle cx="80" cy="50" r="2" fill="currentColor" />
                      </svg>
                   </div>
                   <div className="w-1/3 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] flex flex-col gap-2 p-3">
                      <div className="h-4 w-1/2 bg-[var(--border-strong)] rounded"></div>
                      <div className="h-20 w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded mt-auto"></div>
                   </div>
                 </div>
              </div>
            </div>
            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/10 blur-[100px] pointer-events-none z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* 2. Industry Problems */}
      <section className="py-24 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-muted)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">The $50B Problem</h2>
            <p className="text-body text-lg max-w-2xl mx-auto">Unplanned downtime costs the industrial sector billions annually. Traditional monitoring is no longer sufficient.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="enterprise-card p-6">
              <AlertTriangle className="w-6 h-6 text-accent-red mb-4" />
              <h3 className="font-semibold mb-2">Reactive Maintenance</h3>
              <p className="text-small">Fixing assets only after they break leads to catastrophic cascading failures and hazardous conditions.</p>
            </div>
            <div className="enterprise-card p-6">
              <Factory className="w-6 h-6 text-accent-amber mb-4" />
              <h3 className="font-semibold mb-2">Information Silos</h3>
              <p className="text-small">Operational manuals are disconnected from live telemetry data, forcing engineers to guess.</p>
            </div>
            <div className="enterprise-card p-6">
              <BarChart className="w-6 h-6 text-primary-500 mb-4" />
              <h3 className="font-semibold mb-2">Alarm Fatigue</h3>
              <p className="text-small">Thousands of trivial SCADA alarms bury the single critical warning that precedes a failure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Existing Systems Fail */}
      <section className="py-24 px-6 bg-[var(--bg-base)] border-b border-[var(--border-muted)]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="heading-lg mb-6">Why existing systems fail</h2>
              <p className="text-body mb-6">
                Most industrial software was built for data logging, not decision making. They show you a dashboard of raw metrics and leave the root cause analysis up to you.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded bg-accent-red/10 text-accent-red mt-0.5"><Lock className="w-3 h-3" /></span>
                  <span className="text-small">Data is locked in proprietary OEM formats.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded bg-accent-red/10 text-accent-red mt-0.5"><Lock className="w-3 h-3" /></span>
                  <span className="text-small">Lack of contextual intelligence between systems.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="p-1 rounded bg-accent-red/10 text-accent-red mt-0.5"><Lock className="w-3 h-3" /></span>
                  <span className="text-small">Manual root cause analysis takes hours.</span>
                </li>
              </ul>
            </div>
            <div className="relative h-64 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg flex items-center justify-center shadow-inner">
              <div className="text-[var(--text-muted)] text-sm font-mono text-center">
                <p>{"{"}</p>
                <p className="pl-4">"error": "Context undefined",</p>
                <p className="pl-4">"status": "System fragmented"</p>
                <p>{"}"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How APEX Works & 5. Workflow */}
      <section className="py-24 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-muted)]">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="heading-lg mb-16">How APEX Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-[var(--border-strong)]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-base)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center mb-6">
                <Database className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold mb-2">1. Ingest</h3>
              <p className="text-small max-w-[250px]">Consume SCADA telemetry, maintenance logs, and 1000-page OEM manuals.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-base)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center mb-6">
                <Network className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold mb-2">2. Map</h3>
              <p className="text-small max-w-[250px]">Construct a live Knowledge Graph topology of all physical and logical assets.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-base)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center mb-6">
                <BrainCircuit className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold mb-2">3. Decide</h3>
              <p className="text-small max-w-[250px]">Deploy AI Copilots to simulate failures and generate executable recovery runbooks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules (6, 7, 8, 9) */}
      <section className="py-24 px-6 bg-[var(--bg-base)] border-b border-[var(--border-muted)]">
        <div className="container mx-auto max-w-5xl space-y-32">
          
          {/* Knowledge Graph */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex p-2 rounded bg-primary-500/10 mb-4">
                <Network className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="heading-lg mb-4">Knowledge Graph Topology</h2>
              <p className="text-body mb-6">Instantly map industrial dependencies. When an asset fails, see the exact blast radius and downstream effects in real-time.</p>
            </div>
            <div className="aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm flex items-center justify-center p-6 relative overflow-hidden group">
               <div className="w-full h-full border border-[var(--border-muted)] rounded flex items-center justify-center relative bg-[var(--bg-base)]">
                 <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                   {/* Background Grid */}
                   <g opacity="0.1">
                     {Array.from({length: 20}).map((_, i) => <line key={`v${i}`} x1={i*20} y1="0" x2={i*20} y2="200" stroke="currentColor" strokeWidth="0.5" />)}
                     {Array.from({length: 10}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*20} x2="400" y2={i*20} stroke="currentColor" strokeWidth="0.5" />)}
                   </g>
                   {/* Edges */}
                   <motion.path d="M100 100 Q 150 50 200 80 T 300 120" stroke="var(--border-strong)" strokeWidth="2" fill="none" />
                   <motion.path d="M100 100 Q 150 150 250 160 T 300 120" stroke="var(--border-strong)" strokeWidth="2" fill="none" />
                   <motion.path d="M200 80 Q 220 120 250 160" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                   {/* Active Data Flow (Pulsing) */}
                   <motion.path 
                     d="M100 100 Q 150 50 200 80 T 300 120" 
                     stroke="#3b82f6" 
                     strokeWidth="2" 
                     fill="none" 
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   />
                   {/* Nodes */}
                   <circle cx="100" cy="100" r="6" fill="#3b82f6" />
                   <text x="100" y="120" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Sensor-A4</text>
                   
                   <circle cx="200" cy="80" r="8" fill="#f59e0b" className="animate-pulse" />
                   <text x="200" y="60" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">PLC-X12</text>
                   
                   <circle cx="250" cy="160" r="6" fill="currentColor" opacity="0.5" />
                   <text x="250" y="180" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Valv-09</text>
                   
                   <circle cx="300" cy="120" r="10" fill="#ef4444" />
                   <circle cx="300" cy="120" r="14" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" style={{ transformOrigin: '300px 120px' }} />
                   <text x="300" y="145" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Turbine-4 (FAIL)</text>
                 </svg>
               </div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm p-4 relative overflow-hidden group">
               <div className="w-full h-full border border-[var(--border-strong)] rounded bg-[var(--bg-base)] shadow-inner flex flex-col font-mono text-[10px] overflow-hidden">
                 {/* Fake Terminal Header */}
                 <div className="w-full px-3 py-2 border-b border-[var(--border-strong)] flex items-center gap-2 bg-[var(--bg-surface)]">
                    <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-red" /><div className="w-2 h-2 rounded-full bg-accent-amber" /><div className="w-2 h-2 rounded-full bg-accent-emerald" /></div>
                    <span className="text-[var(--text-muted)] ml-2">apex-copilot-sh</span>
                 </div>
                 {/* Terminal Content */}
                 <div className="p-4 flex flex-col gap-3 text-[var(--text-secondary)]">
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500">{">"}</span>
                      <motion.p initial={{ width: 0 }} animate={{ width: "100%" }} className="overflow-hidden whitespace-nowrap">Analyze failure in Turbine-4</motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                      <p className="text-[var(--text-muted)]">Searching OEM manuals...</p>
                      <p className="text-[var(--text-muted)]">Correlating telemetry data (PLC-X12 overheat)...</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="mt-2 p-3 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
                      <p className="font-bold mb-1">Recommended Runbook: RB-1042</p>
                      <p>1. Isolate intake valve Valv-09.</p>
                      <p>2. Vent pressure via secondary loop.</p>
                      <p>3. Restart PLC-X12 logic controller.</p>
                    </motion.div>
                 </div>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex p-2 rounded bg-accent-emerald/10 mb-4">
                <BrainCircuit className="w-5 h-5 text-accent-emerald" />
              </div>
              <h2 className="heading-lg mb-4">Expert AI Copilot</h2>
              <p className="text-body mb-6">Ask questions about complex OEM manuals. The AI instantly retrieves citations, generates executable runbooks, and synthesizes mitigation steps.</p>
            </div>
          </div>

          {/* Maintenance Intelligence */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex p-2 rounded bg-accent-amber/10 mb-4">
                <Activity className="w-5 h-5 text-accent-amber" />
              </div>
              <h2 className="heading-lg mb-4">Maintenance Intelligence</h2>
              <p className="text-body mb-6">Run thousands of Monte Carlo shadow simulations to predict remaining useful life and forecast catastrophic failures before they cascade.</p>
            </div>
            <div className="aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm flex items-center justify-center p-6 relative overflow-hidden group">
               <div className="w-full h-full bg-[var(--bg-base)] border border-[var(--border-muted)] rounded p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid */}
                    <g opacity="0.1">
                      {Array.from({length: 8}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*25} x2="400" y2={i*25} stroke="currentColor" strokeWidth="0.5" />)}
                      {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="200" stroke="currentColor" strokeWidth="0.5" />)}
                    </g>
                    {/* Confidence Interval Fill */}
                    <path d="M0 150 Q 100 140 200 120 T 400 40 L 400 200 L 0 200 Z" fill="url(#grad)" opacity="0.2" />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    {/* Trend Lines */}
                    <motion.path 
                      d="M0 150 Q 100 140 200 120 T 400 40" 
                      stroke="#ef4444" strokeWidth="2" fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M0 160 Q 100 150 200 140 T 400 100" 
                      stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    
                    {/* Markers */}
                    <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
                    <text x="195" y="15" fill="currentColor" fontSize="10" fontFamily="monospace" textAnchor="end" opacity="0.6">TODAY</text>
                    
                    <line x1="320" y1="0" x2="320" y2="200" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                    <text x="325" y="15" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="start" opacity="0.9">FAILURE (EST. 14 DAYS)</text>
                  </svg>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* 11 & 12. Architecture & Tech Stack */}
      <section className="py-24 px-6 bg-[var(--bg-surface)] border-b border-[var(--border-muted)]">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="heading-lg mb-16">Enterprise Architecture</h2>
          <div className="grid md:grid-cols-4 gap-4 text-left">
            <div className="enterprise-card p-5">
              <Server className="w-5 h-5 text-[var(--text-secondary)] mb-3" />
              <h4 className="font-semibold mb-1 text-sm">Edge Nodes</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Local execution environments.</p>
            </div>
            <div className="enterprise-card p-5">
              <Layers className="w-5 h-5 text-[var(--text-secondary)] mb-3" />
              <h4 className="font-semibold mb-1 text-sm">Data Lake</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Unified storage layer.</p>
            </div>
            <div className="enterprise-card p-5">
              <Cpu className="w-5 h-5 text-[var(--text-secondary)] mb-3" />
              <h4 className="font-semibold mb-1 text-sm">Inference Engine</h4>
              <p className="text-[11px] text-[var(--text-muted)]">NVIDIA NIM / LLM hosting.</p>
            </div>
            <div className="enterprise-card p-5">
              <TerminalSquare className="w-5 h-5 text-[var(--text-secondary)] mb-3" />
              <h4 className="font-semibold mb-1 text-sm">Command API</h4>
              <p className="text-[11px] text-[var(--text-muted)]">GraphQL & REST endpoints.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Call To Action */}
      <section className="py-24 px-6 bg-primary-600 border-b border-primary-700 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-display font-semibold text-white mb-6">Ready to secure your operations?</h2>
          <p className="text-primary-100 text-lg mb-10">Join the industrial leaders who rely on APEX for decision intelligence.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/login')} className="px-8 py-3 rounded-md bg-white text-primary-600 font-semibold transition-colors hover:bg-gray-50">
              Start Free Trial
            </button>
            <button className="px-8 py-3 rounded-md bg-transparent border border-primary-400 text-white font-semibold transition-colors hover:bg-primary-500">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 14. Enterprise Footer */}
      <footer className="bg-[var(--bg-base)] pt-20 pb-10 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Hexagon className="w-5 h-5 text-primary-500" />
                <span className="font-display font-semibold text-lg tracking-tight">APEX</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">
                The Decision Intelligence Platform for Industry. Designed for mission-critical infrastructure.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:text-primary-500 transition-colors text-[var(--text-secondary)]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:text-primary-500 transition-colors text-[var(--text-secondary)]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Knowledge Graph</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">AI Copilot</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Simulation</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Security</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Documentation</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">API Reference</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Blog</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Case Studies</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="hover:text-[var(--text-primary)] cursor-pointer">About</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Careers</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Contact</li>
                <li className="hover:text-[var(--text-primary)] cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[var(--border-muted)] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-6">
              <p>© {new Date().getFullYear()} APEX Enterprise. All rights reserved.</p>
              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                <span className="font-medium text-[var(--text-secondary)]">All systems operational</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)] font-mono text-[10px] text-[var(--text-secondary)]">SOC2 Type II</span>
              <span className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-strong)] font-mono text-[10px] text-[var(--text-secondary)]">99.99% Uptime SLA</span>
            </div>
            
            <div className="flex gap-6">
              <span className="hover:text-[var(--text-primary)] cursor-pointer">Terms of Service</span>
              <span className="hover:text-[var(--text-primary)] cursor-pointer">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
