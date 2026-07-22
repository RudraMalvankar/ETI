import React, { useState } from 'react';
import { X, Bot, Sparkles, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApexStore } from '../../store/useApexStore';
import { vectorSearch } from '../../services/apexServices';
import { SearchResult } from '../../types/apex';

export const ExpertCopilotDrawer: React.FC = () => {
  const { isCopilotOpen, toggleCopilot } = useApexStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  if (!isCopilotOpen) return null;

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await vectorSearch(q, 5);
      setResults(data.results || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Copilot search failed.';
      toast.error(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    'Pressure isolation procedure',
    'Bearing overheat response',
    'Maintenance lockout instructions',
    'Compliance evidence package',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0D131F] border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">Expert Knowledge Copilot</h2>
            <p className="text-[10px] text-slate-400 font-inter">Live vector search over indexed industrial documents</p>
          </div>
        </div>
        <button
          onClick={() => toggleCopilot(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 bg-[#151D2A] border-b border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Quick Search Topics</div>
        <div className="flex flex-wrap gap-1.5">
          {quickQueries.map(item => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

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
            placeholder="Search indexed manuals, SOPs, or compliance text..."
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.length ? (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Query: "{query}"</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {results.length} matches
              </span>
            </div>

            {results.map(result => (
              <div
                key={result.chunk_id}
                className="p-3.5 rounded-xl bg-[#151D2A] border border-slate-700 text-xs text-slate-200 leading-relaxed font-inter"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>{result.document_id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p>{result.text_snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
            <Bot className="w-10 h-10 mb-2 text-slate-600" />
            <p>
              Search the live indexed corpus for equipment instructions, SOP fragments, and compliance references.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
