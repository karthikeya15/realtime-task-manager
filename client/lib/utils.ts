import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import type { TaskPriority, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getAvatarUrl(name: string): string {
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6d28d9`;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; dot: string }> = {
  backlog:     { label: 'Backlog',     color: 'text-slate-400', bg: 'bg-slate-800',    dot: 'bg-slate-400' },
  todo:        { label: 'To Do',       color: 'text-sky-400',   bg: 'bg-sky-900/40',   dot: 'bg-sky-400' },
  in_progress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-900/40', dot: 'bg-amber-400' },
  in_review:   { label: 'In Review',   color: 'text-violet-400',bg: 'bg-violet-900/40',dot: 'bg-violet-400' },
  done:        { label: 'Done',        color: 'text-emerald-400',bg: 'bg-emerald-900/40',dot: 'bg-emerald-400' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low:    { label: 'Low',    color: 'text-slate-400',   icon: '↓' },
  medium: { label: 'Medium', color: 'text-amber-400',   icon: '→' },
  high:   { label: 'High',   color: 'text-orange-400',  icon: '↑' },
  urgent: { label: 'Urgent', color: 'text-rose-400',    icon: '⚡' },
};

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];
