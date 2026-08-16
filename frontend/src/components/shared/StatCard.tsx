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
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  changePercentage,
  changePeriod = 'vs last week',
  tone = 'emerald',
  onClick,
}) => {
  const toneBg = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-600 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border ${toneBg[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
      {changePercentage !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          {changePercentage >= 0 ? (
            <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +{changePercentage}%
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" /> {changePercentage}%
            </span>
          )}
          <span className="text-slate-500">{changePeriod}</span>
        </div>
      )}
    </div>
  );
};
