import React from 'react';
import { Bell, CheckCircle2, User, Search, Slash } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { globalQuery, setGlobalQuery, setActiveTab } = useApexStore();
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[var(--bg-base)] border-b border-[var(--border-muted)] h-16">
      
      {/* Breadcrumbs & Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="hidden lg:flex items-center text-sm font-medium text-[var(--text-muted)]">
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Texas Refinery</span>
          <Slash className="w-4 h-4 mx-1 opacity-50" />
          <span className="text-[var(--text-primary)] capitalize">{path}</span>
        </div>

        <div className="relative flex items-center w-full max-w-md group">
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setActiveTab('documents');
            }}
            placeholder="Search assets, documents, incidents... (⌘K)"
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm rounded-md border border-[var(--border-strong)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-medium text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>Connected</span>
        </div>

        <button className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        <ThemeSwitcher />

        <div className="flex items-center gap-2 pl-4 border-l border-[var(--border-muted)] cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded bg-primary-600 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
