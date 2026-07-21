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
            <div className="aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm flex items-center justify-center p-8">
               <div className="w-full h-full border border-[var(--border-muted)] rounded flex items-center justify-center relative">
                 {/* Abstract graph */}
                 <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary-500 rounded-full" />
                 <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-accent-amber rounded-full" />
                 <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-accent-red rounded-full" />
                 <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                   <line x1="25%" y1="25%" x2="75%" y2="50%" stroke="var(--border-strong)" strokeWidth="2" />
                   <line x1="75%" y1="50%" x2="50%" y2="75%" stroke="var(--border-strong)" strokeWidth="2" />
                 </svg>
               </div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm flex items-center justify-center p-8">
               <div className="w-full h-full border border-[var(--border-muted)] rounded bg-[var(--bg-base)] p-4 flex flex-col gap-2">
                 <div className="w-3/4 h-4 bg-[var(--bg-surface)] rounded" />
                 <div className="w-1/2 h-4 bg-[var(--bg-surface)] rounded" />
                 <div className="mt-auto self-end w-2/3 h-10 bg-primary-500/10 border border-primary-500/20 rounded-md" />
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
            <div className="aspect-video bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-sm flex items-end p-8 gap-2">
               <div className="flex-1 bg-[var(--border-strong)] rounded-t h-1/4" />
               <div className="flex-1 bg-[var(--border-strong)] rounded-t h-2/4" />
               <div className="flex-1 bg-accent-amber rounded-t h-3/4" />
               <div className="flex-1 bg-accent-red rounded-t h-full" />
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
                {/* Social placeholders */}
                <div className="w-6 h-6 bg-[var(--border-strong)] rounded-full" />
                <div className="w-6 h-6 bg-[var(--border-strong)] rounded-full" />
                <div className="w-6 h-6 bg-[var(--border-strong)] rounded-full" />
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
          
          <div className="pt-8 border-t border-[var(--border-muted)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>© {new Date().getFullYear()} APEX Enterprise. All rights reserved.</p>
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
