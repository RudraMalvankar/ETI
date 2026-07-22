import React, { useEffect } from 'react';
import { Wifi, WifiOff, Server, PlayCircle, RefreshCw } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { checkBackendHealth } from '../../services/apiClient';

export const BackendStatusBanner: React.FC = () => {
  const { connectionState, setConnectionState, apiBaseUrl } = useApexStore();

  const pollHealth = async () => {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      setConnectionState('connected');
    } else {
      setConnectionState('demo');
    }
  };

  useEffect(() => {
    pollHealth();
    const interval = setInterval(pollHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const stateConfig = {
    connected: {
      label: 'Connected to Backend',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      icon: Wifi,
    },
    demo: {
      label: 'Demo Mode (Using Mock Data)',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
      icon: PlayCircle,
    },
    offline: {
      label: 'Backend Offline',
      badge: 'bg-red-500/10 text-red-400 border-red-500/30',
      dot: 'bg-red-400',
      icon: WifiOff,
    },
  };

  const config = stateConfig[connectionState];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.badge} font-semibold text-[11px]`}
        >
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <Icon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Server className="w-3 h-3 text-slate-500" />
          <span>{apiBaseUrl}</span>
        </span>
      </div>
      <button
        onClick={pollHealth}
        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
        title="Refresh Backend Status"
      >
        <RefreshCw className="w-3 h-3" />
        <span className="hidden md:inline">Check Liveness</span>
      </button>
    </div>
  );
};
