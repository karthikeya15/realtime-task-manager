'use client';
import { useState } from 'react';
import { Plus, LayoutGrid, List, Users, Settings, Search } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { Header } from '../../../components/layout/Header';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { KanbanBoard } from '../../../components/tasks/KanbanBoard';
import { TaskListView } from '../../../components/tasks/TaskListView';
import { MembersPanel } from '../../../components/projects/MembersPanel';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useProject } from '../../../hooks/useProjects';
import { useInfiniteTasks, useSearchTasks } from '../../../hooks/useTasks';
import { useProjectSocket } from '../../../hooks/useSocket';
import { useUIStore } from '../../../store/uiStore';
import { useDebounce } from '../../../hooks/useDebounce';
import type { TaskStatus, TaskPriority } from '../../../types';

type ViewMode = 'kanban' | 'list';
type PanelTab = 'board' | 'members';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { openModal, searchQuery, setSearchQuery } = useUIStore();

  const [view, setView] = useState<ViewMode>('kanban');
  const [tab, setTab] = useState<PanelTab>('board');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Wire up real-time socket for this project
  useProjectSocket(projectId);

  // Flat task list (for kanban / list view)
  const { data: tasksData, isLoading: loadingTasks } = useInfiniteTasks(projectId, {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const allTasks = tasksData?.pages.flatMap((p) => p.tasks) ?? [];

  // Search results
  const { data: searchResults, isLoading: searching } = useSearchTasks(projectId, debouncedSearch);
  const displayTasks = debouncedSearch.trim().length > 1 ? (searchResults ?? []) : allTasks;

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title={loadingProject ? '' : project?.name}
          subtitle={loadingProject ? '' : `${project?.members?.length ?? 0} members`}
          showSearch
          projectId={projectId}
          actions={
            <Button size="sm" onClick={() => openModal('create-task', { projectId })}>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          }
        />

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 bg-ink-soft/50 shrink-0 flex-wrap">
          {/* Tab toggle */}
          <div className="flex items-center gap-1 bg-ink-muted rounded-lg p-1">
            <button
              onClick={() => setTab('board')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${tab === 'board' ? 'bg-ink-soft text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Board
            </button>
            <button
              onClick={() => setTab('members')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${tab === 'members' ? 'bg-ink-soft text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Users className="h-3 w-3" />
              Members
            </button>
          </div>

          {tab === 'board' && (
            <>
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-ink-muted rounded-lg p-1">
                <button onClick={() => setView('kanban')} className={`p-1.5 rounded transition-colors ${view === 'kanban' ? 'bg-ink-soft text-slate-200' : 'text-slate-500 hover:text-slate-300'}`} title="Kanban">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setView('list')} className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-ink-soft text-slate-200' : 'text-slate-500 hover:text-slate-300'}`} title="List">
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Filters */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                className="h-8 bg-ink-muted border border-slate-700 rounded-lg px-2 pr-7 text-xs text-slate-300 focus:outline-none focus:border-violet-500 appearance-none transition-colors"
              >
                <option value="">All statuses</option>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
                className="h-8 bg-ink-muted border border-slate-700 rounded-lg px-2 pr-7 text-xs text-slate-300 focus:outline-none focus:border-violet-500 appearance-none transition-colors"
              >
                <option value="">All priorities</option>
                <option value="low">↓ Low</option>
                <option value="medium">→ Medium</option>
                <option value="high">↑ High</option>
                <option value="urgent">⚡ Urgent</option>
              </select>

              {debouncedSearch && (
                <span className="text-xs text-slate-500">
                  {searching ? 'Searching…' : `${displayTasks.length} result${displayTasks.length !== 1 ? 's' : ''} for "${debouncedSearch}"`}
                </span>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'members' ? (
            <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto">
              {loadingProject ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : project ? (
                <MembersPanel project={project} />
              ) : null}
            </div>
          ) : view === 'kanban' ? (
            <div className="h-full overflow-auto p-6">
              <KanbanBoard tasks={displayTasks} projectId={projectId} isLoading={loadingTasks} />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              {debouncedSearch.trim().length > 1 ? (
                <div className="max-w-2xl mx-auto space-y-2.5">
                  {searching ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                  ) : (
                    displayTasks.map((task) => (
                      <div key={task._id} className="bg-ink-soft border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition-colors"
                        onClick={() => useUIStore.getState().setSelectedTask(task)}>
                        <p className="text-sm font-medium text-slate-200">{task.title}</p>
                        {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <TaskListView projectId={projectId} filters={{ status: statusFilter || undefined, priority: priorityFilter || undefined }} />
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
