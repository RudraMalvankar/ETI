import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  FileText, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  Lock, 
  UserCheck,
  History,
  Sparkles
} from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';

export const ExecutableRunbookEngine: React.FC = () => {
  const { 
    runbook, 
    toggleStepCompletion, 
    toggleLotoStatus, 
    markStepFailedAndReroute, 
    isRerouted,
    isAnomalyActive
  } = useApexStore();

  const [isRerouting, setIsRerouting] = useState(false);

  const handleRerouteClick = async (stepId: string) => {
    setIsRerouting(true);
    await markStepFailedAndReroute(stepId);
    setIsRerouting(false);
  };

  return (
    <div className="bg-[#0D131F] rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col h-full select-none">
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
              runbook.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {runbook.riskLevel} RISK
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {runbook.id}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {runbook.estimatedResolutionTime}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white font-display leading-tight mb-1">
          {runbook.title}
        </h2>
        <p className="text-xs text-slate-400 font-inter">
          Trigger: <span className="text-red-400 font-mono">{runbook.anomalyTrigger}</span>
        </p>

        {/* Historical Near-Miss Match Banner */}
        {runbook.matchedHistoricalIncident && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-200">
            <History className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate">Historical Incident Match ({runbook.matchedHistoricalIncident.similarity}% Similarity)</span>
                <span className="text-[10px] text-indigo-300 font-mono">{runbook.matchedHistoricalIncident.date}</span>
              </div>
              <p className="text-[11px] text-indigo-300/80 truncate">{runbook.matchedHistoricalIncident.title} • {runbook.matchedHistoricalIncident.plant}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rerouted Alert Banner */}
      {isRerouted && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <div>
            <span className="font-bold">Dynamic Causal Reroute Engaged:</span> AI Autopilot detected primary valve jam. Rerouted mitigation flow to Bypass V-108 to maintain safe venting.
          </div>
        </div>
      )}

      {/* Step Checklist List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {runbook.steps.map((step) => {
          const isLotoDone = step.lotoStatus === 'verified';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                step.isCompleted
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-[#131B2B] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step Completion Checkbox */}
                <button
                  onClick={() => toggleStepCompletion(step.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {step.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        STEP 0{step.stepNumber}
                      </span>
                      <h3 className={`text-sm font-semibold ${step.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.title}
                      </h3>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {step.assignedRole}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Footer Row: LOTO Validation & RAG Citation & Reroute Trigger */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    {/* LOTO Validation Button */}
                    {step.isLotoRequired ? (
                      <button
                        onClick={() => toggleLotoStatus(step.id)}
                        className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-mono font-semibold transition-all ${
                          isLotoDone
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>LOTO: {isLotoDone ? 'VERIFIED ✓' : 'PENDING SIGN-OFF'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">No LOTO Required</span>
                    )}

                    {/* RAG Citation Link */}
                    <div className="flex items-center gap-1.5 text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded border border-blue-500/20 font-mono truncate max-w-[240px]">
                      <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{step.citation.documentName} ({step.citation.section})</span>
                      <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-slate-400 hover:text-blue-300" />
                    </div>

                    {/* Reroute Trigger Button (Simulates valve stuck) */}
                    {step.stepNumber === 2 && !isRerouted && isAnomalyActive && (
                      <button
                        onClick={() => handleRerouteClick(step.id)}
                        disabled={isRerouting}
                        className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-mono text-[10px] flex items-center gap-1 font-semibold"
                        title="Simulate valve stuck or physical constraint to trigger AI graph recalculation"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRerouting ? 'animate-spin' : ''}`} />
                        <span>{isRerouting ? 'Recalculating...' : 'Mark Stuck (Reroute)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
