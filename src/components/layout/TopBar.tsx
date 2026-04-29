'use client';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBadge } from '@/components/common/NotificationBadge';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-50 rounded-full transition-colors"
          id="mobile-menu-btn"
        >
          <span className="material-symbols-outlined text-slate-400">menu</span>
        </button>
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 outline-none text-sm w-40 md:w-48 text-slate-700 placeholder:text-slate-400"
            placeholder="Quick search..."
            type="text"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Badge */}
        <NotificationBadge />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="hidden md:block text-sm font-medium text-slate-700">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}

