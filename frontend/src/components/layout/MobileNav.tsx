import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Network, BookOpen, ShieldCheck } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'graph', label: 'Graph', icon: Network },
    { id: 'decision', label: 'Copilot', icon: BrainCircuit },
    { id: 'runbook', label: 'Runbook', icon: BookOpen },
    { id: 'compliance', label: 'Audit', icon: ShieldCheck },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--border-muted)] z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          location.pathname.includes(item.id) ||
          (item.id === 'dashboard' && location.pathname === '/dashboard');

        return (
          <button
            key={item.id}
            onClick={() => navigate(`/dashboard/${item.id === 'dashboard' ? '' : item.id}`)}
            className={`relative flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive ? 'text-primary-500' : 'text-[var(--text-secondary)]'
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-primary-500/10 rounded m-1 border border-primary-500/20" />
            )}
            <Icon
              className={`w-5 h-5 mb-1 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`}
            />
            <span className="text-[9px] font-bold tracking-wide relative z-10">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
