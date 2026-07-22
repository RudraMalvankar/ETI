import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Lightbulb,
  TrendingUp,
  AlertOctagon,
  Clock,
  Search,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { getIncidents, searchMemory, getMemoryTrends } from '../services/apexServices';
import { IncidentMemory, TrendAnalysis } from '../types/apex';
import { useApexStore } from '../store/useApexStore';
import { useNavigate } from 'react-router-dom';

const EMPTY_TRENDS: TrendAnalysis = {
  total_incidents: 0,
  most_common_failure_type: 'N/A',
  most_vulnerable_asset: 'N/A',
  failure_distribution: {},
  asset_vulnerability_ranking: {},
  resolution_rate: 100,
};

export const MemoryPage: React.FC = () => {
  const { setCurrentMemory } = useApexStore();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentMemory[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis>(EMPTY_TRENDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const [list, trendData] = await Promise.all([getIncidents(), getMemoryTrends()]);
      setIncidents(list || []);
      setTrends({ ...EMPTY_TRENDS, ...(trendData || {}) });
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to load operational memory.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      await fetchMemory();
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchMemory(searchQuery);
      setIncidents(res || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Memory search failed.';
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  const preventiveInsight = useMemo(() => {
    if (!trends.total_incidents) {
      return 'No historical incidents are stored yet. Persist completed incidents to build organizational lessons learned.';
    }

    return `Most common stored failure: ${trends.most_common_failure_type.replace(/_/g, ' ')}. Most exposed asset: ${trends.most_vulnerable_asset}. Current backend resolution rate: ${trends.resolution_rate}%.`;
  }, [trends]);

  const pieColors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
  const failurePieData = Object.entries(trends.failure_distribution || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));
  const assetBarData = Object.entries(trends.asset_vulnerability_ranking || {}).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Failure Intelligence & Lessons Learned"
        description="Stored incident histories, backend trend analysis, and searchable organizational operational memory."
        icon={Database}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-[40px] group-hover:bg-brand-500/20 transition-all" />
          <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1 block">
            Analyzed Incidents
          </span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-white">{trends.total_incidents}</span>
            <TrendingUp className="w-4 h-4 text-accent-emerald mb-2" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-red/10 rounded-full blur-[40px] group-hover:bg-accent-red/20 transition-all" />
          <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1 block">
            Primary Root Cause
          </span>
          <div className="flex items-center gap-2 mt-1">
            <AlertOctagon className="w-5 h-5 text-accent-red" />
            <span className="text-lg font-bold text-white capitalize truncate">
              {trends.most_common_failure_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-accent-amber/5 border border-accent-amber/20 relative overflow-hidden group col-span-1 lg:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-accent-amber" />
            <span className="text-[10px] text-accent-amber font-bold uppercase tracking-wider">
              Data-Backed Preventive Insight
            </span>
          </div>
          <p className="text-xs text-white leading-relaxed">{preventiveInsight}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Historical Failure Distribution"
          subtitle="Breakdown from stored operational incidents"
        >
          <div className="h-[250px] w-full">
            {failurePieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={failurePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {failurePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-secondary)]">
                No failure distribution data available yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Asset Vulnerability Heatmap"
          subtitle="Most frequently affected assets in stored incidents"
        >
          <div className="h-[250px] w-full pt-4">
            {assetBarData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assetBarData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-secondary)]">
                No asset vulnerability ranking is available yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Failure Memory Database"
        subtitle="Search stored incidents, resolutions, and audit-ready traces"
      >
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by asset ID, failure type, or outcome..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white font-bold text-xs transition-colors whitespace-nowrap"
          >
            {isSearching ? 'Searching...' : 'Search Database'}
          </button>
        </form>

        {isLoading ? (
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
            Loading operational memory...
          </div>
        ) : incidents.length ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {incidents.map(inc => (
              <div
                key={inc.incident_id}
                onClick={() => {
                  setCurrentMemory(inc);
                  navigate('/dashboard/compliance');
                }}
                className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] hover:border-brand-500/40 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-extrabold text-white text-sm bg-[var(--bg-secondary)] px-2 py-0.5 rounded">
                      {inc.failed_asset}
                    </span>
                    <StatusBadge status={inc.failure_type} size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Resolution: <span className="text-accent-emerald font-semibold">{inc.outcome}</span>
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {new Date(inc.timestamp).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] group-hover:bg-brand-500/10 text-[var(--text-secondary)] group-hover:text-brand-400 text-[10px] font-bold transition-colors">
                    View Audit Report <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
            No incidents are stored in operational memory yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
};
