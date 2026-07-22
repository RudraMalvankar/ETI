import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Hexagon,
  ChevronsUpDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApexStore } from '../../store/useApexStore';
import { logoutUser } from '../../services/authServices';
import { toast } from 'sonner';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAuthSession } = useApexStore();

  const navGroups = [
    {
      title: 'Platform',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'documents', label: 'Data Sources', icon: FileText },
        { id: 'graph', label: 'Knowledge Graph', icon: Network },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'simulation', label: 'Shadow Simulation', icon: Activity },
        { id: 'decision', label: 'AI Copilot', icon: BrainCircuit },
        { id: 'runbook', label: 'Runbooks', icon: BookOpen },
      ],
    },
    {
      title: 'Audit & Memory',
      items: [
        { id: 'memory', label: 'Op Memory', icon: Database },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
        { id: 'history', label: 'Incidents', icon: History },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuthSession();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to sign out cleanly.');
    }
  };

  return (
    <aside
      className={`hidden md:flex relative flex-col h-screen bg-[var(--bg-surface)] border-r border-[var(--border-muted)] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header & Workspace Switcher */}
      <div className="flex flex-col border-b border-[var(--border-muted)]">
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-600 text-white shadow-sm">
              <Hexagon className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-display font-semibold tracking-tight text-[var(--text-primary)]">
                  APEX
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-4 pb-4">
            <button className="w-full flex items-center justify-between px-3 py-2 text-xs rounded border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
              <span className="font-medium truncate">Texas Refinery Alpha</span>
              <ChevronsUpDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive =
                  location.pathname.includes(item.id) ||
                  (item.id === 'dashboard' && location.pathname === '/dashboard');
                return (
                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => navigate(`/dashboard/${item.id === 'dashboard' ? '' : item.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/50 border border-transparent'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`shrink-0 w-4 h-4 transition-colors ${isActive ? 'text-primary-500' : 'text-[var(--text-muted)] group-hover:text-primary-400'}`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Settings & Logout */}
      <div className="p-3 border-t border-[var(--border-muted)] space-y-1">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="shrink-0 w-4 h-4 text-[var(--text-muted)]" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-accent-red hover:bg-accent-red/10 transition"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="shrink-0 w-4 h-4 text-accent-red/70" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
