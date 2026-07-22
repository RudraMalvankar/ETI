import React, { useState } from 'react';
import { X, Bot, Sparkles, FileText, Send } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';
import { apexApi } from '../../services/api';

export const ExpertCopilotDrawer: React.FC = () => {
  const { isCopilotOpen, toggleCopilot } = useApexStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    query: string;
    answer: string;
    confidence: number;
    citations: Array<{ document: string; section: string; page: number }>;
  } | null>(null);

  if (!isCopilotOpen) return null;

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    const data = await apexApi.searchCopilot(q);
    setResult(data);
    setLoading(false);
  };

  const sampleQueries = [
    'R-101 Pressure Limit',
    'Valve V-102 Overrides',
    'OISD-117 Safety Rules',
    'Pump P-202A Cooling Rate',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0D131F] border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">Expert Knowledge Copilot</h2>
            <p className="text-[10px] text-slate-400 font-inter">
              RAG Industrial Intelligence Engine
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleCopilot(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Query Pills */}
      <div className="p-3 bg-[#151D2A] border-b border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
          Quick Search Topics
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map(sq => (
            <button
              key={sq}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-[#0D131F]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about equipment, SOPs, or compliance..."
            className="w-full bg-[#151D2A] text-white text-xs rounded-lg pl-3 pr-10 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {result ? (
          <div className="space-y-3 animate-fadeIn">
            {/* Confidence Score Pill */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Query: "{result.query}"</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {(result.confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>

            {/* AI Response Card */}
            <div className="p-3.5 rounded-xl bg-[#151D2A] border border-slate-700 text-xs text-slate-200 leading-relaxed font-inter">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>APEX RAG Insights:</span>
              </div>
              <p>{result.answer}</p>
            </div>

            {/* Citations List */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified RAG Citations ({result.citations.length})</span>
              </div>
              {result.citations.map((cite, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                >
                  <div className="text-blue-300 font-semibold truncate">{cite.document}</div>
                  <div className="text-slate-400 text-[11px] truncate">
                    {cite.section} • Page {cite.page}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
            <Bot className="w-10 h-10 mb-2 text-slate-600" />
            <p>
              Type a query or select a topic above to query the APEX RAG Knowledge Base across
              P&IDs, OEM manuals, and compliance codes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
