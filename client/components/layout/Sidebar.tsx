'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, Plus, Settings,
  ChevronLeft, LogOut, Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useProjects } from '../../hooks/useProjects';
import { useLogout } from '../../hooks/useAuth';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, openModal } = useUIStore();
  const { data: projects } = useProjects();
  const logout = useLogout();

  return (
    <aside className={cn(
      'flex flex-col h-full bg-ink-soft border-r border-slate-800 transition-all duration-300 ease-in-out',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-100 tracking-tight">Synctask</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-ink-muted transition-colors',
            !sidebarOpen && 'mx-auto'
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto scrollbar-thin">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={pathname === '/dashboard'}
          collapsed={!sidebarOpen}
        />

        {/* Projects section */}
        <div className={cn('mt-4 mb-1', sidebarOpen ? 'px-2' : 'px-0')}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Projects</span>
              <button
                onClick={() => openModal('create-project')}
                className="p-1 rounded text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 my-2" />
          )}
        </div>

        {projects?.slice(0, 8).map((project) => (
          <NavItem
            key={project._id || project.id}
            href={`/projects/${project._id || project.id}`}
            icon={
              <span
                className="w-4 h-4 rounded-sm shrink-0"
                style={{ backgroundColor: project.color }}
              />
            }
            label={project.name}
            active={pathname.startsWith(`/projects/${project._id || project.id}`)}
            collapsed={!sidebarOpen}
          />
        ))}

        {!sidebarOpen && (
          <button
            onClick={() => openModal('create-project')}
            className="flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors mx-auto mt-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1 shrink-0">
        <NavItem
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={pathname === '/settings'}
          collapsed={!sidebarOpen}
        />
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ink-muted transition-colors cursor-pointer group" onClick={logout}>
            <Avatar name={user?.name || '?'} src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-slate-600 group-hover:text-rose-400 transition-colors" />
          </div>
        ) : (
          <button onClick={logout} className="flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full">
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active, collapsed }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group',
        active
          ? 'bg-violet-500/15 text-violet-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-ink-muted',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate animate-fade-in">{label}</span>}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r" />}
    </Link>
  );
}
