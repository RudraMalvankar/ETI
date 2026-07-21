import React from 'react';
import { motion } from 'framer-motion';
import { Network, BrainCircuit, Wrench, ShieldCheck } from 'lucide-react';

const products = [
  {
    id: 'graph',
    icon: Network,
    title: 'Knowledge Graph Topology',
    description: 'Instantly map industrial dependencies. When an asset fails, see the exact blast radius and downstream effects in real-time.',
    color: 'brand',
    align: 'left'
  },
  {
    id: 'sim',
    icon: Wrench,
    title: 'Maintenance Intelligence',
    description: 'Run thousands of Monte Carlo shadow simulations to predict remaining useful life and forecast catastrophic failures.',
    color: 'emerald',
    align: 'right'
  },
  {
    id: 'copilot',
    icon: BrainCircuit,
    title: 'Expert AI Copilot',
    description: 'Ask questions about complex OEM manuals. The AI instantly retrieves citations, generates executable runbooks, and synthesizes mitigation steps.',
    color: 'purple',
    align: 'left'
  },
  {
    id: 'compliance',
    icon: ShieldCheck,
    title: 'Automated Compliance',
    description: 'Turn chaos into audit-ready reports. Automatically log every decision, simulation, and technician action into PESO/OSHA compliant PDFs.',
    color: 'amber',
    align: 'right'
  }
];

export const ProductShowcase: React.FC = () => {
  return (
    <div className="py-24 bg-[var(--bg-primary)] relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Industrial AI OS</h2>
           <p className="text-lg text-[var(--text-secondary)] font-medium">A fully integrated suite of decision intelligence modules designed specifically for mission-critical infrastructure.</p>
        </div>

        <div className="space-y-32">
          {products.map((product) => {
            const Icon = product.icon;
            const isLeft = product.align === 'left';
            
            return (
              <div key={product.id} className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>
                <motion.div 
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className="w-full lg:w-1/2 space-y-6"
                >
                  <div className={`inline-flex p-3 rounded-2xl bg-accent-${product.color}/10 bg-brand-500/10`}>
                     <Icon className={`w-8 h-8 text-brand-400`} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{product.title}</h3>
                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
                    {product.description}
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className="w-full lg:w-1/2 relative"
                >
                  <div className="aspect-[4/3] rounded-3xl glass-panel overflow-hidden border border-[var(--glass-border)] shadow-2xl relative bg-[#0B0F17] flex items-center justify-center group">
                    <div className="absolute inset-0 premium-grid-bg opacity-40" />
                    <div className={`absolute w-full h-full bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors duration-500`} />
                    
                    {/* Abstract Representation of the Product */}
                    <div className="relative z-10 w-24 h-24 rounded-full border border-[var(--glass-border)] bg-[var(--bg-secondary)] flex items-center justify-center shadow-2xl">
                       <Icon className="w-10 h-10 text-white opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
