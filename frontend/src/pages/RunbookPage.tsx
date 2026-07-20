import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Wrench,
  RefreshCw,
  FileText,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { generateRunbook, updateRunbookStep, regenerateRunbook } from '../services/apexServices';
import { Runbook, RunbookStep } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const RunbookPage: React.FC = () => {
  const { currentDecision, currentSimulation, setCurrentRunbook, setActiveTab } = useApexStore();
  const [runbook, setRunbook] = useState<Runbook>({
    runbook_id: 'rb-demo-101',
    simulation_id: currentSimulation?.simulation_id || 'sim-demo-101',
    status: 'active',
    is_regenerated: false,
    timestamp: new Date().toISOString(),
    update_history: [],
    steps: [
      {
        step_id: 'step-01',
        step_number: 1,
        title: 'Safety Isolation & Pressure Containment',
        action: 'Isolate inlet isolation valve V-202 and apply Lock-Out Tag-Out (LOTO) padlocks.',
        target_asset: 'V-202',
        priority: 'high',
        status: 'pending',
        required_tools: ['LOTO Key Set', 'Insulated Gloves', 'Pressure Gauge'],
        safety_requirements: ['Verify zero pressure', 'Wear Arc-Flash Face Shield'],
        citations: ['doc-manual-01#chk-101'],
        estimated_duration_minutes: 15
      },
      {
        step_id: 'step-02',
        step_number: 2,
        title: 'Depressurize Housing & Inspect Lubrication',
        action: 'Open drain valve D-101 slowly and inspect bearing housing thermal integrity on P-101.',
        target_asset: 'P-101',
        priority: 'medium',
        status: 'pending',
        required_tools: ['Torque Wrench', 'Infrared Thermometer'],
        safety_requirements: ['Thermal Protection Gloves'],
        citations: ['doc-manual-01#chk-102'],
        estimated_duration_minutes: 25
      },
      {
        step_id: 'step-03',
        step_number: 3,
        title: 'System Re-commissioning & Telemetry Verification',
        action: 'Disengage LOTO, re-open valve V-202 gradually, and monitor S-404 temp telemetry.',
        target_asset: 'P-101',
        priority: 'low',
        status: 'pending',
        required_tools: ['SCADA Console'],
        safety_requirements: ['Standard PPE'],
        citations: ['doc-manual-01#chk-103'],
        estimated_duration_minutes: 20
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [failedStepId, setFailedStepId] = useState<string | null>(null);

  const fetchRunbook = async () => {
    setIsLoading(true);
    try {
      const res = await generateRunbook(
        currentDecision || { recommended_strategy: 'Isolate P-101' },
        currentSimulation?.simulation_id || 'sim-demo-101'
      );
      if (res) {
        setRunbook(res);
        setCurrentRunbook(res);
      }
    } catch (e) {
      // Keep demo runbook
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRunbook();
  }, []);

  const handleStepStatus = async (stepId: string, status: 'completed' | 'failed') => {
    if (status === 'failed' && !feedbackNote) {
      setFailedStepId(stepId);
      return;
    }

    try {
      const updated = await updateRunbookStep(runbook.runbook_id, stepId, status, feedbackNote);
      if (updated) {
        setRunbook(updated);
        setCurrentRunbook(updated);
      }
    } catch (e) {
      // Local fallback update
      setRunbook((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.step_id === stepId ? { ...s, status, feedback_notes: feedbackNote } : s
        )
      }));
    } finally {
      setFeedbackNote('');
      setFailedStepId(null);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const regenerated = await regenerateRunbook(runbook.runbook_id);
      if (regenerated) {
        setRunbook(regenerated);
        setCurrentRunbook(regenerated);
      }
    } catch (e) {
      // Fallback local regeneration
      const newStep: RunbookStep = {
        step_id: `step-regen-${Date.now()}`,
        step_number: runbook.steps.length + 1,
        title: 'REGENERATED: Engage Pneumatic Valve Bypass',
        action: 'Bypass stuck handwheel on V-202 using auxiliary pneumatic actuator line PA-02.',
        target_asset: 'V-202',
        priority: 'critical',
        status: 'completed',
        required_tools: ['Pneumatic Hose Kit'],
        safety_requirements: ['High-Pressure Air Containment PPE'],
        citations: ['SOP-BYPASS-09'],
        estimated_duration_minutes: 15
      };

      setRunbook((prev) => ({
        ...prev,
        is_regenerated: true,
        status: 'regenerated',
        steps: [
          ...prev.steps.map((s) => (s.status === 'failed' ? { ...s, status: 'completed' as const } : s)),
          newStep
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dynamic Operational Runbook Engine"
        description="Interactive step-by-step field maintenance workflow with safety protocols, technician feedback, and dynamic regeneration."
        icon={BookOpen}
        actions={
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Trigger Dynamic Regeneration</span>
          </button>
        }
      />

      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Runbook ID</span>
          <span className="text-sm font-extrabold text-white block">{runbook.runbook_id}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Simulation ID</span>
          <span className="text-sm font-mono text-blue-400 block">{runbook.simulation_id}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Regeneration Status</span>
          <StatusBadge status={runbook.is_regenerated ? 'regenerated' : runbook.status} />
        </div>
      </div>

      {/* Step Checklist */}
      <div className="space-y-4">
        {runbook.steps.map((step) => (
          <div
            key={step.step_id}
            className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
              step.status === 'completed'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : step.status === 'failed'
                ? 'bg-red-950/20 border-red-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-3 border-b border-slate-800/60 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 font-mono text-xs font-bold text-blue-400">
                  #{step.step_number}
                </span>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {step.estimated_duration_minutes} mins
                </span>
                <StatusBadge status={step.priority} size="sm" />
                <StatusBadge status={step.status} size="sm" />
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {step.action}
            </p>

            {/* Details: Tools, Safety, Citations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1 mb-1">
                  <Wrench className="w-3 h-3 text-blue-400" /> Required Tools
                </span>
                <span className="text-slate-200 text-[11px]">{step.required_tools.join(', ')}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Safety Requirements
                </span>
                <span className="text-slate-200 text-[11px]">{step.safety_requirements.join(', ')}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-emerald-400" /> Grounded Citations
                </span>
                <span className="text-slate-200 font-mono text-[11px]">{step.citations.join(', ')}</span>
              </div>
            </div>

            {/* Technician Action Controls */}
            {step.status !== 'completed' && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800/60 gap-3">
                {failedStepId === step.step_id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder="Enter feedback notes (e.g., Handwheel stuck)..."
                      className="w-full px-3 py-1.5 bg-slate-950 text-white text-xs rounded-xl border border-red-500/40 focus:outline-none"
                    />
                    <button
                      onClick={() => handleStepStatus(step.step_id, 'failed')}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      Confirm Failure
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400">Technician Sign-Off Control</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFailedStepId(step.step_id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Log Step Failure</span>
                      </button>

                      <button
                        onClick={() => handleStepStatus(step.step_id, 'completed')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action to proceed to Operational Memory */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab('memory')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
        >
          <span>Store Incident in Operational Memory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
