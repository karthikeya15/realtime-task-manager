'use client';
import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import { STATUS_CONFIG } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';
import { useUpdateTask } from '../../hooks/useTasks';
import type { Task, TaskStatus } from '../../types';

const COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  isLoading?: boolean;
}

export function KanbanBoard({ tasks, projectId, isLoading }: KanbanBoardProps) {
  const { openModal } = useUIStore();
  const { mutate: updateTask } = useUpdateTask(projectId);

  const columns = useMemo(() => {
    return COLUMNS.map((status) => ({
      status,
      config: STATUS_CONFIG[status],
      tasks: tasks.filter((t) => t.status === status),
    }));
  }, [tasks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromStatus = e.dataTransfer.getData('fromStatus') as TaskStatus;
    if (taskId && fromStatus !== targetStatus) {
      updateTask({ taskId, data: { status: targetStatus } });
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {columns.map(({ status, config, tasks: colTasks }) => (
        <div
          key={status}
          className="flex flex-col w-72 shrink-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                {config.label}
              </span>
              <span className="text-xs text-slate-600 bg-ink-muted px-1.5 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            <button
              onClick={() => openModal('create-task', { projectId, status })}
              className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-ink-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2.5 flex-1 min-h-[200px] rounded-xl bg-ink-soft/30 p-2">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
            ) : (
              colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task._id);
                    e.dataTransfer.setData('fromStatus', task.status);
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} projectId={projectId} />
                </div>
              ))
            )}
            {!isLoading && colTasks.length === 0 && (
              <div
                className="flex items-center justify-center h-24 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                onClick={() => openModal('create-task', { projectId, status })}
              >
                <span className="text-xs text-slate-600">Drop here or click to add</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
