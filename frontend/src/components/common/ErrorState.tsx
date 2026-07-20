import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Unavailable',
  message = 'An unexpected error occurred while communicating with backend APIs.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-red-950/20 border border-red-500/20 backdrop-blur-md">
      <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-400 mb-3 border border-red-500/20">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-red-200 mb-1">{title}</h3>
      <p className="text-xs text-red-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
