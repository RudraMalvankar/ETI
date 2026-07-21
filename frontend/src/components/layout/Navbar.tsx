import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  User, 
  Search, 
  Slash, 
  Tag, 
  Bot, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  LogOut, 
  Check, 
  Shield, 
  Sliders 
} from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { 
    globalQuery, 
    setGlobalQuery, 
    setActiveTab, 
    toggleTagInspector, 
    toggleCopilot, 
    toggleComplianceModal 
  } = useApexStore();
  
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const sampleNotifications = [
    { id: 1, title: 'Reactor R-101 Pressure Surge', time: '2 mins ago', type: 'critical', desc: 'PT-401 telemetry logged 18.4 Bar.' },
    { id: 2, title: 'Valve V-102 Actuator Jammed', time: '5 mins ago', type: 'warning', desc: 'LOTO isolation step failed.' },
    { id: 3, title: 'OISD Audit Package Ready', time: '12 mins ago', type: 'info', desc: 'Auto-compiled compliance certificate.' }
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-muted)] h-16 select-none shadow-sm">
      
      {/* Breadcrumbs & Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden lg:flex items-center text-xs font-mono font-medium text-[var(--text-muted)]">
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>
            Plant Ops
          </span>
          <Slash className="w-3.5 h-3.5 mx-1.5 opacity-40 text-slate-500" />
          <span className="text-blue-400 font-semibold uppercase tracking-wider">{path}</span>
        </div>

        <div className="relative flex items-center w-full max-w-md group">
          <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setActiveTab('documents');
            }}
            placeholder="Search assets, P&IDs, tags, SOPs... (⌘K)"
            className="w-full pl-10 pr-4 py-1.5 bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-xl border border-[var(--border-strong)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-inter"
          />
        </div>
      </div>

      {/* Right Intelligence Action Controls */}
      <div className="flex items-center gap-2">
        {/* Feature Triggers */}
        <button
          onClick={() => toggleTagInspector()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95"
          title="Equipment Tag & Entity Inspector"
        >
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tags</span>
        </button>

        <button
          onClick={() => toggleCopilot()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95"
          title="Expert RAG Knowledge Copilot"
        >
          <Bot className="w-3.5 h-3.5 text-blue-400" />
          <span>Copilot</span>
        </button>

        <button
          onClick={() => toggleComplianceModal()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95"
          title="OISD/PESO Compliance Hub"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Compliance</span>
        </button>

        <div className="h-4 w-[1px] bg-[var(--border-strong)] mx-1 hidden sm:block"></div>

        {/* Connection Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Connected</span>
        </div>

        {/* 1. Notifications Bell Button & Popover */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserProfile(false);
            }}
            className={`p-2 rounded-xl transition relative border ${
              showNotifications
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-[var(--bg-base)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Notifications & Alarm Feed"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </motion.button>

          {/* Notifications Dropdown Popup */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 font-sans select-none"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white font-display">Command Center Alerts</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    3 New
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {sampleNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-2.5 rounded-xl bg-[#151D2A] border border-slate-800 hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{notif.desc}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full mt-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono text-center transition-colors"
                >
                  Close Notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Theme Switcher Component */}
        <ThemeSwitcher />

        {/* 3. User Profile Button & Dropdown */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => {
              setShowUserProfile(!showUserProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 cursor-pointer transition-opacity"
            title="User Profile & Plant Role"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md border border-blue-400/30">
              <User className="w-4 h-4" />
            </div>
          </motion.button>

          {/* User Profile Card Popover */}
          <AnimatePresence>
            {showUserProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 font-sans select-none"
              >
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    AV
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Alex Vance</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Lead Process Engineer</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300 mb-4">
                  <div className="flex justify-between p-2 rounded bg-[#151D2A] border border-slate-800">
                    <span className="text-slate-400">Refinery:</span>
                    <strong className="text-white">Texas Alpha</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#151D2A] border border-slate-800">
                    <span className="text-slate-400">Role:</span>
                    <strong className="text-emerald-400">LOTO Supervisor</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#151D2A] border border-slate-800">
                    <span className="text-slate-400">Security Clearance:</span>
                    <strong className="text-blue-400">Level 4 (Admin)</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setShowUserProfile(false);
                      navigate('/dashboard/settings');
                    }}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserProfile(false);
                      navigate('/login');
                    }}
                    className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
