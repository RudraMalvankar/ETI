import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, CheckCircle2, FileText, AlertTriangle, Download, Info } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Timeline } from '../components/common/Timeline';
import {
  exportComplianceDocx,
  exportCompliancePdf,
  generateComplianceReport,
} from '../services/apexServices';
import { ComplianceReport } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export const CompliancePage: React.FC = () => {
  const { currentMemory, currentReport, setCurrentReport, currentUser } = useApexStore();
  const [report, setReport] = useState<ComplianceReport | null>(currentReport);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const canAccessCompliance = ['Auditor', 'Admin'].includes(currentUser?.role || '');

  useEffect(() => {
    if (!currentReport) {
      setReport(null);
      return;
    }
    setReport(currentReport);
  }, [currentReport]);

  useEffect(() => {
    if (!currentMemory?.incident_id || !canAccessCompliance) {
      return;
    }

    setIsLoading(true);
    generateComplianceReport(currentMemory.incident_id)
      .then(res => {
        setReport(res);
        setCurrentReport(res);
      })
      .catch((error: any) => {
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to generate compliance report.';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, [canAccessCompliance, currentMemory?.incident_id, setCurrentReport]);

  const completedChecks = useMemo(
    () => report?.compliance_checklist.filter(item => item.includes('[PASS]')).length || 0,
    [report]
  );
  const complianceScore = useMemo(() => {
    if (!report?.compliance_checklist.length) return 0;
    return Math.round((completedChecks / report.compliance_checklist.length) * 100);
  }, [completedChecks, report?.compliance_checklist.length]);

  const missingEvidence = useMemo(
    () =>
      report?.compliance_checklist.filter(
        item => !item.includes('[PASS]') && !item.toLowerCase().includes('pass')
      ) || [],
    [report]
  );

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsDownloadingPdf(true);
    try {
      const blob = await exportCompliancePdf(report.report_id);
      downloadBlob(blob, `compliance_report_${report.report_id}.pdf`);
      toast.success('PDF compliance report downloaded.');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to export PDF report.';
      toast.error(message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!report) return;
    setIsDownloadingDocx(true);
    try {
      const blob = await exportComplianceDocx(report.report_id);
      downloadBlob(blob, `compliance_report_${report.report_id}.docx`);
      toast.success('DOCX compliance report downloaded.');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to export DOCX report.';
      toast.error(message);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  if (!currentMemory?.incident_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance & Audit Center"
          description="Generate audit-ready evidence packages from stored operational incidents."
          icon={ShieldCheck}
        />
        <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
          Select a stored incident from Memory or Incident History to generate a compliance report.
        </div>
      </div>
    );
  }

  if (!canAccessCompliance) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance & Audit Center"
          description="Generate audit-ready evidence packages from stored operational incidents."
          icon={ShieldCheck}
        />
        <div className="p-6 rounded-2xl border border-accent-amber/30 bg-accent-amber/10 text-sm text-accent-amber">
          Compliance report generation and export require an `Auditor` or `Admin` role. The backend
          will reject this workflow for the current signed-in role: `{currentUser?.role || 'Unknown'}`.
        </div>
      </div>
    );
  }

  if (isLoading && !report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance & Audit Center"
          description="Generate audit-ready evidence packages from stored operational incidents."
          icon={ShieldCheck}
        />
        <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
          Generating compliance report from backend...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance & Audit Center"
          description="Generate audit-ready evidence packages from stored operational incidents."
          icon={ShieldCheck}
        />
        <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
          No compliance report is available for the selected incident yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Compliance & Audit Center"
        description="Live regulatory evidence, timeline reconstruction, and exportable audit reporting."
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all disabled:opacity-50"
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
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all disabled:opacity-50"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-[6px] border-accent-emerald flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-2xl font-extrabold text-white">
              {complianceScore}
              <span className="text-sm">%</span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Compliance Score</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> {completedChecks} checks passed
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg flex flex-col justify-center">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" /> Report Context
          </h3>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Incident ID</span>
              <span className="font-mono text-white">{currentMemory.incident_id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Evidence Items</span>
              <span className="font-bold text-accent-emerald">{report.supporting_evidence.length}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-accent-amber/5 border border-accent-amber/20 shadow-lg flex flex-col justify-center text-accent-amber">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Missing Evidence / Alerts
          </h3>
          <p className="text-xs mt-2 leading-relaxed">
            {missingEvidence.length
              ? `${missingEvidence.length} checklist item(s) still require attention before the audit package is fully clean.`
              : 'No open compliance checklist exceptions were detected in the generated report.'}
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-emerald/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

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
            <CheckCircle2 className="w-5 h-5" /> REPORT GENERATED
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              1. Root Cause Identification
            </h4>
            <p className="text-white leading-relaxed font-mono text-xs">{report.root_cause}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)]">
            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              2. Final Audit Resolution
            </h4>
            <p className="text-accent-emerald font-semibold leading-relaxed font-mono text-xs">
              {report.final_resolution}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-primary)] border border-[var(--glass-border)] relative z-10">
          <Timeline items={report.timeline} title="3. Incident Event Chronology Timeline" />
        </div>

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
