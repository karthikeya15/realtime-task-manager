'use client';
import Link from 'next/link';
import { Users, CheckSquare, ArrowRight } from 'lucide-react';
import { formatRelative } from '../../lib/utils';
import { AvatarGroup } from '../../components/ui/Avatar';
import type { Project } from '../../types';

export function ProjectCard({ project }: { project: Project }) {
  const id = project._id || project.id;

  return (
    <Link href={`/projects/${id}`} className="group block">
      <div className="bg-ink-soft border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
        {/* Color strip + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-display font-bold"
            style={{ backgroundColor: project.color }}>
            {project.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Updated {formatRelative(project.updatedAt)}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {project.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>{project.members?.length ?? 0} members</span>
          </div>
          <AvatarGroup
            users={project.members?.map((m) => ({ name: m.user?.name || '?', avatar: m.user?.avatar })) ?? []}
            max={4}
          />
        </div>
      </div>
    </Link>
  );
}
