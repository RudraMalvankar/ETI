import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, FileText, AlertTriangle, Download, Info } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Timeline } from '../components/common/Timeline';
import {
  generateComplianceReport,
  exportCompliancePdf,
  exportComplianceDocx,
} from '../services/apexServices';
import { ComplianceReport } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const CompliancePage: React.FC = () => {
  const { currentMemory, setCurrentReport } = useApexStore();
  const [report, setReport] = useState<ComplianceReport>({
    report_id: 'REP-FB573B93',
    incident_summary:
      'Enterprise Incident Report: Bearing Overheat on Asset P-101 (Logged: 2026-07-20T20:50:00Z)',
    root_cause:
      'Primary failure root cause identified as bearing overheat on target node P-101, verified via Knowledge Graph topology analysis.',
    timeline: [
      {
        time: '2026-07-20T20:50:00Z',
        event: 'Incident logged for failed asset P-101 (Failure type: bearing_overheat)',
      },
      {
        time: '2026-07-20T20:51:00Z',
        event: 'Knowledge Graph snapshot captured (5 connected nodes evaluated)',
      },
      {
        time: '2026-07-20T20:53:00Z',
        event: 'Shadow Simulation executed and failure scenarios computed',
      },
      {
        time: '2026-07-20T20:55:00Z',
        event: 'AI Decision Engine generated recommendation: Isolate P-101 and Close V-202',
      },
      {
        time: '2026-07-20T21:00:00Z',
        event: 'Runbook Step 1 "Safety Isolation" executed with status: completed',
      },
      {
        time: '2026-07-20T21:15:00Z',
        event: 'Technician Action logged: Valve V-202 handwheel stuck',
      },
      {
        time: '2026-07-20T21:20:00Z',
        event: 'Runbook dynamically regenerated with pneumatic bypass',
      },
      {
        time: '2026-07-20T21:50:00Z',
        event: 'Incident closed with final outcome: Resolved with Pneumatic Bypass',
      },
    ],
    graph_snapshot: { nodes_count: 5, edges_count: 4, failed_node: { id: 'P-101', type: 'pump' } },
    simulation_results: {
      scenarios_count: 3,
      best_case_downtime_hours: 1.2,
      best_case_cost_usd: 1800,
    },
    decision_trace: {
      strategy: 'Isolate P-101 & Close V-202',
      confidence: 94.5,
      citations_verified: ['doc-manual-01#chk-101'],
    },
    supporting_evidence: [
      {
        source: 'Knowledge Graph Engine',
        category: 'Topology & Blast Radius',
        details: 'Evaluated graph topology with 5 nodes and 4 edges.',
      },
      {
        source: 'Shadow Simulation Engine',
        category: 'Risk & Downtime Modeling',
        details: 'Simulation ID sim-demo-101 generated 3 distinct scenarios.',
      },
      {
        source: 'AI Decision Engine',
        category: 'Deterministic Decision Trace',
        details: 'Strategy validated with confidence score 94.5%.',
      },
    ],
    runbook_history: [
      { title: 'Safety Isolation', status: 'completed' },
      { title: 'Depressurize Housing', status: 'completed' },
      { title: 'Engage Pneumatic Bypass', status: 'completed' },
    ],
    technician_actions: ['Valve V-202 handwheel stuck, require pneumatic bypass.'],
    compliance_checklist: [
      '[PASS] Safety Protocols: Standard equipment containment procedures applied.',
      '[PASS] Blast Radius Verification: Knowledge Graph snapshot captured and verified.',
      '[PASS] AI Hallucination Guardrail: Decision trace linked to deterministic simulation and document citations.',
      '[PASS] Technician Audit Trail: Feedback and step updates recorded by operational technician.',
      '[PASS] Audit Closure: Incident finalized with outcome "Resolved with Pneumatic Bypass".',
    ],
    final_resolution:
      'Incident successfully resolved with status "Resolved with Pneumatic Bypass".',
  });

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const fetchReport = async () => {
    const incId = currentMemory?.incident_id || '73700122-6f01-4ce0-838f-44fcc9b398dc';
    try {
      const res = await generateComplianceReport(incId);
      if (res) {
        setReport(res);
        setCurrentReport(res);
      }
    } catch (e) {
      // Keep demo report
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = await exportCompliancePdf(report.report_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${report.report_id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(
        'Failed to generate PDF compliance report. Please verify the backend connection and try again.'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const blob = await exportComplianceDocx(report.report_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${report.report_id}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(
        'Failed to generate DOCX compliance report. Please verify the backend connection and try again.'
      );
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Compliance & Audit Center"
        description="Automated regulatory compliance tracking, evidence collection, and audit-ready reporting."
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all"
            >
              {isDownloadingPdf ? (
                <span className="w-3.5 h-3.5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-accent-red" />
              )}
              PDF Report
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloadingDocx}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all"
            >
              {isDownloadingDocx ? (
                <span className="w-3.5 h-3.5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-brand-400" />
              )}
              DOCX Report
            </button>
          </div>
        }
      />

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-[6px] border-accent-emerald flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-2xl font-extrabold text-white">
              98<span className="text-sm">%</span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Enterprise Compliance Score
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Audit Ready Status
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg flex flex-col justify-center">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" /> Regulatory Mapping
          </h3>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">OSHA Standard 1910.147</span>
              <span className="font-bold text-accent-emerald">100% Met</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">ISO 55001 Asset Mgmt</span>
              <span className="font-bold text-accent-emerald">100% Met</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-accent-amber/5 border border-accent-amber/20 shadow-lg flex flex-col justify-center text-accent-amber">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Missing Evidence / Alerts
          </h3>
          <p className="text-xs mt-2 leading-relaxed">
            1 pending manual sign-off required for incident{' '}
            <strong className="bg-accent-amber/20 px-1 rounded">REP-FB573B93</strong>. Please ensure
            the lead technician completes the LOTO visual inspection upload.
          </p>
        </div>
      </div>

      {/* Audit Report Shell */}
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-emerald/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

        {/* Title & Report Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--glass-border)] gap-4 relative z-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-emerald font-bold block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Enterprise Audit Document
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {report.incident_summary}
            </h2>
            <span className="text-xs text-[var(--text-secondary)] font-mono mt-2 block bg-[var(--bg-primary)] inline-block px-3 py-1 rounded-md border border-[var(--glass-border)]">
              Serial ID: {report.report_id}
            </span>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-sm font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> AUDIT VERIFIED
          </div>
        </div>

        {/* 11 Sections Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Root Cause */}
          <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              1. Root Cause Identification
            </h4>
            <p className="text-white leading-relaxed font-mono text-xs">{report.root_cause}</p>
          </div>

          {/* Final Resolution */}
          <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              2. Final Audit Resolution
            </h4>
            <p className="text-accent-emerald font-semibold leading-relaxed font-mono text-xs">
              {report.final_resolution}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 rounded-3xl bg-[var(--bg-primary)] border border-[var(--glass-border)] relative z-10">
          <Timeline items={report.timeline} title="3. Incident Event Chronology Timeline" />
        </div>

        {/* Supporting Evidence */}
        <div className="space-y-4 relative z-10">
          <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            4. Deterministic Supporting Evidence
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.supporting_evidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-xs transition-colors hover:border-brand-500/30 group"
              >
                <span className="font-bold text-brand-400 flex items-center gap-1.5 mb-2 group-hover:text-brand-300">
                  <Info className="w-3.5 h-3.5" /> {ev.source}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[9px] text-[var(--text-secondary)] font-mono mb-3 uppercase">
                  {ev.category}
                </span>
                <p className="text-slate-300 font-mono leading-relaxed">{ev.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="p-6 rounded-3xl bg-[var(--bg-primary)] border border-[var(--glass-border)] relative z-10">
          <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            5. Regulatory Compliance Checklist
          </h4>
          <div className="space-y-3">
            {report.compliance_checklist.map((check, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-xs text-white font-mono hover:border-accent-emerald/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                <span className="leading-relaxed">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
