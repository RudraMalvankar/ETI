import React from 'react';

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
    blue: 'from-blue-500/10 to-indigo-500/5 text-blue-400 border-blue-500/20 icon-bg:bg-blue-500/10 text-icon:text-blue-400',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20 icon-bg:bg-emerald-500/10 text-icon:text-emerald-400',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20 icon-bg:bg-amber-500/10 text-icon:text-amber-400',
    purple: 'from-purple-500/10 to-pink-500/5 text-purple-400 border-purple-500/20 icon-bg:bg-purple-500/10 text-icon:text-purple-400',
    red: 'from-red-500/10 to-rose-500/5 text-red-400 border-red-500/20 icon-bg:bg-red-500/10 text-icon:text-red-400',
  };

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-b ${colorMap[accentColor]} backdrop-blur-xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</span>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
            changeType === 'negative' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-800 text-slate-300'
          }`}>
            {change}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-xs text-slate-400">{description}</p>}
    </div>
  );
};
