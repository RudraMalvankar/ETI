import React, { useMemo, useState } from 'react';
import { Play, Clock, Wrench, TrendingDown, ArrowRight, ShieldAlert, Network } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { runSimulation } from '../services/apexServices';
import { SimulationResponse } from '../types/apex';
import { useApexStore } from '../store/useApexStore';
import { useNavigate } from 'react-router-dom';

function getRiskLabel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 8) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

export const SimulationPage: React.FC = () => {
  const {
    activeAssetId,
    setActiveAssetId,
    activeFailureType,
    setActiveFailureType,
    currentSimulation,
    setCurrentSimulation,
  } = useApexStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const simulationResult: SimulationResponse | null = currentSimulation;

  const highestRiskScenario = useMemo(() => {
    if (!simulationResult?.scenarios.length) {
      return null;
    }

    return [...simulationResult.scenarios].sort(
      (a, b) => b.risk_score.overall_score - a.risk_score.overall_score
    )[0];
  }, [simulationResult]);

  const handleRunSim = async () => {
    setIsLoading(true);
    try {
      const res = await runSimulation(activeAssetId, activeFailureType);
      setCurrentSimulation(res);
      toast.success(`Simulation ${res.simulation_id.slice(0, 8)} created.`);
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Simulation failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Maintenance Intelligence"
        description="Run live failure propagation scenarios and inspect downtime, cost, and safety exposure from the backend simulation engine."
        icon={Wrench}
      />

      <SectionCard
        title="Shadow Simulation Parameters"
        subtitle="Execute a live backend scenario for the selected asset and failure mode"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Target Asset ID
            </label>
            <select
              value={activeAssetId}
              onChange={e => setActiveAssetId(e.target.value)}
              className="w-full p-3 bg-[var(--bg-primary)] text-white text-xs rounded-xl border border-[var(--glass-border)] focus:outline-none focus:border-brand-500 font-mono transition-colors"
            >
              <option value="P-101">P-101 (Centrifugal Pump)</option>
              <option value="V-202">V-202 (Isolation Valve)</option>
              <option value="HE-303">HE-303 (Heat Exchanger)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              Failure Mode Type
            </label>
            <select
              value={activeFailureType}
              onChange={e => setActiveFailureType(e.target.value)}
              className="w-full p-3 bg-[var(--bg-primary)] text-white text-xs rounded-xl border border-[var(--glass-border)] focus:outline-none focus:border-brand-500 font-mono transition-colors"
            >
              <option value="bearing_overheat">Bearing Overheat</option>
              <option value="mechanical_failure">Mechanical Seal Failure</option>
              <option value="electrical_short">Motor Fault</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSim}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>Run Shadow Simulation</span>
            </button>
          </div>
        </div>
      </SectionCard>

      {simulationResult ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                Simulation ID
              </span>
              <p className="font-mono text-sm text-white break-all">{simulationResult.simulation_id}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                Failed Asset
              </span>
              <p className="text-lg font-bold text-white">{simulationResult.request.failed_asset}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                Scenario Count
              </span>
              <p className="text-lg font-bold text-white">{simulationResult.scenarios.length}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-2">
                Highest Risk
              </span>
              <p className="text-lg font-bold text-white">
                {highestRiskScenario
                  ? `${highestRiskScenario.risk_score.overall_score.toFixed(1)} / 10`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simulationResult.scenarios.map(sc => {
              const riskLabel = getRiskLabel(sc.risk_score.overall_score);
              return (
                <div
                  key={sc.scenario_id}
                  className="p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-[0_4px_20px_rgba(15,23,42,0.18)]"
                >
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-bold text-white tracking-wide">{sc.name}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-brand-500/10 text-brand-300 border-brand-500/30">
                      {riskLabel} Risk
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-400" /> Est. Downtime
                      </span>
                      <span className="font-mono font-bold text-white">
                        {sc.estimated_downtime_hours} hrs
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-accent-emerald" /> Financial Impact
                      </span>
                      <span className="font-mono font-bold text-white">
                        ${sc.estimated_cost_usd.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" /> Safety Level
                      </span>
                      <span className="font-mono font-bold text-white">{sc.safety_level}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] block mb-2">
                        Risk Profile
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary)]">
                        <span>Overall: {sc.risk_score.overall_score.toFixed(1)}</span>
                        <span>Safety: {sc.risk_score.safety_risk.toFixed(1)}</span>
                        <span>Ops: {sc.risk_score.operational_risk.toFixed(1)}</span>
                        <span>Financial: {sc.risk_score.financial_risk.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] block mb-2">
                        Failure Cascade Path
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sc.propagation_path.map((node, index) => (
                          <span
                            key={`${sc.scenario_id}-${index}`}
                            className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[10px] font-mono text-[var(--text-secondary)]"
                          >
                            {node.id || node.node_id || Object.values(node).join(' -> ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                      <span className="text-[var(--text-secondary)] block mb-2 flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-accent-purple" /> Affected Assets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sc.affected_assets.map(asset => (
                          <span
                            key={`${sc.scenario_id}-${asset}`}
                            className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[10px] font-mono text-[var(--text-secondary)]"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/dashboard/decision')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all group"
            >
              <span>Ask Copilot for Mitigation Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      ) : (
        <SectionCard
          title="No Live Simulation Yet"
          subtitle="Run a scenario to populate maintenance intelligence from the backend"
        >
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
            No simulation result is loaded for this session yet.
          </div>
        </SectionCard>
      )}
    </div>
  );
};
