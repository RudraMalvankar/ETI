import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Network, BookOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--glass-border)] z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.includes(item.id) || (item.id === 'dashboard' && location.pathname === '/dashboard');
        
        return (
          <button
            key={item.id}
            onClick={() => navigate(`/dashboard/${item.id === 'dashboard' ? '' : item.id}`)}
            className={`relative flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive ? 'text-brand-400' : 'text-[var(--text-secondary)]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="mobilenav-active"
                className="absolute inset-0 bg-brand-500/10 rounded-xl m-1 border border-brand-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className={`w-5 h-5 mb-1 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-bold tracking-wide relative z-10">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
