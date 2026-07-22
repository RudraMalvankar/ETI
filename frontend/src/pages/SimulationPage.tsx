import React, { useState } from 'react';
import { Play, Clock, Wrench, TrendingDown, ArrowRight } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { runSimulation } from '../services/apexServices';
import { SimulationResponse } from '../types/apex';
import { useApexStore } from '../store/useApexStore';
import { useNavigate } from 'react-router-dom';

export const SimulationPage: React.FC = () => {
  const {
    activeAssetId,
    setActiveAssetId,
    activeFailureType,
    setActiveFailureType,
    setCurrentSimulation,
  } = useApexStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [simulationResult, setSimulationResult] = useState<SimulationResponse>({
    simulation_id: 'sim-demo-101',
    failed_asset: activeAssetId,
    failure_type: activeFailureType,
    scenarios: [
      {
        name: 'Immediate Mitigation',
        affected_assets: ['P-101', 'V-202'],
        estimated_downtime_hours: 1.2,
        estimated_cost_usd: 1800,
        risk_level: 'Low',
        propagation_path: ['P-101', 'V-202'],
      },
      {
        name: 'Deferred Maintenance',
        affected_assets: ['P-101', 'V-202', 'HE-303'],
        estimated_downtime_hours: 4.5,
        estimated_cost_usd: 8500,
        risk_level: 'Medium',
        propagation_path: ['P-101', 'V-202', 'HE-303'],
      },
      {
        name: 'Run to Failure',
        affected_assets: ['P-101', 'V-202', 'HE-303', 'PL-505'],
        estimated_downtime_hours: 18.0,
        estimated_cost_usd: 45000,
        risk_level: 'Critical',
        propagation_path: ['P-101', 'V-202', 'HE-303', 'PL-505'],
      },
    ],
    timestamp: new Date().toISOString(),
  });

  const handleRunSim = async () => {
    setIsLoading(true);
    try {
      const res = await runSimulation(activeAssetId, activeFailureType);
      if (res) {
        setSimulationResult(res);
        setCurrentSimulation(res);
      }
    } catch (e) {
      // Keep state if offline
    } finally {
      setIsLoading(false);
    }
  };

  const degradationData = [
    { day: 'Day 1', health: 100 },
    { day: 'Day 15', health: 98 },
    { day: 'Day 30', health: 94 },
    { day: 'Day 45', health: 85 },
    { day: 'Day 60', health: 72 },
    { day: 'Day 75', health: 55 },
    { day: 'Day 90', health: 30 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Maintenance Intelligence"
        description="Predictive maintenance, remaining useful life (RUL), and AI-driven root cause analysis powered by Monte Carlo shadow simulation."
        icon={Wrench}
      />

      {/* Asset Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-accent-red flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <span className="text-3xl font-extrabold text-white">
              42<span className="text-sm">%</span>
            </span>
            <div className="absolute inset-0 rounded-full border-4 border-accent-red animate-ping opacity-20" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Remaining Useful Life</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Critical threshold reached</p>
        </div>

        <div className="md:col-span-3">
          <SectionCard
            title="Predictive Degradation Curve"
            subtitle="AI forecast based on current telemetry"
          >
            <div className="h-[180px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={degradationData}>
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#0EA5E9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="health"
                    stroke="#0EA5E9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0EA5E9' }}
                    activeDot={{ r: 6, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Control Panel */}
      <SectionCard
        title="Shadow Simulation Parameters"
        subtitle="Configure Monte Carlo risk scenarios"
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

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {simulationResult.scenarios.map((sc, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 ${
              idx === 0
                ? 'bg-gradient-to-b from-accent-emerald/10 to-transparent border-accent-emerald/30 shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                : idx === 1
                  ? 'bg-gradient-to-b from-accent-amber/10 to-transparent border-accent-amber/30 shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
                  : 'bg-gradient-to-b from-accent-red/10 to-transparent border-accent-red/30 shadow-[0_4px_20px_rgba(239,68,68,0.1)]'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-bold text-white tracking-wide">{sc.name}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  idx === 0
                    ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30'
                    : idx === 1
                      ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/30'
                      : 'bg-accent-red/20 text-accent-red border-accent-red/30'
                }`}
              >
                {sc.risk_level} Risk
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

              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] block mb-2">
                  Failure Cascade Path
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sc.propagation_path.map((node, nIdx) => (
                    <span
                      key={nIdx}
                      className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[10px] font-mono text-[var(--text-secondary)]"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action to proceed to Copilot */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/dashboard/decision')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all group"
        >
          <span>Ask Copilot for Mitigation Plan</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
