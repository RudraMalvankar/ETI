import React from 'react';
import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl glass-panel relative overflow-hidden group ${className}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[var(--glass-border)] gap-2">
        <div>
          <h2 className="heading-2 text-lg md:text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="subtitle mt-1 text-[11px] uppercase tracking-wider">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </motion.div>
  );
};
