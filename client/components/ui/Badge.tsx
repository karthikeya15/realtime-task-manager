import { cn } from '../../lib/utils';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../lib/utils';
import type { TaskStatus, TaskPriority } from '../../types';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium', cfg.bg, cfg.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', cfg.color)}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      variant === 'default' ? 'bg-ink-muted text-slate-300' : 'border border-slate-700 text-slate-400',
      className
    )}>
      {children}
    </span>
  );
}
