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
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Search, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApexStore } from '../store/useApexStore';

const initialNodes: Node[] = [
  {
    id: 'P-101',
    type: 'default',
    data: { label: 'P-101 (Centrifugal Pump)', assetType: 'Pump', status: 'critical', metadata: 'Flow Rate: 450 L/min, Temp: 92°C' },
    position: { x: 250, y: 150 },
    style: { background: '#1e1b4b', color: '#f87171', border: '2px solid #ef4444', borderRadius: '12px', padding: '12px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' },
  },
  {
    id: 'V-202',
    type: 'default',
    data: { label: 'V-202 (Inlet Isolation Valve)', assetType: 'Valve', status: 'warning', metadata: 'Pressure: 14.2 bar, Status: Open' },
    position: { x: 550, y: 150 },
    style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '12px', padding: '12px', fontWeight: 'bold' },
  },
  {
    id: 'HE-303',
    type: 'default',
    data: { label: 'HE-303 (Heat Exchanger)', assetType: 'Heat Exchanger', status: 'nominal', metadata: 'Coolant Flow: Nominal' },
    position: { x: 250, y: 350 },
    style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '12px', padding: '12px' },
  },
  {
    id: 'S-404',
    type: 'default',
    data: { label: 'S-404 (Temp Sensor)', assetType: 'Sensor', status: 'nominal', metadata: 'Accuracy: 99.8%' },
    position: { x: 550, y: 350 },
    style: { background: '#0f172a', color: '#34d399', border: '1px solid #059669', borderRadius: '12px', padding: '12px' },
  },
  {
    id: 'PL-505',
    type: 'default',
    data: { label: 'PL-505 (Feeder Pipeline)', assetType: 'Pipeline', status: 'nominal', metadata: 'Diameter: 8 inches' },
    position: { x: 50, y: 250 },
    style: { background: '#0f172a', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '12px', padding: '12px' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-pl-p', source: 'PL-505', target: 'P-101', label: 'supplies_fluid', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-p-v', source: 'P-101', target: 'V-202', label: 'downstream_isolation', animated: true, style: { stroke: '#ef4444', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e-p-he', source: 'P-101', target: 'HE-303', label: 'thermal_exchange', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e-p-s', source: 'P-101', target: 'S-404', label: 'telemetry_monitored', animated: false, style: { stroke: '#10b981', strokeWidth: 1.5 } },
];

export const KnowledgeGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(initialNodes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setActiveAssetId } = useApexStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActiveAssetId(node.id);
  };

  const handleSearchNode = () => {
    if (!searchQuery) return;
    const found = nodes.find(
      (n) => n.id.toLowerCase().includes(searchQuery.toLowerCase()) || n.data.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedNode(found);
      setActiveAssetId(found.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Graph & Blast Radius Engine"
        description="Interactive plant topology graph mapping industrial dependencies, valves, pumps, and downstream risk propagation."
        icon={Network}
      />

      {/* Graph Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchNode()}
              placeholder="Search asset (P-101, V-202)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 text-white placeholder-slate-500 text-xs rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearchNode}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            Locate Asset
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Failed Target</span>
          <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Blast Radius</span>
          <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nominal Node</span>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* React Flow Canvas */}
        <div className="lg:col-span-3 h-[520px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1e293b" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Node Metadata Inspector */}
        <div className="lg:col-span-1">
          <SectionCard title="Asset Inspector" subtitle="Metadata & Blast Radius">
            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Selected Asset ID</span>
                  <span className="text-base font-extrabold text-white block mt-0.5">{selectedNode.id}</span>
                  <span className="text-xs text-slate-300 block mt-1">{selectedNode.data.label}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Asset Type</span>
                  <span className="font-bold text-blue-400">{selectedNode.data.assetType}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Current Status</span>
                  <StatusBadge status={selectedNode.data.status} />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Live Telemetry Metadata</span>
                  <p className="font-mono text-slate-200">{selectedNode.data.metadata}</p>
                </div>

                {selectedNode.id === 'P-101' && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Blast Radius Affected:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Downstream assets V-202 & HE-303 identified within failure propagation depth = 2.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Click any node on the graph to inspect metadata.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
