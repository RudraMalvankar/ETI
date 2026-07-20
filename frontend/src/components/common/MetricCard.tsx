import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'error';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, badge, badgeType = 'info' }) => {
  const badgeStyles = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-500">{subtext}</div>}
    </div>
  );
};
