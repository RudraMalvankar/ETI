import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Network, Activity, BrainCircuit } from 'lucide-react';

const features = [
  {
    icon: Network,
    title: 'Knowledge Graph Topology',
    description: 'Instantly visualize blast radius and cascading failure paths across your entire industrial network.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10'
  },
  {
    icon: Activity,
    title: 'Shadow Simulation',
    description: 'Run thousands of Monte Carlo simulations to predict the true impact of equipment anomalies.',
    color: 'text-accent-emerald',
    bg: 'bg-accent-emerald/10'
  },
  {
    icon: BrainCircuit,
    title: 'Executable Runbooks',
    description: 'AI-generated step-by-step mitigation workflows extracted from your OEM manuals and historical data.',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10'
  },
  {
    icon: ShieldCheck,
    title: 'Automated Compliance',
    description: 'Export audit-ready safety reports (OISD/PESO) with a single click, signed off from runbook logs.',
    color: 'text-accent-red',
    bg: 'bg-accent-red/10'
  }
];

export const FeatureSection: React.FC = () => {
  return (
    <div className="py-24 bg-[var(--bg-primary)] border-t border-[var(--glass-border)] relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Industrial intelligence, <br/>
            <span className="text-[var(--text-secondary)]">built for the field.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Everything you need to predict, mitigate, and resolve equipment failures before they cause critical downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel p-8 hover:bg-[var(--glass-border)] transition-colors duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
