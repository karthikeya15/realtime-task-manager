'use client';
import { Plus, FolderKanban, Users, CheckCircle2, Clock } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Header } from '../../components/layout/Header';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectCardSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { useProjects } from '../../hooks/useProjects';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects, isLoading } = useProjects();
  const { openModal } = useUIStore();

  const totalMembers = projects?.reduce((sum, p) => sum + (p.members?.length ?? 0), 0) ?? 0;

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title={`Good day, ${user?.name?.split(' ')[0]} 👋`}
          subtitle="Here's what's happening across your projects"
          actions={
            <Button size="sm" onClick={() => openModal('create-project')}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <FolderKanban className="h-5 w-5" />, label: 'Projects', value: projects?.length ?? 0, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { icon: <Users className="h-5 w-5" />, label: 'Collaborators', value: totalMembers, color: 'text-sky-400', bg: 'bg-sky-500/10' },
              { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Active', value: projects?.filter((p) => !p.isArchived).length ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: <Clock className="h-5 w-5" />, label: 'Archived', value: projects?.filter((p) => p.isArchived).length ?? 0, color: 'text-slate-400', bg: 'bg-slate-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-soft border border-slate-800 rounded-2xl p-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-display font-bold text-slate-100">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Projects grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Projects</h2>
              <Button variant="ghost" size="sm" onClick={() => openModal('create-project')}>
                <Plus className="h-3.5 w-3.5" />
                Add project
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
              </div>
            ) : projects?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-3xl bg-ink-muted flex items-center justify-center mb-5">
                  <FolderKanban className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-display font-semibold text-slate-300 mb-2">No projects yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">Create your first project to start collaborating with your team in real time.</p>
                <Button onClick={() => openModal('create-project')}>
                  <Plus className="h-4 w-4" />
                  Create first project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects?.map((project) => (
                  <ProjectCard key={project._id || project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
