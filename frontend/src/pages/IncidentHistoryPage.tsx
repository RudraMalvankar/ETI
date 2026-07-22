import React, { useEffect, useMemo, useState } from 'react';
import { History, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { getIncidents } from '../services/apexServices';
import { IncidentMemory } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const IncidentHistoryPage: React.FC = () => {
  const { setCurrentMemory } = useApexStore();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentMemory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getIncidents()
      .then(data => {
        setIncidents(data || []);
      })
      .catch((error: any) => {
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to load incident history.';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredIncidents = useMemo(
    () =>
      incidents.filter(
        inc =>
          inc.failed_asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.failure_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.outcome.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [incidents, searchQuery]
  );

  const restoreContext = (incident: IncidentMemory) => {
    setCurrentMemory(incident);
    navigate('/dashboard/compliance');
  };

  const columns: Column<IncidentMemory>[] = [
    {
      header: 'Incident ID',
      accessor: inc => (
        <span className="font-mono text-xs font-bold text-blue-400">
          {inc.incident_id.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: 'Target Asset',
      accessor: inc => <span className="font-bold text-white">{inc.failed_asset}</span>,
    },
    {
      header: 'Failure Mode',
      accessor: inc => <StatusBadge status={inc.failure_type} />,
    },
    {
      header: 'Final Outcome',
      accessor: inc => <span className="font-semibold text-emerald-400">{inc.outcome}</span>,
    },
    {
      header: 'Logged Date',
      accessor: inc => (
        <span className="font-mono text-xs text-slate-400">
          {new Date(inc.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: inc => (
        <button
          onClick={() => restoreContext(inc)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Restore Context</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident History Audit Registry"
        description="Stored incident records with searchable operational context and audit restoration."
        icon={History}
      />

      <SectionCard
        title="All Recorded Incidents"
        subtitle="Restore any stored incident into the compliance workflow"
      >
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter incidents by asset, failure type, or outcome..."
          />
        </div>

        {isLoading ? (
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
            Loading incident history...
          </div>
        ) : filteredIncidents.length ? (
          <DataTable columns={columns} data={filteredIncidents} onRowClick={restoreContext} />
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
            No incident history records match the current filter.
          </div>
        )}
      </SectionCard>
    </div>
  );
};
