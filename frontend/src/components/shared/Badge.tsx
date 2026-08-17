import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false,
}) => {
  const variantStyles = {
    emerald: 'bg-accent-subtle text-accent border-accent-border',
    amber: 'bg-status-warning-subtle text-status-warning border-status-warning/25',
    rose: 'bg-status-danger-subtle text-status-danger border-status-danger/25',
    blue: 'bg-status-info-subtle text-status-info border-status-info/25',
    purple: 'bg-indigo-subtle text-indigo-accent border-indigo-accent/25',
    slate: 'bg-surface-card text-txt-secondary border-border-subtle',
  };

  const dotColors = {
    emerald: 'bg-accent',
    amber: 'bg-status-warning',
    rose: 'bg-status-danger',
    blue: 'bg-status-info',
    purple: 'bg-indigo-accent',
    slate: 'bg-txt-muted',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
