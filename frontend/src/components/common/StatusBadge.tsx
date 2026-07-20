import React from 'react';

type StatusType = 'nominal' | 'active' | 'completed' | 'failed' | 'pending' | 'in_progress' | 'warning' | 'critical' | 'resolved' | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const safeStatus = status || 'unknown';
  const s = String(safeStatus).toLowerCase();
  
  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (['nominal', 'completed', 'resolved', 'indexed', 'ready', 'passed'].includes(s)) {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (['active', 'in_progress', 'processing', 'running'].includes(s)) {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dotColor = 'bg-blue-400 animate-pulse';
  } else if (['warning', 'pending', 'medium'].includes(s)) {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (['critical', 'failed', 'error', 'high'].includes(s)) {
    styles = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotColor = 'bg-red-400';
  }

  const displayText = label || String(safeStatus).replace('_', ' ');

  const py = size === 'sm' ? 'py-0.5 px-2 text-[10px]' : 'py-1 px-2.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${styles} ${py} capitalize tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {displayText}
    </span>
  );
};
