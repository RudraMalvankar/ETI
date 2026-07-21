import React, { useState, useEffect } from 'react';
import { Database, ArrowRight, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { SearchBar } from '../components/common/SearchBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { storeMemory, getIncidents, searchMemory, getMemoryTrends } from '../services/apexServices';
import { IncidentMemory, TrendAnalysis } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const MemoryPage: React.FC = () => {
  const { activeAssetId, activeFailureType, currentSimulation, currentRunbook, currentDecision, setCurrentMemory, setActiveTab } = useApexStore();
  const [incidents, setIncidents] = useState<IncidentMemory[]>([
    {
      incident_id: '73700122-6f01-4ce0-838f-44fcc9b398dc',
      failed_asset: 'P-101',
      failure_type: 'bearing_overheat',
      graph_snapshot: { nodes_count: 5, edges_count: 4 },
      simulation_data: { scenarios_count: 3 },
      decision_data: { strategy: 'Isolate P-101' },
      runbook_history: [{ title: 'Isolate V-202' }],
      technician_feedback: ['Valve V-202 handwheel stuck'],
      outcome: 'Resolved with Pneumatic Bypass',
      timestamp: new Date().toISOString()
    }
  ]);

  const [trends, setTrends] = useState<TrendAnalysis>({
    total_incidents: 4,
    most_common_failure_type: 'bearing_overheat',
    most_vulnerable_asset: 'P-101',
    failure_distribution: { bearing_overheat: 2, seal_leak: 1, mechanical_failure: 1 },
    asset_vulnerability_ranking: { 'P-101': 2, 'V-202': 1, 'COMP-301': 1 },
    resolution_rate: 100.0
  });

  const [searchQuery, setSearchQuery] = useState('P-101 bearing overheat');
  const [isStoring, setIsStoring] = useState(false);

  const fetchMemory = async () => {
    try {
      const list = await getIncidents();
      if (list && list.length > 0) setIncidents(list);
      const tr = await getMemoryTrends();
      if (tr) setTrends(tr);
    } catch (e) {
      // Keep demo memory
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleStore = async () => {
    setIsStoring(true);
    try {
      const saved = await storeMemory({
        failed_asset: activeAssetId,
        failure_type: activeFailureType,
        simulation_id: currentSimulation?.simulation_id,
        runbook_id: currentRunbook?.runbook_id,
        decision_data: currentDecision,
        outcome: 'Resolved with Pneumatic Bypass'
      });
      if (saved) {
        setIncidents((prev) => [saved, ...prev]);
        setCurrentMemory(saved);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsStoring(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await searchMemory(searchQuery);
      if (res && res.length > 0) setIncidents(res);
    } catch (e) {
      // Fallback
    }
  };

  const pieColors = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

  const failurePieData = Object.entries(trends.failure_distribution || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  const assetBarData = Object.entries(trends.asset_vulnerability_ranking || {}).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Memory Engine"
        description="Enterprise memory persistence storing incident histories, graph topology snapshots, simulation logs, and organizational trends."
        icon={Database}
        actions={
          <button
            onClick={handleStore}
            disabled={isStoring}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Store Current Incident</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Stored Memories</span>
          <span className="text-2xl font-bold text-white">{trends.total_incidents} Incidents</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Most Common Failure</span>
          <span className="text-xl font-bold text-amber-400 capitalize">{trends.most_common_failure_type.replace('_', ' ')}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Most Vulnerable Asset</span>
          <span className="text-xl font-bold text-red-400">{trends.most_vulnerable_asset}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Resolution Rate</span>
          <span className="text-2xl font-bold text-emerald-400">{trends.resolution_rate}%</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Failure Mode Distribution">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={failurePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {failurePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Asset Vulnerability Ranking">
          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetBarData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Historical Incident Search & List */}
      <SectionCard title="Historical Memory Search & Lookup" subtitle="Find similar past incidents (<100ms)">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} placeholder="Search memory by asset, failure type, or outcome..." />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
          >
            Search Memory
          </button>
        </div>

        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.incident_id}
              onClick={() => {
                setCurrentMemory(inc);
                setActiveTab('compliance');
              }}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{inc.failed_asset}</span>
                  <StatusBadge status={inc.failure_type} size="sm" />
                  <span className="text-xs text-slate-500 font-mono">ID: {inc.incident_id.slice(0, 8)}</span>
                </div>
                <p className="text-xs text-slate-400">Outcome: <span className="text-emerald-400 font-semibold">{inc.outcome}</span></p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500">{new Date(inc.timestamp).toLocaleString()}</span>
                <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold">
                  Open Audit Report &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Action to proceed to Compliance */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab('compliance')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
        >
          <span>Generate Enterprise Compliance Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
