import React, { useState, useEffect } from 'react';
import { History, Eye } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { getIncidents } from '../services/apexServices';
import { IncidentMemory } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const IncidentHistoryPage: React.FC = () => {
  const { setCurrentMemory, setActiveTab } = useApexStore();
  const [incidents, setIncidents] = useState<IncidentMemory[]>([
    {
      incident_id: '73700122-6f01-4ce0-838f-44fcc9b398dc',
      failed_asset: 'P-101',
      failure_type: 'bearing_overheat',
      graph_snapshot: { nodes_count: 5 },
      simulation_data: { scenarios_count: 3 },
      decision_data: { strategy: 'Isolate P-101' },
      runbook_history: [{ title: 'Isolate V-202' }],
      technician_feedback: ['Valve handwheel stuck'],
      outcome: 'Resolved with Pneumatic Bypass',
      timestamp: new Date().toISOString()
    },
    {
      incident_id: '955d8046-60a1-49fd-ab55-698e769a9306',
      failed_asset: 'COMP-301',
      failure_type: 'seal_leak',
      graph_snapshot: { nodes_count: 4 },
      simulation_data: { scenarios_count: 3 },
      decision_data: { strategy: 'Contain Gas Line' },
      runbook_history: [{ title: 'Seal Leak Containment' }],
      technician_feedback: ['Nominal seal replaced'],
      outcome: 'Resolved',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getIncidents()
      .then((data) => {
        if (data && data.length > 0) setIncidents(data);
      })
      .catch(() => {});
  }, []);

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.failed_asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.failure_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.outcome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<IncidentMemory>[] = [
    {
      header: 'Incident ID',
      accessor: (inc) => <span className="font-mono text-xs font-bold text-blue-400">{inc.incident_id.slice(0, 8)}...</span>
    },
    {
      header: 'Target Asset',
      accessor: (inc) => <span className="font-bold text-white">{inc.failed_asset}</span>
    },
    {
      header: 'Failure Mode',
      accessor: (inc) => <StatusBadge status={inc.failure_type} />
    },
    {
      header: 'Final Outcome',
      accessor: (inc) => <span className="font-semibold text-emerald-400">{inc.outcome}</span>
    },
    {
      header: 'Logged Date',
      accessor: (inc) => <span className="font-mono text-xs text-slate-400">{new Date(inc.timestamp).toLocaleString()}</span>
    },
    {
      header: 'Action',
      accessor: (inc) => (
        <button
          onClick={() => {
            setCurrentMemory(inc);
            setActiveTab('compliance');
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Restore Context</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident History Audit Registry"
        description="Comprehensive audit ledger recording every historical incident, root cause, decision trace, and final outcome."
        icon={History}
      />

      <SectionCard title="All Recorded Incidents" subtitle="Click any row to restore incident context and compliance report">
        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Filter incidents by asset, failure type, or outcome..." />
        </div>
        <DataTable
          columns={columns}
          data={filteredIncidents}
          onRowClick={(inc) => {
            setCurrentMemory(inc);
            setActiveTab('compliance');
          }}
        />
      </SectionCard>
    </div>
  );
};
