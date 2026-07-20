import React from 'react';
import { Clock } from 'lucide-react';

export interface TimelineItem {
  time: string;
  event: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, title = 'Audit Event Timeline' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          {title}
        </h4>
      )}
      <div className="relative pl-4 border-l-2 border-slate-800 space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-blue-400 group-hover:scale-125 transition-transform" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-semibold text-white">{item.event}</span>
              <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
