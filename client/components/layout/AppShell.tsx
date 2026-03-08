'use client';
import { Sidebar } from './Sidebar';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal';
import { TaskDetailDrawer } from '../../components/tasks/TaskDetailDrawer';
import { useUIStore } from '../../store/uiStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { activeModal } = useUIStore();

  return (
    <div className="flex h-screen bg-ink overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Global Modals */}
      {activeModal === 'create-project' && <CreateProjectModal />}
      {activeModal === 'create-task' && <CreateTaskModal />}
      <TaskDetailDrawer />
    </div>
  );
}
