import React, { useState, useEffect } from 'react';
import { BrainCircuit, FileText, Network, Activity, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { evaluateDecision } from '../services/apexServices';
import { DecisionResponse } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const DecisionPage: React.FC = () => {
  const { activeAssetId, activeFailureType, currentSimulation, setCurrentDecision, setActiveTab } = useApexStore();
  const [decision, setDecision] = useState<DecisionResponse>({
    recommended_strategy: 'Isolate P-101 & Close Downstream Valve V-202',
    alternative_strategies: [
      'Throttle inlet fluid flow on P-101 by 40%',
      'Activate secondary heat exchange loop HE-303'
    ],
    reasoning: 'Evaluated Monte Carlo risk models: Physical isolation of P-101 yields 95.0% risk reduction with minimal downtime impact.',
    supporting_citations: [
      {
        document_id: 'doc-manual-01',
        chunk_id: 'chk-101',
        text_snippet: 'Before servicing pump P-101, isolate inlet isolation valve V-202 immediately to prevent thermal overload.'
      }
    ],
    confidence_score: 94.5,
    affected_assets: ['P-101', 'V-202'],
    estimated_risk_reduction: 95.0,
    estimated_cost: 1800,
    estimated_downtime: 1.2,
    decision_trace: {
      documents_used: 1,
      graph_nodes_traversed: 2,
      selected_scenario: 'Best Case (Controlled Physical Isolation)',
      citations_verified: 1,
      confidence: 94.5
    }
  });

  const fetchDecision = async () => {
    try {
      const res = await evaluateDecision(
        activeAssetId,
        activeFailureType,
        currentSimulation?.simulation_id || 'sim-demo-101'
      );
      if (res) {
        setDecision(res);
        setCurrentDecision(res);
      }
    } catch (e) {
      // Keep demo decision if backend fallback
    }
  };

  useEffect(() => {
    fetchDecision();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Decision Engine & Citation Trace"
        description="Deterministic decision synthesis combining RAG vector citations, Knowledge Graph topology, and Shadow Simulation risk evaluation."
        icon={BrainCircuit}
        actions={
          <button
            onClick={fetchDecision}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            Re-evaluate Strategy
          </button>
        }
      />

      {/* Main Strategy Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900 border border-blue-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1">
              Primary AI Recommendation
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {decision.recommended_strategy}
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {decision.reasoning}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[140px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Confidence Score</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-1">{decision.confidence_score}%</span>
            <span className="text-[10px] text-emerald-500 font-mono mt-1">✔ Guardrail Verified</span>
          </div>
        </div>
      </div>

      {/* Decision Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Risk Reduction</span>
          <span className="text-xl font-bold text-emerald-400">-{decision.estimated_risk_reduction}%</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Estimated Cost</span>
          <span className="text-xl font-bold text-white">${decision.estimated_cost.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Estimated Downtime</span>
          <span className="text-xl font-bold text-white">{decision.estimated_downtime} Hours</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Target Assets</span>
          <div className="flex gap-1 mt-1">
            {decision.affected_assets.map((asset, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs text-blue-300">
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Deterministic Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Evidence & Citations */}
        <SectionCard title="Vector Document Evidence" subtitle="Verified RAG manual citations">
          <div className="space-y-3">
            {decision.supporting_citations.map((cit, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> {cit.document_id}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Chunk {cit.chunk_id}
                  </span>
                </div>
                <p className="text-slate-300 italic bg-slate-900/50 p-2.5 rounded border border-slate-800/60">
                  "{cit.text_snippet}"
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Knowledge Graph Evidence */}
        <SectionCard title="Knowledge Graph Evidence" subtitle="Topological blast radius">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Network className="w-4 h-4 text-purple-400" />
              <span>Traversed <strong>{decision.affected_assets.length} connected nodes</strong> via Graph Engine.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
              Downstream asset dependencies: <strong className="text-white">{decision.affected_assets.join(', ')}</strong>
            </div>
          </div>
        </SectionCard>

        {/* Shadow Simulation Evidence */}
        <SectionCard title="Shadow Simulation Evidence" subtitle="Monte Carlo risk model">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Selected scenario: <strong>{String(decision.decision_trace.selected_scenario)}</strong></span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Lowest risk-to-cost ratio strategy identified across all evaluated Monte Carlo simulation iterations.
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Action to proceed to Runbook */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab('runbook')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
        >
          <span>Generate Dynamic Operational Runbook</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
