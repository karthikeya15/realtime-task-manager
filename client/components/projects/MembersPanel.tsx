'use client';
import { useState } from 'react';
import { UserPlus, Trash2, Crown } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAddMember, useRemoveMember } from '../../hooks/useProjects';
import { useAuthStore } from '../../store/authStore';
import { formatRelative } from '../../lib/utils';
import type { Project } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  owner: 'text-amber-400',
  admin: 'text-violet-400',
  member: 'text-slate-400',
  viewer: 'text-slate-500',
};

export function MembersPanel({ project }: { project: Project }) {
  const [userId, setUserId] = useState('');
  const { user } = useAuthStore();
  const id = project._id || project.id;
  const { mutate: addMember, isPending: adding } = useAddMember(id);
  const { mutate: removeMember } = useRemoveMember(id);

  const isOwnerOrAdmin = project.owner?.id === user?.id ||
    project.members?.find((m) => m.user?.id === user?.id)?.role === 'admin';

  const handleAdd = () => {
    if (!userId.trim()) return;
    addMember({ userId: userId.trim(), role: 'member' }, { onSuccess: () => setUserId('') });
  };

  return (
    <div className="space-y-4">
      {isOwnerOrAdmin && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste user ID to add…"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd} loading={adding} disabled={!userId.trim()}>
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {project.members?.map((member) => (
          <div key={member.user?.id || Math.random()} className="flex items-center gap-3 p-3 rounded-xl bg-ink-muted/50 hover:bg-ink-muted transition-colors">
            <Avatar name={member.user?.name || '?'} src={member.user?.avatar} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200 truncate">{member.user?.name}</span>
                {member.role === 'owner' && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium capitalize ${ROLE_COLORS[member.role]}`}>{member.role}</span>
              {isOwnerOrAdmin && member.role !== 'owner' && member.user?.id !== user?.id && (
                <button
                  onClick={() => removeMember(member.user?.id!)}
                  className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
