'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const adminNav = [
  { href: '/dashboard/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/leads', icon: 'person_search', label: 'Leads' },
  { href: '/dashboard/agents', icon: 'group', label: 'Agents' },
  { href: '/dashboard/analytics', icon: 'analytics', label: 'Analytics' },
];

const agentNav = [
  { href: '/dashboard/agent', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/leads', icon: 'person_search', label: 'My Leads' },
  { href: '/dashboard/follow-ups', icon: 'notifications_active', label: 'Follow-Ups' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const nav = user?.role === 'Admin' ? adminNav : agentNav;

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/agent') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-navy border-r border-slate-800 shadow-xl z-50 flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-[#6063ee] p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-[20px]">real_estate_agent</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PropCRM</span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">
              {user?.role === 'Admin' ? 'Admin Portal' : 'Agent Portal'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Navigation</span>
          </div>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive(item.href)
                  ? 'bg-white/10 text-white border-l-4 border-indigo-400'
                  : 'text-white/60 hover:text-white hover:bg-white/8 border-l-4 border-transparent'
                }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-colors
                  ${isActive(item.href) ? 'text-indigo-400' : 'group-hover:text-white/90'}`}
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive(item.href) && (
                <span className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            id="logout-btn"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
