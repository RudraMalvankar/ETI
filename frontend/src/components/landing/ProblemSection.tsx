import React from 'react';
import { motion } from 'framer-motion';
import { Factory, AlertTriangle, TrendingDown } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <div className="py-24 bg-[var(--bg-secondary)] relative overflow-hidden border-b border-[var(--glass-border)]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red font-bold text-xs mb-6 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" /> The Industry Problem
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Unplanned downtime costs the industrial sector <span className="text-accent-red">$50B annually.</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
              Static PDF manuals, siloed SCADA systems, and tribal knowledge are no longer sufficient. When a critical pump fails, engineers spend hours diagnosing root causes and tracing blast radiuses across hundreds of connected components.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel bg-[var(--bg-primary)]">
                <div className="p-3 rounded-xl bg-accent-amber/10 text-accent-amber">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Reactive Maintenance</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Fixing assets only after they break leads to catastrophic cascading failures and safety hazards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel bg-[var(--bg-primary)]">
                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Information Silos</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Operational manuals are disconnected from live telemetry data, forcing engineers to guess.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Abstract Industrial Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[500px] rounded-3xl glass-panel overflow-hidden border border-[var(--glass-border)] shadow-2xl"
          >
            <div className="absolute inset-0 premium-grid-bg opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
              {/* Mock Dashboard Wireframe showing chaos */}
              <div className="w-[80%] h-[80%] border border-accent-red/20 rounded-2xl bg-accent-red/5 p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/20 blur-[40px] rounded-full" />
                <div className="w-1/2 h-8 bg-accent-red/20 rounded-lg mb-4 animate-pulse" />
                <div className="w-3/4 h-4 bg-[var(--glass-border)] rounded-full mb-2" />
                <div className="w-full h-4 bg-[var(--glass-border)] rounded-full mb-2" />
                <div className="w-5/6 h-4 bg-[var(--glass-border)] rounded-full mb-8" />
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-accent-red/10 rounded-xl border border-accent-red/20 animate-pulse" />
                   <div className="h-24 bg-accent-amber/10 rounded-xl border border-accent-amber/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
