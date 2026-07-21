import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Network,
  Activity,
  BrainCircuit,
  BookOpen,
  Database,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'simulation', label: 'Simulation', icon: Activity },
    { id: 'decision', label: 'AI Decisions', icon: BrainCircuit },
    { id: 'runbook', label: 'Runbooks', icon: BookOpen },
    { id: 'memory', label: 'Operational Memory', icon: Database },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'history', label: 'Incident History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex relative flex-col h-screen glass-panel rounded-none border-t-0 border-b-0 border-l-0 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-emerald text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]">
            <Zap className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-accent-purple to-accent-emerald text-transparent bg-clip-text">
                APEX
              </span>
              <span className="block text-[10px] font-mono text-[var(--text-secondary)] tracking-wider mt-0.5">
                INDUSTRIAL AI OS
              </span>
            </motion.div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] transition"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.id) || (item.id === 'dashboard' && location.pathname === '/dashboard');
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.id === 'dashboard' ? '' : item.id}`)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'text-brand-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-brand-500/10 border border-brand-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-500' : 'text-[var(--text-secondary)]'}`} />
              {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[var(--glass-border)]">
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/20 transition-all"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
