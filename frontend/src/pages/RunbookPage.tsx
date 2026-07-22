import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  generateRunbook,
  regenerateRunbook,
  storeMemory,
  updateRunbookStep,
} from '../services/apexServices';
import { Runbook } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

function priorityToLabel(priority: number): 'low' | 'medium' | 'high' | 'critical' {
  if (priority >= 90) return 'critical';
  if (priority >= 70) return 'high';
  if (priority >= 40) return 'medium';
  return 'low';
}

export const RunbookPage: React.FC = () => {
  const {
    currentDecision,
    currentSimulation,
    currentRunbook,
    setCurrentRunbook,
    setCurrentMemory,
    currentUser,
  } = useApexStore();
  const navigate = useNavigate();
  const [runbook, setRunbook] = useState<Runbook | null>(currentRunbook);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackByStep, setFeedbackByStep] = useState<Record<string, string>>({});
  const [isPersistingMemory, setIsPersistingMemory] = useState(false);

  const completedSteps = useMemo(
    () => runbook?.steps.filter(step => step.status === 'completed').length || 0,
    [runbook]
  );

  const canPersistMemory = ['Engineer', 'Admin'].includes(currentUser?.role || '');

  useEffect(() => {
    if (!currentRunbook) {
      setRunbook(null);
      return;
    }
    setRunbook(currentRunbook);
  }, [currentRunbook]);

  useEffect(() => {
    if (!currentSimulation?.simulation_id || !currentDecision) {
      return;
    }

    if (currentRunbook?.runbook_id) {
      return;
    }

    setIsLoading(true);
    generateRunbook(
      {
        ...currentDecision,
        failed_asset: currentSimulation.request.failed_asset,
        failure_type: currentSimulation.request.failure_type,
      },
      currentSimulation.simulation_id
    )
      .then(res => {
        setRunbook(res);
        setCurrentRunbook(res);
      })
      .catch((error: any) => {
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to generate runbook.';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, [currentDecision, currentRunbook?.runbook_id, currentSimulation, setCurrentRunbook]);

  const handleStepStatus = async (stepId: string, status: 'completed' | 'failed') => {
    if (!runbook) {
      return;
    }

    const feedbackNote = feedbackByStep[stepId] || (status === 'completed' ? 'Completed' : '');
    if (status === 'failed' && !feedbackNote.trim()) {
      toast.error('Add failure notes before logging a failed step.');
      return;
    }

    try {
      const updated = await updateRunbookStep(runbook.runbook_id, stepId, status, feedbackNote);
      setRunbook(updated);
      setCurrentRunbook(updated);
      toast.success(
        status === 'completed' ? 'Runbook step marked completed.' : 'Runbook step failure logged.'
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to update runbook step.';
      toast.error(message);
    }
  };

  const handleRegenerate = async () => {
    if (!runbook) {
      return;
    }

    setIsLoading(true);
    try {
      const regenerated = await regenerateRunbook(runbook.runbook_id);
      setRunbook(regenerated);
      setCurrentRunbook(regenerated);
      toast.success('Runbook regenerated from backend.');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to regenerate runbook.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreMemory = async () => {
    if (!runbook || !currentSimulation || !currentDecision) {
      toast.error('Simulation, decision, and runbook context are required before storing memory.');
      return;
    }

    if (!canPersistMemory) {
      toast.error('Operational memory persistence requires an Engineer or Admin role.');
      return;
    }

    setIsPersistingMemory(true);
    try {
      const memory = await storeMemory({
        failed_asset: runbook.failed_asset,
        failure_type: runbook.failure_type,
        simulation_id: currentSimulation.simulation_id,
        runbook_id: runbook.runbook_id,
        decision_data: currentDecision,
        outcome:
          runbook.status === 'completed'
            ? 'Resolved'
            : runbook.is_regenerated
              ? 'Resolved after regenerated runbook'
              : 'In Progress',
        technician_feedback: runbook.update_history,
      });
      setCurrentMemory(memory);
      toast.success('Incident persisted to operational memory.');
      navigate('/dashboard/memory');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to store incident memory.';
      toast.error(message);
    } finally {
      setIsPersistingMemory(false);
    }
  };

  if (!currentSimulation?.simulation_id || !currentDecision) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dynamic Operational Runbook Engine"
          description="Generate a live mitigation workflow from the current simulation and AI recommendation."
          icon={BookOpen}
        />
        <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
          Run a simulation and generate a recommendation first. The runbook engine depends on both.
        </div>
      </div>
    );
  }

  if (!runbook) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dynamic Operational Runbook Engine"
          description="Generate a live mitigation workflow from the current simulation and AI recommendation."
          icon={BookOpen}
        />
        <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
          {isLoading ? 'Generating runbook from backend...' : 'No runbook is loaded yet.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Dynamic Operational Runbook Engine"
        description="Live step-by-step maintenance workflow with backend state updates, grounded citations, and real feedback processing."
        icon={BookOpen}
        actions={
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-brand-500 text-white text-xs font-bold transition shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Runbook</span>
          </button>
        }
      />

      <div className="p-3 rounded bg-[var(--bg-elevated)] border border-[var(--border-strong)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">
            Runbook ID
          </span>
          <span className="text-sm font-extrabold text-[var(--text-primary)] block mt-0.5">
            {runbook.runbook_id}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">
            Failed Asset
          </span>
          <span className="text-sm font-mono text-brand-500 block mt-0.5">
            {runbook.failed_asset}
          </span>
        </div>

        <div className="flex-1 min-w-[200px] max-w-md mx-auto hidden md:block">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">
              Workflow Progress
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {completedSteps} / {runbook.steps.length} Steps
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--glass-border)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${runbook.steps.length ? (completedSteps / runbook.steps.length) * 100 : 0}%`,
              }}
              className="h-full bg-gradient-to-r from-brand-500 to-accent-emerald transition-all duration-500"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">
            Status
          </span>
          <div className="mt-1">
            <StatusBadge status={runbook.is_regenerated ? 'regenerated' : runbook.status} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {runbook.steps.map((step, index) => (
          <div
            key={step.step_id}
            className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-sm ${
              step.status === 'completed'
                ? 'bg-accent-emerald/5 border-accent-emerald/30'
                : step.status === 'failed'
                  ? 'bg-accent-red/5 border-accent-red/30'
                  : 'bg-[var(--bg-surface)] border-[var(--border-muted)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[var(--glass-border)] gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono text-sm font-extrabold ${
                    step.status === 'completed'
                      ? 'bg-accent-emerald/20 text-accent-emerald'
                      : step.status === 'failed'
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'bg-[var(--bg-secondary)] text-brand-500 border border-[var(--glass-border)]'
                  }`}
                >
                  {index + 1}
                </span>
                <h3 className="heading-2 text-base md:text-lg">{step.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {step.estimated_duration} mins
                </span>
                <StatusBadge status={priorityToLabel(step.priority)} size="sm" />
                <StatusBadge status={step.status} size="sm" />
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed font-mono bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--glass-border)] shadow-inner">
              {step.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-brand-500/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-brand-500" /> Required Tools
                </span>
                <span className="text-[var(--text-primary)] text-xs font-medium">
                  {step.required_tools.join(', ') || 'Standard Tools'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-accent-amber/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-amber" /> Safety Requirements
                </span>
                <span className="text-[var(--text-primary)] text-xs font-medium">
                  {step.safety_requirements.join(', ') || 'Standard PPE'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--glass-border)] transition-colors hover:border-accent-emerald/30">
                <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-accent-emerald" /> Grounded Citations
                </span>
                <span className="text-[var(--text-primary)] font-mono text-[10px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                  {step.document_citations.length
                    ? step.document_citations
                        .map(citation => `${citation.document_id || citation.document || 'DOC'}:${citation.chunk_id || citation.section || 'REF'}`)
                        .join(', ')
                    : 'N/A'}
                </span>
              </div>
            </div>

            {step.status !== 'completed' && step.status !== 'failed' && (
              <div className="flex flex-col gap-4 pt-4 border-t border-[var(--glass-border)]">
                <input
                  type="text"
                  value={feedbackByStep[step.step_id] || ''}
                  onChange={e =>
                    setFeedbackByStep(prev => ({
                      ...prev,
                      [step.step_id]: e.target.value,
                    }))
                  }
                  placeholder="Add technician notes or failure context before submitting..."
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-xs rounded-xl border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm transition-all"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    Technician Sign-Off Control
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStepStatus(step.step_id, 'failed')}
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
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end mt-8"
      >
        <button
          onClick={handleStoreMemory}
          disabled={isPersistingMemory}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <span>{isPersistingMemory ? 'Persisting Incident...' : 'Store Incident in Operational Memory'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
