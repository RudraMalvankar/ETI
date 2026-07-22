import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { useApexStore } from '../store/useApexStore';

export const SettingsPage: React.FC = () => {
  const {
    apiBaseUrl,
    connectionState,
    isDarkMode,
    toggleTheme,
    confidenceThreshold,
    setConfidenceThreshold,
  } = useApexStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Engine Preferences"
        description="Configure backend connection parameters, vector store settings, decision thresholds, and display mode."
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Connectivity Settings */}
        <SectionCard title="Backend API Configuration" subtitle="FastAPI Orchestrator Connection">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">API Base URL</label>
              <input
                type="text"
                readOnly
                value={apiBaseUrl}
                className="w-full p-2.5 bg-slate-950 text-white font-mono rounded-xl border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Connection State</span>
              <span className="font-bold capitalize text-emerald-400">{connectionState}</span>
            </div>
          </div>
        </SectionCard>

        {/* Engine Parameters */}
        <SectionCard
          title="AI Guardrail & Confidence Parameters"
          subtitle="Decision Engine Hallucination Thresholds"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Minimum Citation Confidence Threshold ({confidenceThreshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="99"
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Requires minimum {confidenceThreshold}% citation similarity score
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Qdrant Vector Index Mode</span>
              <span className="font-bold text-blue-400">Local Vector Store (768D Embeddings)</span>
            </div>
          </div>
        </SectionCard>

        {/* Display Settings */}
        <SectionCard title="Interface & Theme Mode" subtitle="Customize dashboard appearance">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-white font-bold block mb-0.5">Current Theme</span>
              <span className="text-slate-400 text-[11px]">
                {isDarkMode ? 'Enterprise Dark Mode (Recommended)' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>Toggle Mode</span>
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
