'use client';
import { useRef, useCallback } from 'react';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import { useInfiniteTasks } from '../../hooks/useTasks';
import type { TaskStatus } from '../../types';

interface TaskListViewProps {
  projectId: string;
  filters?: { status?: TaskStatus; assignee?: string; priority?: string };
}

export function TaskListView({ projectId, filters = {} }: TaskListViewProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteTasks(projectId, filters);

  // Infinite scroll sentinel
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      if (node) {
        observer.current = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && hasNextPage) fetchNextPage();
        });
        observer.current.observe(node);
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const allTasks = data?.pages.flatMap((p) => p.tasks) ?? [];

  return (
    <div className="space-y-2.5">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)
        : allTasks.map((task) => (
            <TaskCard key={task._id} task={task} projectId={projectId} />
          ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && allTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-ink-muted flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-slate-400 font-medium">No tasks yet</p>
          <p className="text-slate-600 text-sm mt-1">Create a task to get started</p>
        </div>
      )}
    </div>
  );
}
