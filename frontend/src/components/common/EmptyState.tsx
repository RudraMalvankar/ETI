import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There are currently no items or records to display.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 backdrop-blur-md">
      <div className="p-4 rounded-2xl bg-slate-800/40 text-slate-400 mb-3 border border-slate-700/50">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
