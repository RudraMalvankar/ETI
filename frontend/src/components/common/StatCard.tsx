import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
  sparklineData?: number[];
  isLive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  sparklineData,
  isLive = false,
}) => {
  // Simple SVG sparkline generator
  const generateSparklinePath = (data: number[]) => {
    if (!data || data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100; // SVG viewBox width
    const height = 30; // SVG viewBox height
    const stepX = width / (data.length - 1);

    return data
      .map((val, i) => {
        const x = i * stepX;
        const y = height - ((val - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const sparklineColor =
    changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#3b82f6';
  return (
    <div className="enterprise-card p-5 hover:border-[var(--border-strong)] transition-colors relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)] tracking-tight">
            {title}
          </span>
          {isLive && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"
              title="Live Data"
            />
          )}
        </div>
        <Icon className="w-5 h-5 text-[var(--text-muted)]" />
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                : changeType === 'negative'
                  ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-strong)]'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-8 w-full relative z-10">
          <svg
            viewBox="0 0 100 30"
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            <path
              d={generateSparklinePath(sparklineData)}
              stroke={sparklineColor}
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </svg>
        </div>
      )}

      {description && (
        <p className="mt-3 text-[11px] text-[var(--text-muted)] font-medium tracking-wide relative z-10">
          {description}
        </p>
      )}
    </div>
  );
};
