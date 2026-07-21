import React from 'react';
import { Tag, FileText, Shield, X } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';

export const TagEntityInspector: React.FC = () => {
  const { isTagInspectorOpen, toggleTagInspector, selectedNode } = useApexStore();

  if (!isTagInspectorOpen) return null;

  const sampleExtractedEntities = [
    { tag: 'R-101', type: 'Reactor', spec: 'Max Working Pressure: 15.0 Bar', doc: 'OEM-R101-REV3.pdf', reg: 'OISD-STD-117 Sec 4.2' },
    { tag: 'V-102', type: 'Emergency Isolation Valve', spec: 'Fail-Closed Pneumatic Actuator', doc: 'VALVE-V102-SPEC.pdf', reg: 'PESO UPV Rule 14' },
    { tag: 'V-108', type: 'Bypass Relief Valve', spec: 'High-Capacity Flare Diverter', doc: 'VALVE-V108-BYPASS.pdf', reg: 'Factory Act Sec 31' },
    { tag: 'P-202A', type: 'Cooling Pump', spec: 'Flow Rating: 600 L/min', doc: 'PUMP-P202A-OEM.pdf', reg: 'OISD-STD-117 Sec 8.1' },
    { tag: 'PT-401', type: 'Pressure Transmitter', spec: 'Range: 0-30 Bar SIL-2 Rated', doc: 'SENS-PT401.pdf', reg: 'PESO UPV Schedule VI' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0D131F] border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white font-display">Entity Extractor & Tag Knowledge</h2>
        </div>
        <button 
          onClick={() => toggleTagInspector(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Tag Active Highlight */}
      {selectedNode && (
        <div className="p-4 bg-indigo-950/30 border-b border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
              ACTIVE TAG: {selectedNode.designSpecs?.tag || selectedNode.id}
            </span>
          </div>
          <p className="text-xs font-semibold text-white mb-1">{selectedNode.label}</p>
          <p className="text-[11px] text-slate-400 font-mono">Document Link: {selectedNode.designSpecs?.oemManual}</p>
        </div>
      )}

      {/* Extracted Entities List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
          Extracted Plant Entities ({sampleExtractedEntities.length})
        </div>

        {sampleExtractedEntities.map((item) => (
          <div 
            key={item.tag}
            className={`p-3 rounded-lg border text-xs transition-all ${
              selectedNode?.designSpecs?.tag === item.tag
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                : 'bg-[#151D2A] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {item.tag}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{item.type}</span>
            </div>

            <p className="text-slate-200 font-medium mb-2">{item.spec}</p>

            <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-400" />
                <span className="truncate">{item.doc}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="truncate">{item.reg}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-[#111827] border-t border-slate-800 text-[10px] font-mono text-slate-400 text-center">
        Unified Knowledge Graph Entity Parser v2.4
      </div>
    </div>
  );
};
