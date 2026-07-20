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
      className={`p-6 rounded-2xl glass-panel ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[var(--glass-border)] gap-2">
        <div>
          <h2 className="heading-2 text-lg md:text-xl">{title}</h2>
          {subtitle && <p className="subtitle mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </motion.div>
  );
};
