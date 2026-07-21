import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Search, 
  Clock, 
  Zap,
  Tag
} from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';

export const DashboardHeader: React.FC = () => {
  const { 
    isAnomalyActive, 
    isRerouted, 
    viewMode, 
    setViewMode, 
    triggerAnomaly, 
    resetPlantState,
    toggleCopilot,
    toggleComplianceModal,
    toggleTagInspector
  } = useApexStore();

  return (
    <header className="bg-[#0D131F] border-b border-[#1E293B] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0D131F] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-display">APEX</h1>
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AUTOPILOT v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-inter">Causal Shadow-Run & Executable Runbook Engine</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-semibold font-mono ${
          isAnomalyActive 
            ? isRerouted
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
              : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {isAnomalyActive ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>{isRerouted ? 'ANOMALY: DYNAMICALLY REROUTED' : 'CRITICAL ANOMALY: REACTOR OVERPRESSURE'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>PLANT STATE: NOMINAL (ALL SYSTEMS NORMAL)</span>
            </>
          )}
        </div>
      </div>

      {/* ROI Time-Saved Counter */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151E2E] border border-slate-800 text-xs text-slate-300">
        <Clock className="w-4 h-4 text-emerald-400" />
        <span>Time Saved: <strong className="text-emerald-400 font-mono">~45 Mins</strong> vs Manual RAG Search</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Anomaly Simulator Controls */}
        <div className="flex items-center bg-[#151E2E] p-1 rounded-lg border border-slate-800">
          <button
            onClick={triggerAnomaly}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              isAnomalyActive 
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Simulate Reactor R-101 Overpressure Event"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Anomaly</span>
          </button>
          
          <button
            onClick={resetPlantState}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              !isAnomalyActive 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Reset Plant to Nominal State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* View Switcher: Desktop vs Mobile */}
        <div className="flex items-center bg-[#151E2E] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              viewMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Control Room Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode('rugged_mobile')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              viewMode === 'rugged_mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Field Technician Rugged Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Tag Inspector Drawer Trigger */}
        <button
          onClick={() => toggleTagInspector()}
          className="p-2 rounded-lg bg-[#151E2E] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-medium flex items-center gap-1.5"
          title="Equipment Tag & Entity Extractor Inspector"
        >
          <Tag className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Tags</span>
        </button>

        {/* RAG Copilot Search Trigger */}
        <button
          onClick={() => toggleCopilot()}
          className="p-2 rounded-lg bg-[#151E2E] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-medium flex items-center gap-1.5"
          title="Open Expert RAG Knowledge Copilot"
        >
          <Search className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* OISD/PESO Compliance Hub Button */}
        <button
          onClick={() => toggleComplianceModal()}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Compliance Hub</span>
        </button>
      </div>
    </header>
  );
};
