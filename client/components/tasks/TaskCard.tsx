'use client';
import { Calendar, MessageCircle, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { cn, formatDate } from '../../lib/utils';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { AvatarGroup } from '../../components/ui/Avatar';
import { useUIStore } from '../../store/uiStore';
import { useDeleteTask } from '../../hooks/useTasks';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  projectId: string;
  compact?: boolean;
}

export function TaskCard({ task, projectId, compact }: TaskCardProps) {
  const { setSelectedTask } = useUIStore();
  const { mutate: deleteTask } = useDeleteTask(projectId);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = () => setSelectedTask(task);

  return (
    <div
      onClick={handleClick}
      className="group bg-ink-soft border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 hover:bg-ink-soft/90 transition-all duration-150 hover:shadow-card-hover relative"
    >
      {/* Three-dot menu */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
      >
        <button className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-ink-muted">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-6 z-20 w-40 bg-ink-soft border border-slate-700 rounded-xl shadow-modal py-1 animate-slide-up">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-ink-muted hover:text-slate-100 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setMenuOpen(false); }}
            >
              <Edit3 className="h-3.5 w-3.5" /> Open
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); deleteTask(task._id); setMenuOpen(false); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-200 leading-snug mb-2 pr-6 line-clamp-2">
        {task.title}
      </p>

      {!compact && task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <AvatarGroup users={task.assignees} max={3} />
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-ink-muted text-slate-500 rounded text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
