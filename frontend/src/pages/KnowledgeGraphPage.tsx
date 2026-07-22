import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Search, AlertTriangle, Filter } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApexStore } from '../store/useApexStore';
import { getGraph } from '../services/apexServices';

const initialNodes: Node[] = [
  {
    id: 'P-101',
    type: 'default',
    data: {
      label: 'P-101 (Centrifugal Pump)',
      assetType: 'Pump',
      status: 'critical',
      metadata: 'Flow Rate: 450 L/min, Temp: 92°C',
    },
    position: { x: 250, y: 150 },
    style: {
      background: '#1e1b4b',
      color: '#f87171',
      border: '2px solid #ef4444',
      borderRadius: '12px',
      padding: '12px',
      fontWeight: 'bold',
      boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
    },
  },
  {
    id: 'V-202',
    type: 'default',
    data: {
      label: 'V-202 (Inlet Isolation Valve)',
      assetType: 'Valve',
      status: 'warning',
      metadata: 'Pressure: 14.2 bar, Status: Open',
    },
    position: { x: 550, y: 150 },
    style: {
      background: '#1e293b',
      color: '#fbbf24',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '12px',
      fontWeight: 'bold',
    },
  },
  {
    id: 'HE-303',
    type: 'default',
    data: {
      label: 'HE-303 (Heat Exchanger)',
      assetType: 'Heat Exchanger',
      status: 'nominal',
      metadata: 'Coolant Flow: Nominal',
    },
    position: { x: 250, y: 350 },
    style: {
      background: '#0f172a',
      color: '#38bdf8',
      border: '1px solid #0284c7',
      borderRadius: '12px',
      padding: '12px',
    },
  },
  {
    id: 'S-404',
    type: 'default',
    data: {
      label: 'S-404 (Temp Sensor)',
      assetType: 'Sensor',
      status: 'nominal',
      metadata: 'Accuracy: 99.8%',
    },
    position: { x: 550, y: 350 },
    style: {
      background: '#0f172a',
      color: '#34d399',
      border: '1px solid #059669',
      borderRadius: '12px',
      padding: '12px',
    },
  },
  {
    id: 'PL-505',
    type: 'default',
    data: {
      label: 'PL-505 (Feeder Pipeline)',
      assetType: 'Pipeline',
      status: 'nominal',
      metadata: 'Diameter: 8 inches',
    },
    position: { x: 50, y: 250 },
    style: {
      background: '#0f172a',
      color: '#cbd5e1',
      border: '1px solid #475569',
      borderRadius: '12px',
      padding: '12px',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-pl-p',
    source: 'PL-505',
    target: 'P-101',
    label: 'supplies_fluid',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
  {
    id: 'e-p-v',
    source: 'P-101',
    target: 'V-202',
    label: 'downstream_isolation',
    animated: true,
    style: { stroke: '#ef4444', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },
  {
    id: 'e-p-he',
    source: 'P-101',
    target: 'HE-303',
    label: 'thermal_exchange',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 2 },
  },
  {
    id: 'e-p-s',
    source: 'P-101',
    target: 'S-404',
    label: 'telemetry_monitored',
    animated: false,
    style: { stroke: '#10b981', strokeWidth: 1.5 },
  },
];

export const KnowledgeGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(initialNodes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { setActiveAssetId } = useApexStore();

  const filters = ['All', 'Critical', 'Valves', 'Pumps'];

  const fetchGraphData = async () => {
    try {
      const data = await getGraph();
      if (data && data.nodes && data.nodes.length > 0) {
        // Just mock mapping for real integration
      }
    } catch (e) {
      // Keep demo structure
    }
  };

  React.useEffect(() => {
    fetchGraphData();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActiveAssetId(node.id);
  };

  const handleSearchNode = () => {
    if (!searchQuery) return;
    const found = nodes.find(
      n =>
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedNode(found);
      setActiveAssetId(found.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Knowledge Graph Explorer"
        description="Interactive plant topology mapping operational dependencies, blast radiuses, and live risk states."
        icon={Network}
      />

      {/* Graph Toolbar */}
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

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold bg-[var(--bg-primary)] px-4 py-2 rounded-xl border border-[var(--glass-border)]">
          <span className="flex items-center gap-1.5 text-accent-red">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />{' '}
            Critical
          </span>
          <span className="flex items-center gap-1.5 text-accent-amber">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" /> Warning
          </span>
          <span className="flex items-center gap-1.5 text-accent-emerald">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" /> Nominal
          </span>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* React Flow Canvas */}
        <div className="lg:col-span-3 h-[600px] rounded-3xl border border-[var(--glass-border)] bg-[#0B0F17] overflow-hidden relative shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1e293b" gap={20} />
            <Controls className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl overflow-hidden shadow-xl" />
          </ReactFlow>
        </div>

        {/* Node Metadata Inspector */}
        <div className="lg:col-span-1">
          <SectionCard
            title="Asset Inspector"
            subtitle="Metadata & Blast Radius"
            className="h-full"
          >
            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)] block text-[10px] uppercase font-mono mb-1">
                    Selected Asset ID
                  </span>
                  <span className="text-xl font-extrabold text-white block">{selectedNode.id}</span>
                  <span className="text-xs text-brand-400 block mt-1">
                    {selectedNode.data.label}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)]">Asset Type</span>
                  <span className="font-bold text-white">{selectedNode.data.assetType}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)]">Current Status</span>
                  <StatusBadge status={selectedNode.data.status} />
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                  <span className="text-[var(--text-secondary)] block mb-2 font-medium">
                    Live Telemetry Metadata
                  </span>
                  <div className="bg-[#0B0F17] p-3 rounded-lg border border-[var(--glass-border)]">
                    <p className="font-mono text-accent-emerald text-[11px] leading-loose">
                      {selectedNode.data.metadata}
                    </p>
                  </div>
                </div>

                {selectedNode.id === 'P-101' && (
                  <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red mt-6">
                    <div className="flex items-center gap-2 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4 text-accent-red" />
                      <span>Blast Radius Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-200">
                      Downstream assets{' '}
                      <strong className="text-white bg-accent-red/20 px-1 py-0.5 rounded">
                        V-202
                      </strong>{' '}
                      &{' '}
                      <strong className="text-white bg-accent-red/20 px-1 py-0.5 rounded">
                        HE-303
                      </strong>{' '}
                      identified within failure propagation depth 2. Immediate isolation
                      recommended.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-[var(--text-secondary)]">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs text-center px-6">
                  Select any node on the topology map to inspect its metadata and failure
                  propagation status.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
