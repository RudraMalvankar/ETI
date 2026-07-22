import React from 'react';
import { Activity, Cpu, Flame, Layers, ShieldAlert, Zap } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { PlantNode } from '../../services/api';

export const CausalGraphView: React.FC = () => {
  const { nodes, edges, selectedNode, setSelectedNode, isAnomalyActive, isRerouted } =
    useApexStore();

  const getNodeColor = (status: PlantNode['status']) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-950/80',
          border: 'border-red-500',
          glow: 'shadow-red-500/30',
          text: 'text-red-400',
          dot: 'bg-red-500',
        };
      case 'failed':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-600',
          glow: 'shadow-rose-600/30',
          text: 'text-rose-400',
          dot: 'bg-rose-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500',
          glow: 'shadow-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-500',
        };
      case 'isolated':
        return {
          bg: 'bg-slate-900/80',
          border: 'border-slate-700',
          glow: 'shadow-none',
          text: 'text-slate-500',
          dot: 'bg-slate-600',
        };
      case 'nominal':
      default:
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/50',
          glow: 'shadow-emerald-500/10',
          text: 'text-emerald-400',
          dot: 'bg-emerald-500',
        };
    }
  };

  const getNodeIcon = (type: PlantNode['type']) => {
    switch (type) {
      case 'reactor':
        return <Activity className="w-4 h-4" />;
      case 'sensor':
        return <Cpu className="w-4 h-4" />;
      case 'valve':
        return <ShieldAlert className="w-4 h-4" />;
      case 'pump':
        return <Zap className="w-4 h-4" />;
      case 'equipment':
        return <Flame className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#0A0E17] rounded-xl border border-slate-800/80 overflow-hidden flex flex-col select-none">
      {/* Top Overlay Legend */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-[#111827]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800 pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-semibold text-white font-mono">
              Causal Propagation Graph
            </span>
          </div>
          <div className="h-3 w-[1px] bg-slate-700"></div>
          <span className="text-[11px] text-slate-400">
            {isRerouted
              ? 'Blast Radius: Rerouted via Bypass V-108'
              : isAnomalyActive
                ? 'Blast Radius: 3 Assets Impacted'
                : 'Blast Radius: 0 (Nominal)'}
          </span>
        </div>

        {/* Legend Pills */}
        <div className="bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-auto flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Failed/Stuck</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Nominal</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full flex-1 relative overflow-auto ops-grid-bg flex items-center justify-center p-6">
        <svg className="w-full h-[400px] min-w-[700px]">
          <defs>
            {/* Animated Red Gradient for Edge Propagation */}
            <linearGradient id="propGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
            </linearGradient>

            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
            </marker>
            <marker
              id="arrow-red"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
            </marker>
          </defs>

          {/* Render Graph Edges */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isPropagation = edge.status === 'active_propagation';
            const isIsolated = edge.status === 'isolated';

            return (
              <g key={edge.id}>
                {/* Connection Line */}
                <line
                  x1={sourceNode.x + 80}
                  y1={sourceNode.y + 30}
                  x2={targetNode.x + 80}
                  y2={targetNode.y + 30}
                  stroke={isIsolated ? '#334155' : isPropagation ? 'url(#propGradient)' : '#475569'}
                  strokeWidth={isPropagation ? 3 : 2}
                  strokeDasharray={isIsolated ? '4 4' : isPropagation ? '6 3' : 'none'}
                  markerEnd={isPropagation ? 'url(#arrow-red)' : 'url(#arrow)'}
                  className={isPropagation ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}

          {/* Render Graph Nodes */}
          {nodes.map(node => {
            const style = getNodeColor(node.status);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-all duration-200"
              >
                <foreignObject width="180" height="75">
                  <div
                    className={`p-2.5 rounded-xl border transition-all ${style.bg} ${style.border} ${style.glow} shadow-lg ${
                      isSelected
                        ? 'ring-2 ring-blue-400 border-blue-400 scale-105'
                        : 'hover:scale-102 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${style.dot} ${node.status === 'critical' ? 'animate-ping' : ''}`}
                        ></span>
                        <span className={`text-[11px] font-bold font-mono ${style.text}`}>
                          {node.designSpecs?.tag || node.id}
                        </span>
                      </div>
                      <span className="text-slate-400">{getNodeIcon(node.type)}</span>
                    </div>

                    <div className="text-[11px] font-medium text-white truncate font-inter">
                      {node.label}
                    </div>

                    {node.telemetry?.pressure && (
                      <div className="text-[10px] font-mono text-slate-300 mt-1 flex items-center justify-between bg-black/40 px-1.5 py-0.5 rounded">
                        <span>P:</span>
                        <span
                          className={
                            node.status === 'critical' ? 'text-red-400 font-bold' : 'text-slate-300'
                          }
                        >
                          {node.telemetry.pressure}
                        </span>
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector Drawer at Bottom */}
      {selectedNode && (
        <div className="bg-[#111827] border-t border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {getNodeIcon(selectedNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono text-sm">{selectedNode.label}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${getNodeColor(selectedNode.status).text} bg-slate-900 border border-slate-800`}
                >
                  {selectedNode.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Tag: {selectedNode.designSpecs?.tag} | Manual: {selectedNode.designSpecs?.oemManual}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            {selectedNode.telemetry?.pressure && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Pressure: </span>
                <span className="text-amber-400 font-bold">{selectedNode.telemetry.pressure}</span>
              </div>
            )}
            {selectedNode.telemetry?.temperature && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Temp: </span>
                <span className="text-emerald-400 font-bold">
                  {selectedNode.telemetry.temperature}
                </span>
              </div>
            )}
            {selectedNode.telemetry?.flow && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Flow: </span>
                <span className="text-blue-400 font-bold">{selectedNode.telemetry.flow}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
