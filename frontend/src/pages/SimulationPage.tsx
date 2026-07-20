import React, { useState } from 'react';
import { Activity, Play, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { runSimulation } from '../services/apexServices';
import { SimulationResponse } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const SimulationPage: React.FC = () => {
  const { activeAssetId, setActiveAssetId, activeFailureType, setActiveFailureType, setCurrentSimulation, setActiveTab } = useApexStore();
  const [isLoading, setIsLoading] = useState(false);

  const [simulationResult, setSimulationResult] = useState<SimulationResponse>({
    simulation_id: 'sim-demo-101',
    failed_asset: activeAssetId,
    failure_type: activeFailureType,
    scenarios: [
      {
        name: 'Best Case (Immediate Isolation)',
        affected_assets: ['P-101', 'V-202'],
        estimated_downtime_hours: 1.2,
        estimated_cost_usd: 1800,
        risk_level: 'Low',
        propagation_path: ['P-101', 'V-202']
      },
      {
        name: 'Expected Case (Standard Repair)',
        affected_assets: ['P-101', 'V-202', 'HE-303'],
        estimated_downtime_hours: 4.5,
        estimated_cost_usd: 8500,
        risk_level: 'Medium',
        propagation_path: ['P-101', 'V-202', 'HE-303']
      },
      {
        name: 'Worst Case (Cascade Failure)',
        affected_assets: ['P-101', 'V-202', 'HE-303', 'PL-505'],
        estimated_downtime_hours: 18.0,
        estimated_cost_usd: 45000,
        risk_level: 'Critical',
        propagation_path: ['P-101', 'V-202', 'HE-303', 'PL-505']
      }
    ],
    timestamp: new Date().toISOString()
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

  const chartData = simulationResult.scenarios.map((sc) => ({
    name: sc.name.split(' ')[0],
    cost: sc.estimated_cost_usd,
    downtime: sc.estimated_downtime_hours,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shadow Simulation Engine"
        description="Monte Carlo failure propagation modeling across Best, Expected, and Worst Case scenarios."
        icon={Activity}
      />

      {/* Control Panel */}
      <SectionCard title="Simulation Control Parameters" subtitle="Select target asset and failure mode">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Asset ID</label>
            <select
              value={activeAssetId}
              onChange={(e) => setActiveAssetId(e.target.value)}
              className="w-full p-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="P-101">P-101 (Centrifugal Pump)</option>
              <option value="V-202">V-202 (Isolation Valve)</option>
              <option value="HE-303">HE-303 (Heat Exchanger)</option>
              <option value="COMP-301">COMP-301 (Gas Compressor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Failure Mode Type</label>
            <select
              value={activeFailureType}
              onChange={(e) => setActiveFailureType(e.target.value)}
              className="w-full p-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="bearing_overheat">Bearing Overheat</option>
              <option value="mechanical_failure">Mechanical Seal Failure</option>
              <option value="seal_leak">High Pressure Leak</option>
              <option value="electrical_short">Motor Winding Fault</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSim}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
            >
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Execute Shadow Simulation</span>
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {simulationResult.scenarios.map((sc, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
              idx === 0
                ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/30 shadow-emerald-500/5'
                : idx === 1
                ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 shadow-amber-500/5'
                : 'bg-gradient-to-b from-red-500/10 to-transparent border-red-500/30 shadow-red-500/5'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-white tracking-wide">{sc.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                idx === 1 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {sc.risk_level}
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> Downtime</span>
                <span className="font-mono font-bold text-white">{sc.estimated_downtime_hours} hrs</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimated Cost</span>
                <span className="font-mono font-bold text-white">${sc.estimated_cost_usd.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Propagation Path</span>
                <div className="flex flex-wrap gap-1">
                  {sc.propagation_path.map((node, nIdx) => (
                    <span key={nIdx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-200">
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial & Downtime Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Scenario Financial Impact Comparison ($ USD)">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Estimated Downtime Duration (Hours)">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="downtime" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Action to proceed to Decision */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab('decision')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
        >
          <span>Evaluate AI Decision for Best Case</span>
        </button>
      </div>
    </div>
  );
};
