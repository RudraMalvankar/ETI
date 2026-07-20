import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  accentColor = 'blue'
}) => {
  const colorMap = {
    blue: 'text-brand-500 from-brand-500/10 to-transparent',
    emerald: 'text-accent-emerald from-accent-emerald/10 to-transparent',
    amber: 'text-accent-amber from-accent-amber/10 to-transparent',
    purple: 'text-accent-purple from-accent-purple/10 to-transparent',
    red: 'text-accent-red from-accent-red/10 to-transparent',
  };

  const iconBgMap = {
    blue: 'bg-brand-500/10',
    emerald: 'bg-accent-emerald/10',
    amber: 'bg-accent-amber/10',
    purple: 'bg-accent-purple/10',
    red: 'bg-accent-red/10',
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-5 rounded-2xl glass-panel bg-gradient-to-b ${colorMap[accentColor]} transition-all duration-300 group overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent blur-2xl rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">{title}</span>
          <div className={`p-2.5 rounded-xl ${iconBgMap[accentColor]} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{value}</span>
          {change && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              changeType === 'positive' ? 'bg-accent-emerald/10 text-accent-emerald' :
              changeType === 'negative' ? 'bg-accent-red/10 text-accent-red' :
              'bg-slate-500/10 text-slate-500'
            }`}>
              {change}
            </span>
          )}
        </div>
        {description && <p className="mt-2 text-xs text-[var(--text-secondary)]">{description}</p>}
      </div>
    </motion.div>
  );
};
