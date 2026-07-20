import React from 'react';
import { Bell, ShieldAlert, User, Search } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const Navbar: React.FC = () => {
  const { globalQuery, setGlobalQuery, setActiveTab } = useApexStore();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
      {/* Search Bar */}
      <div className="relative flex items-center w-64 md:w-96">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setActiveTab('documents');
          }}
          placeholder="Global search (documents, assets, incidents)..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900/80 text-white placeholder-slate-500 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick System Nominal Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>APEX Engine Ready</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-bold text-white">Chief Engineer</span>
            <span className="block text-[10px] text-slate-400">Enterprise Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
