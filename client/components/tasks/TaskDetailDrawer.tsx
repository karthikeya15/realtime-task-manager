'use client';
import { useState } from 'react';
import { X, Send, Trash2, Calendar, Tag, User2, MessageCircle, Clock } from 'lucide-react';
import { cn, formatDate, formatRelative, STATUS_CONFIG, PRIORITY_CONFIG } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useUpdateTask, useAddComment, useDeleteComment } from '../../hooks/useTasks';

export function TaskDetailDrawer() {
  const { selectedTask, setSelectedTask } = useUIStore();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');

  const projectId = selectedTask?.project as string;
  const { mutate: updateTask } = useUpdateTask(projectId || '');
  const { mutate: addComment, isPending: addingComment } = useAddComment(projectId || '');
  const { mutate: deleteComment } = useDeleteComment(projectId || '');

  if (!selectedTask) return null;

  const handleStatusChange = (status: string) => {
    updateTask({ taskId: selectedTask._id, data: { status: status as any } });
  };

  const handlePriorityChange = (priority: string) => {
    updateTask({ taskId: selectedTask._id, data: { priority: priority as any } });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment(
      { taskId: selectedTask._id, content: comment.trim() },
      { onSuccess: () => setComment('') }
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => setSelectedTask(null)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-[480px] z-50 bg-ink-soft border-l border-slate-800 flex flex-col shadow-modal animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedTask.status} />
            <PriorityBadge priority={selectedTask.priority} />
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-ink-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-100 leading-snug">
                {selectedTask.title}
              </h2>
              {selectedTask.description && (
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{selectedTask.description}</p>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Status"
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
              />
              <Select
                label="Priority"
                value={selectedTask.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                options={Object.entries(PRIORITY_CONFIG).map(([v, c]) => ({ value: v, label: `${c.icon} ${c.label}` }))}
              />
            </div>

            {/* Assignees */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Assignees</p>
              {selectedTask.assignees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignees.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-ink-muted rounded-lg">
                      <Avatar name={u.name} src={u.avatar} size="xs" />
                      <span className="text-xs text-slate-300">{u.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No assignees</p>
              )}
            </div>

            {/* Due date + tags */}
            <div className="flex flex-wrap gap-4">
              {selectedTask.dueDate && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span>{formatDate(selectedTask.dueDate)}</span>
                </div>
              )}
              {selectedTask.tags?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-600" />
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-ink-muted text-slate-400 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Created by */}
            <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
              <Clock className="h-3.5 w-3.5" />
              <span>Created by <strong className="text-slate-400">{selectedTask.createdBy?.name}</strong> {formatRelative(selectedTask.createdAt)}</span>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">
                  {selectedTask.comments?.length ?? 0} Comments
                </p>
              </div>
              <div className="space-y-4">
                {selectedTask.comments?.map((c) => (
                  <div key={c._id} className="flex gap-3 group">
                    <Avatar name={c.author?.name || '?'} src={c.author?.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-300">{c.author?.name}</span>
                        <span className="text-[10px] text-slate-600">{formatRelative(c.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400 leading-relaxed">{c.content}</p>
                    </div>
                    {c.author?.id === user?.id && (
                      <button
                        onClick={() => deleteComment({ taskId: selectedTask._id, commentId: c._id })}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex gap-2">
            <Avatar name={user?.name || '?'} src={user?.avatar} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                placeholder="Add a comment…"
                className="flex-1 h-9 bg-ink-muted border border-slate-700 rounded-lg px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <Button size="sm" onClick={handleAddComment} loading={addingComment} disabled={!comment.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
