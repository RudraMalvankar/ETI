import React, { useEffect, useMemo, useState } from 'react';
import { Tag, FileText, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApexStore } from '../../store/useApexStore';
import { getDocumentDetails } from '../../services/apexServices';
import { IngestedChunk } from '../../types/apex';

interface DerivedEntity {
  id: string;
  tag: string;
  type: string;
  spec: string;
  doc: string;
  reg: string;
}

function deriveEntities(filename: string, chunks: IngestedChunk[]): DerivedEntity[] {
  const seen = new Set<string>();
  const entities: DerivedEntity[] = [];

  for (const chunk of chunks) {
    const tag = chunk.asset_id || chunk.title || chunk.section || chunk.chunk_id.slice(0, 8);
    if (seen.has(tag)) continue;
    seen.add(tag);

    const metadataSummary = chunk.metadata
      ? Object.entries(chunk.metadata)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(', ')
      : '';

    entities.push({
      id: chunk.chunk_id,
      tag,
      type: chunk.section || chunk.title || 'Document Chunk',
      spec: chunk.text.slice(0, 120) + (chunk.text.length > 120 ? '...' : ''),
      doc: filename,
      reg: metadataSummary || 'No regulatory metadata extracted',
    });
  }

  return entities.slice(0, 12);
}

export const TagEntityInspector: React.FC = () => {
  const { isTagInspectorOpen, toggleTagInspector, activeDocument } = useApexStore();
  const [entities, setEntities] = useState<DerivedEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isTagInspectorOpen || !activeDocument?.document_id) {
      setEntities([]);
      return;
    }

    setIsLoading(true);
    getDocumentDetails(activeDocument.document_id)
      .then(document => {
        setEntities(deriveEntities(document.filename, document.chunks || []));
      })
      .catch((error: any) => {
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to inspect document entities.';
        toast.error(message);
        setEntities([]);
      })
      .finally(() => setIsLoading(false));
  }, [activeDocument?.document_id, isTagInspectorOpen]);

  const activeLabel = useMemo(() => activeDocument?.filename || 'No active document', [activeDocument?.filename]);

  if (!isTagInspectorOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0D131F] border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft select-none">
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

      <div className="p-4 bg-indigo-950/30 border-b border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
            ACTIVE DOCUMENT
          </span>
        </div>
        <p className="text-xs font-semibold text-white mb-1">{activeLabel}</p>
        <p className="text-[11px] text-slate-400 font-mono">
          {activeDocument?.document_id || 'Open this panel after selecting or uploading a document.'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
          Extracted Plant Entities ({entities.length})
        </div>

        {isLoading ? (
          <div className="p-3 rounded-lg bg-[#151D2A] border border-slate-800 text-xs text-slate-400">
            Loading extracted entities from the active document...
          </div>
        ) : entities.length ? (
          entities.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-lg border text-xs transition-all bg-[#151D2A] border-slate-800 text-slate-300 hover:border-slate-700"
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
          ))
        ) : (
          <div className="p-3 rounded-lg bg-[#151D2A] border border-slate-800 text-xs text-slate-400">
            No extracted entities are available yet. Upload and index a document first, then reopen this panel.
          </div>
        )}
      </div>

      <div className="p-3 bg-[#111827] border-t border-slate-800 text-[10px] font-mono text-slate-400 text-center">
        Live document-derived entity inspection
      </div>
    </div>
  );
};
