import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Wrench,
  RefreshCw,
  FileText,
  ArrowRight,
  BrainCircuit,
  Settings
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

  // Animation States
  const [regenStage, setRegenStage] = useState<'none' | 'detecting' | 'analyzing' | 'generating' | 'done'>('none');

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

  const triggerRegenAnimationSequence = async () => {
    setRegenStage('detecting');
    await new Promise(r => setTimeout(r, 1000));
    setRegenStage('analyzing');
    await new Promise(r => setTimeout(r, 1500));
    setRegenStage('generating');
    await new Promise(r => setTimeout(r, 1500));
    
    // Perform actual regeneration
    handleRegenerate();
    
    setRegenStage('done');
    setTimeout(() => setRegenStage('none'), 2000);
  };

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
      setRunbook((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.step_id === stepId ? { ...s, status, feedback_notes: feedbackNote } : s
        )
      }));
    } finally {
      if (status === 'failed') {
        // Trigger the complex animation sequence on failure
        triggerRegenAnimationSequence();
      }
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
        title: 'REGENERATED: Engage Pneumatic Bypass',
        action: 'Bypass stuck handwheel on V-202 using auxiliary pneumatic actuator line PA-02.',
        target_asset: 'V-202',
        priority: 'critical',
        status: 'completed',
        required_tools: ['Pneumatic Hose Kit'],
        safety_requirements: ['High-Pressure Containment PPE'],
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {regenStage !== 'none' && regenStage !== 'done' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-md"
          >
            <div className="glass-panel p-10 rounded-3xl flex flex-col items-center max-w-sm text-center shadow-2xl border-brand-500/50">
              {regenStage === 'detecting' && <XCircle className="w-16 h-16 text-accent-red animate-pulse mb-6" />}
              {regenStage === 'analyzing' && <BrainCircuit className="w-16 h-16 text-accent-purple animate-pulse mb-6" />}
              {regenStage === 'generating' && <Settings className="w-16 h-16 text-brand-500 animate-spin mb-6" />}
              
              <h2 className="heading-2 mb-2">
                {regenStage === 'detecting' && 'Failure Detected'}
                {regenStage === 'analyzing' && 'AI Analysis Initiated'}
                {regenStage === 'generating' && 'Generating Alternative Procedure'}
              </h2>
              <p className="subtitle">
                {regenStage === 'detecting' && 'Logging technician feedback into operational memory...'}
                {regenStage === 'analyzing' && 'Querying knowledge graph for blast radius containment...'}
                {regenStage === 'generating' && 'Synthesizing new runbook sequence...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Dynamic Operational Runbook Engine"
        description="Interactive step-by-step field maintenance workflow with safety protocols, technician feedback, and dynamic regeneration."
        icon={BookOpen}
        actions={
          <button
            onClick={handleRegenerate}
            disabled={isLoading || regenStage !== 'none'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-brand-500 text-white text-xs font-bold transition shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Runbook</span>
          </button>
        }
      />

      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 shadow-sm border border-[var(--glass-border)]">
        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">Runbook ID</span>
          <span className="text-sm font-extrabold text-[var(--text-primary)] block mt-0.5">{runbook.runbook_id}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">Simulation ID</span>
          <span className="text-sm font-mono text-brand-500 block mt-0.5">{runbook.simulation_id}</span>
        </div>
        
        {/* Progress Tracker added here */}
        <div className="flex-1 min-w-[200px] max-w-md mx-auto hidden md:block">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">Workflow Progress</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {runbook.steps.filter(s => s.status === 'completed').length} / {runbook.steps.length} Steps
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--glass-border)]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(runbook.steps.filter(s => s.status === 'completed').length / runbook.steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-brand-500 to-accent-emerald transition-all duration-500"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">Status</span>
          <div className="mt-1">
            <StatusBadge status={runbook.is_regenerated ? 'regenerated' : runbook.status} />
          </div>
        </div>
      </div>

      {/* Step Checklist */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        {runbook.steps.map((step) => (
          <motion.div
            variants={stepVariants}
            key={step.step_id}
            className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-sm ${
              step.status === 'completed'
                ? 'bg-accent-emerald/5 border-accent-emerald/30'
                : step.status === 'failed'
                ? 'bg-accent-red/5 border-accent-red/30'
                : 'glass-panel hover:border-[var(--text-secondary)]/30'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[var(--glass-border)] gap-2">
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono text-sm font-extrabold ${
                  step.status === 'completed' ? 'bg-accent-emerald/20 text-accent-emerald' :
                  step.status === 'failed' ? 'bg-accent-red/20 text-accent-red' :
                  'bg-[var(--bg-secondary)] text-brand-500 border border-[var(--glass-border)]'
                }`}>
                  {step.step_number}
                </span>
                <h3 className="heading-2 text-base md:text-lg">{step.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {step.estimated_duration_minutes} mins
                </span>
                <StatusBadge status={step.priority} size="sm" />
                <StatusBadge status={step.status} size="sm" />
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed font-mono bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--glass-border)] shadow-inner">
              {step.action}
            </p>

            {/* Details: Tools, Safety, Citations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-brand-500/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-brand-500" /> Required Tools
                </span>
                <span className="text-[var(--text-primary)] text-xs font-medium">{(step.required_tools || []).join(', ') || 'Standard Tools'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-accent-amber/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-amber" /> Safety Requirements
                </span>
                <span className="text-[var(--text-primary)] text-xs font-medium">{(step.safety_requirements || []).join(', ') || 'Standard PPE'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-accent-emerald/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-accent-emerald" /> Grounded Citations
                </span>
                <span className="text-[var(--text-primary)] font-mono text-[10px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{(step.citations || []).join(', ') || 'N/A'}</span>
              </div>
            </div>

            {/* Technician Action Controls */}
            <AnimatePresence mode="wait">
              {step.status !== 'completed' && step.status !== 'failed' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[var(--glass-border)] gap-4"
                >
                  {failedStepId === step.step_id ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Detail the failure reason (e.g., Handwheel stuck, excessive pressure)..."
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-xs rounded-xl border border-accent-red/40 focus:outline-none focus:ring-2 focus:ring-accent-red/20 shadow-sm transition-all"
                      />
                      <button
                        onClick={() => handleStepStatus(step.step_id, 'failed')}
                        className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-accent-red hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-accent-red/20 transition-transform hover:scale-105"
                      >
                        Confirm Failure
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <span className="text-xs text-[var(--text-secondary)] font-medium">Technician Sign-Off Control</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFailedStepId(step.step_id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/30 text-xs font-bold transition-all hover:-translate-y-0.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Log Step Failure</span>
                        </button>

                        <button
                          onClick={() => handleStepStatus(step.step_id, 'completed')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Completed</span>
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Action to proceed to Operational Memory */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-end mt-8">
        <button
          onClick={() => setActiveTab('memory')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all hover:-translate-y-0.5"
        >
          <span>Store Incident in Operational Memory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
