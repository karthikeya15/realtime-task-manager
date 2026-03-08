'use client';
import { useState, useCallback } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useUIStore } from '../../store/uiStore';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  projectId?: string;
}

export function Header({ title, subtitle, actions, showSearch, projectId }: HeaderProps) {
  const { user } = useAuthStore();
  const { onlineUsers, searchQuery, setSearchQuery } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-slate-800 bg-ink-soft/80 backdrop-blur-sm shrink-0">
      {/* Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-base font-display font-semibold text-slate-100 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Search */}
      {showSearch && projectId && (
        <div className={`relative transition-all duration-200 ${searchFocused ? 'w-64' : 'w-48'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-8 bg-ink-muted border border-slate-700 rounded-lg pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Presence */}
      {onlineUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {onlineUsers.slice(0, 5).map((u) => (
              <Avatar key={u.id} name={u.name} src={u.avatar} size="xs" online />
            ))}
          </div>
          <span className="text-xs text-slate-500">{onlineUsers.length} online</span>
        </div>
      )}

      {actions}
    </header>
  );
}
