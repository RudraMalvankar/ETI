import React from 'react';
import { Bell, ShieldAlert, User, Search } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const Navbar: React.FC = () => {
  const { globalQuery, setGlobalQuery, setActiveTab } = useApexStore();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 glass-panel rounded-none border-t-0 border-l-0 border-r-0 backdrop-blur-2xl bg-[var(--glass-bg)]">
      {/* Search Bar */}
      <div className="relative flex items-center w-64 md:w-96 group">
        <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
        <input
          type="text"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setActiveTab('documents');
          }}
          placeholder="Global search (documents, assets, incidents)..."
          className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-xs rounded-xl border border-[var(--glass-border)] focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick System Nominal Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-500 font-mono shadow-[0_0_10px_rgba(14,165,233,0.1)]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>APEX Engine Ready</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] transition shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
        </button>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--glass-border)]">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent-purple to-brand-500 text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-bold text-[var(--text-primary)]">Chief Engineer</span>
            <span className="block text-[10px] text-[var(--text-secondary)]">Enterprise Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
