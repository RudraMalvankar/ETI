import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red'; // Kept for API compatibility, though less used now
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description
}) => {
  return (
    <div className="enterprise-card p-5 hover:border-[var(--border-strong)] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--text-secondary)] tracking-tight">{title}</span>
        <Icon className="w-5 h-5 text-[var(--text-muted)]" />
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            changeType === 'positive' ? 'bg-accent-emerald/10 text-accent-emerald' :
            changeType === 'negative' ? 'bg-accent-red/10 text-accent-red' :
            'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-strong)]'
          }`}>
            {change}
          </span>
        )}
      </div>
      {description && <p className="mt-3 text-xs text-[var(--text-muted)]">{description}</p>}
    </div>
  );
};
