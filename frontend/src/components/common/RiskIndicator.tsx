import React from 'react';

interface RiskIndicatorProps {
  score: number; // 0 to 100
  level?: 'Low' | 'Medium' | 'High' | 'Critical';
  showBar?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ score, level, showBar = true }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  let color = 'from-emerald-500 to-teal-400 text-emerald-400';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let calculatedLevel = level || 'Low';

  if (normalizedScore >= 75) {
    color = 'from-red-600 to-rose-500 text-red-400';
    badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
    calculatedLevel = level || 'Critical';
  } else if (normalizedScore >= 50) {
    color = 'from-amber-500 to-orange-400 text-amber-400';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    calculatedLevel = level || 'High';
  } else if (normalizedScore >= 25) {
    color = 'from-yellow-500 to-amber-300 text-yellow-400';
    badgeColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    calculatedLevel = level || 'Medium';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-400">Risk Severity Score</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
            {calculatedLevel}
          </span>
          <span className="text-sm font-extrabold text-white">{normalizedScore}%</span>
        </div>
      </div>
      {showBar && (
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      )}
    </div>
  );
};
