import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  changePercentage?: number;
  changePeriod?: string;
  tone?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  sparklineData?: number[];
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  changePercentage,
  changePeriod = 'vs last week',
  sparklineData = [35, 45, 30, 60, 75, 50, 80],
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`prem-card p-5 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-border-hover hover:-translate-y-0.5' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider">{title}</span>
          <div className="p-1.5 rounded-lg bg-surface-card-hover border border-border-subtle text-txt-secondary">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-txt-primary tracking-tight font-sans">{value}</div>
        {subtitle && <div className="text-[11px] text-txt-muted mt-0.5">{subtitle}</div>}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
        {changePercentage !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs">
            {changePercentage >= 0 ? (
              <span className="flex items-center gap-0.5 text-accent font-semibold text-[11px]">
                <TrendingUp className="w-3 h-3" /> +{changePercentage}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-status-danger font-semibold text-[11px]">
                <TrendingDown className="w-3 h-3" /> {changePercentage}%
              </span>
            )}
            <span className="text-[10px] text-txt-muted">{changePeriod}</span>
          </div>
        ) : (
          <span className="text-[10px] text-txt-muted">Operational metric</span>
        )}

        {/* Mini Sparkline indicator */}
        <div className="sparkline-container">
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              className="sparkline-bar"
              style={{
                height: `${Math.max(4, Math.min(16, (val / 100) * 16))}px`,
                opacity: idx === sparklineData.length - 1 ? 1 : 0.4 + idx * 0.08,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
