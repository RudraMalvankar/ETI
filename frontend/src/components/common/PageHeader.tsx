import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, actions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[var(--glass-border)] gap-4"
    >
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="p-2 rounded bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="heading-1">{title}</h1>
          <p className="subtitle mt-1">{description}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
};
