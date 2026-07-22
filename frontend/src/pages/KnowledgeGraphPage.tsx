import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  EdgeChange,
  MarkerType,
  Node,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Search, AlertTriangle, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApexStore } from '../store/useApexStore';
import {
  getBlastRadius,
  getGraph,
  getGraphNode,
  getGraphStatistics,
} from '../services/apexServices';

type GraphFilter = 'All' | 'Critical' | 'Valves' | 'Pumps';

interface GraphNodeDetails {
  status?: string;
  asset_type?: string;
  telemetry_snapshot?: Record<string, any>;
  metadata?: Record<string, any>;
  criticality?: string;
  asset_id?: string;
  node_id?: string;
}

const filters: GraphFilter[] = ['All', 'Critical', 'Valves', 'Pumps'];

function statusColor(status?: string) {
  if (!status) return { border: '#475569', color: '#cbd5e1', background: '#0f172a' };
  const lower = status.toLowerCase();
  if (lower.includes('critical') || lower.includes('failed')) {
    return { border: '#ef4444', color: '#f87171', background: '#1f1115' };
  }
  if (lower.includes('warn')) {
    return { border: '#f59e0b', color: '#fbbf24', background: '#1e1b12' };
  }
  return { border: '#10b981', color: '#34d399', background: '#0f172a' };
}

function mapBackendNodeToFlowNode(
  node: Record<string, any>,
  index: number,
  total: number
): Node {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const radius = 220;
  const colors = statusColor(node.status);
  const assetLabel = node.asset_id || node.id || node.node_id || `Node-${index + 1}`;
  const assetType = node.asset_type || node.type || 'Asset';
  return {
    id: String(node.id || node.node_id || node.asset_id || `node-${index}`),
    type: 'default',
    position: {
      x: 320 + Math.cos(angle) * radius,
      y: 250 + Math.sin(angle) * radius,
    },
    data: {
      label: `${assetLabel} (${assetType})`,
      assetType,
      status: node.status || 'operational',
      metadata: JSON.stringify(node.telemetry_snapshot || node.metadata || {}, null, 2),
    },
    style: {
      background: colors.background,
      color: colors.color,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '12px',
      fontWeight: 'bold',
      boxShadow: `0 0 15px ${colors.border}33`,
      minWidth: 170,
    },
  };
}

function mapBackendEdgeToFlowEdge(edge: Record<string, any>, index: number): Edge {
  return {
    id: String(edge.id || edge.edge_id || `edge-${index}`),
    source: String(edge.source),
    target: String(edge.target),
    label: edge.relationship || 'linked_to',
    animated: Boolean(edge.risk_factor && edge.risk_factor > 1),
    style: { stroke: '#3b82f6', strokeWidth: edge.risk_factor ? 1 + edge.risk_factor : 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  };
}

export const KnowledgeGraphPage: React.FC = () => {
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [allEdges, setAllEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<GraphNodeDetails | null>(null);
  const [blastRadius, setBlastRadius] = useState<{
    affected_assets: string[];
    severity: string;
    max_distance: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<GraphFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [graphSummary, setGraphSummary] = useState({
    total_nodes: 0,
    total_edges: 0,
    connected_components: 0,
    density: 0,
  });
  const { setActiveAssetId } = useApexStore();

  const filteredNodes = useMemo(() => {
    return allNodes.filter(node => {
      const assetType = String(node.data.assetType || '').toLowerCase();
      const status = String(node.data.status || '').toLowerCase();
      if (activeFilter === 'Critical') return status.includes('critical') || status.includes('failed');
      if (activeFilter === 'Valves') return assetType.includes('valve');
      if (activeFilter === 'Pumps') return assetType.includes('pump');
      return true;
    });
  }, [activeFilter, allNodes]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(node => node.id)), [filteredNodes]);
  const filteredEdges = useMemo(
    () =>
      allEdges.filter(edge => filteredNodeIds.has(String(edge.source)) && filteredNodeIds.has(String(edge.target))),
    [allEdges, filteredNodeIds]
  );

  const fetchGraphData = async () => {
    setIsLoading(true);
    try {
      const [graphData, stats] = await Promise.all([getGraph(), getGraphStatistics()]);
      const backendNodes = (graphData as any).nodes || [];
      const backendEdges = (graphData as any).links || (graphData as any).edges || [];
      const mappedNodes = backendNodes.map((node: Record<string, any>, index: number) =>
        mapBackendNodeToFlowNode(node, index, backendNodes.length)
      );
      const mappedEdges = backendEdges.map((edge: Record<string, any>, index: number) =>
        mapBackendEdgeToFlowEdge(edge, index)
      );
      setAllNodes(mappedNodes);
      setAllEdges(mappedEdges);
      setSelectedNode(mappedNodes[0] || null);
      if (mappedNodes[0]) {
        setActiveAssetId(mappedNodes[0].id);
      }
      setGraphSummary(stats);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to load knowledge graph.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeDetails(null);
      setBlastRadius(null);
      return;
    }

    setActiveAssetId(selectedNode.id);

    Promise.allSettled([getGraphNode(selectedNode.id), getBlastRadius(selectedNode.id)]).then(results => {
      const [nodeResult, blastResult] = results;
      if (nodeResult.status === 'fulfilled') {
        setSelectedNodeDetails(nodeResult.value as GraphNodeDetails);
      } else {
        setSelectedNodeDetails(null);
      }

      if (blastResult.status === 'fulfilled') {
        setBlastRadius({
          affected_assets: blastResult.value.affected_assets,
          severity: blastResult.value.severity,
          max_distance: blastResult.value.max_distance,
        });
      } else {
        setBlastRadius(null);
      }
    });
  }, [selectedNode, setActiveAssetId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setAllNodes(nds => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setAllEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  const handleSearchNode = () => {
    if (!searchQuery.trim()) return;
    const found = allNodes.find(
      node =>
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(node.data.label).toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedNode(found);
    } else {
      toast.message('No graph node matched that search.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Knowledge Graph Explorer"
        description="Live graph topology, node inspection, and blast-radius context from the backend graph services."
        icon={Network}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 w-4 h-4 text-[var(--text-secondary)] top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchNode()}
              placeholder="Search asset (e.g. P-101)..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] text-white placeholder-[var(--text-secondary)] text-xs rounded-xl border border-[var(--glass-border)] focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--glass-border)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)] ml-2" />
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  activeFilter === filter
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[var(--text-secondary)]">
            {graphSummary.total_nodes} nodes • {graphSummary.total_edges} edges
          </div>
          <button
            onClick={fetchGraphData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-white text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] rounded-3xl border border-[var(--glass-border)] bg-[#0B0F17] overflow-hidden relative shadow-2xl">
          {filteredNodes.length ? (
            <ReactFlow
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => setSelectedNode(node)}
              fitView
            >
              <Background color="#1e293b" gap={20} />
              <Controls className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl overflow-hidden shadow-xl" />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-[var(--text-secondary)]">
              {isLoading ? 'Loading graph topology...' : 'No graph data is available for the current filter.'}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SectionCard title="Asset Inspector" subtitle="Live metadata and blast-radius context" className="h-full">
            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)] block text-[10px] uppercase font-mono mb-1">
                    Selected Asset ID
                  </span>
                  <span className="text-xl font-extrabold text-white block mt-0.5">{selectedNode.id}</span>
                  <span className="text-xs text-brand-400 block mt-1">{String(selectedNode.data.label)}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)]">Asset Type</span>
                  <span className="font-bold text-white">
                    {selectedNodeDetails?.asset_type || String(selectedNode.data.assetType)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)]">Current Status</span>
                  <StatusBadge status={selectedNodeDetails?.status || String(selectedNode.data.status)} />
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)] block mb-2 font-medium">
                    Telemetry / Metadata
                  </span>
                  <div className="bg-[#0B0F17] p-3 rounded-lg border border-[var(--glass-border)]">
                    <pre className="font-mono text-accent-emerald text-[11px] whitespace-pre-wrap break-words leading-relaxed">
                      {JSON.stringify(
                        selectedNodeDetails?.telemetry_snapshot ||
                          selectedNodeDetails?.metadata ||
                          {},
                        null,
                        2
                      ) || 'No metadata available'}
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)] block mb-2 font-medium">
                    Graph Summary
                  </span>
                  <div className="space-y-2 text-[11px] text-[var(--text-secondary)]">
                    <div className="flex justify-between">
                      <span>Connected Components</span>
                      <span className="text-white">{graphSummary.connected_components}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Density</span>
                      <span className="text-white">{graphSummary.density.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                {blastRadius && (
                  <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red mt-6">
                    <div className="flex items-center gap-2 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4 text-accent-red" />
                      <span>Blast Radius Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-200">
                      Severity <strong className="text-white">{blastRadius.severity}</strong> across depth{' '}
                      <strong className="text-white">{blastRadius.max_distance}</strong>. Affected assets:{' '}
                      <strong className="text-white">
                        {blastRadius.affected_assets.join(', ') || 'None'}
                      </strong>
                      .
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-[var(--text-secondary)]">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs text-center px-6">
                  Select a graph node to inspect backend metadata and blast-radius context.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
