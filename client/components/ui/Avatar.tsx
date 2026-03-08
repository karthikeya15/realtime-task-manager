import { cn, getInitials } from '../../lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
  online?: boolean;
}

const SIZE_MAP = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const COLORS = [
  'bg-violet-700', 'bg-sky-700', 'bg-emerald-700',
  'bg-amber-700', 'bg-rose-700', 'bg-indigo-700',
];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export function Avatar({ name, src, size = 'md', className, online }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover ring-2 ring-ink', SIZE_MAP[size])}
        />
      ) : (
        <div className={cn('rounded-full flex items-center justify-center ring-2 ring-ink font-semibold text-white', SIZE_MAP[size], getColor(name))}>
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-ink-soft" />
      )}
    </div>
  );
}

export function AvatarGroup({ users, max = 3 }: { users: Array<{ name: string; avatar?: string | null }>; max?: number }) {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <Avatar key={i} name={u.name} src={u.avatar} size="sm" />
      ))}
      {extra > 0 && (
        <div className="w-7 h-7 rounded-full bg-slate-700 ring-2 ring-ink flex items-center justify-center text-[10px] text-slate-300 font-semibold">
          +{extra}
        </div>
      )}
    </div>
  );
}
