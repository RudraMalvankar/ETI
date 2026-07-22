import React, { useState } from 'react';
import { ShieldCheck, X, Download, FileText, Award } from 'lucide-react';
import { useApexStore } from '../../store/useApexStore';

export const ComplianceHubModal: React.FC = () => {
  const { isComplianceModalOpen, toggleComplianceModal, complianceStandards } = useApexStore();
  const [showCertificate, setShowCertificate] = useState(false);

  if (!isComplianceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Quality & Regulatory Compliance Hub
              </h2>
              <p className="text-xs text-slate-400 font-inter">
                Live OISD / PESO Audit Mapping & Evidence Package Engine
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowCertificate(false);
              toggleComplianceModal(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {showCertificate ? (
            /* Audit Evidence Certificate Preview */
            <div className="p-6 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      OISD / PESO COMPLIANCE AUDIT EVIDENCE PACKAGE
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Ref: APEX-AUDIT-2026-9042-EV | Issued: 21 July 2026
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs">
                  AUDIT APPROVED ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500">Plant Asset:</span>{' '}
                  <strong className="text-white">Reactor R-101 & Relief Loop</strong>
                </div>
                <div>
                  <span className="text-slate-500">Regulatory Framework:</span>{' '}
                  <strong className="text-white">OISD-STD-117 & PESO UPV Rule 14</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mitigation Strategy:</span>{' '}
                  <strong className="text-white">
                    Bypass Valve V-108 Reroute to Flare Stack FS-01
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">LOTO Verification:</span>{' '}
                  <strong className="text-emerald-400">Digitally Signed & Timestamped</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-white">Audit Summary Statement:</strong> All emergency
                overpressure isolation procedures have been executed in compliance with OISD Safety
                Standards Clause 7.3 and PESO UPV Schedule VI guidelines. Hazardous energy lockout
                (LOTO) logged with zero safety deviations.
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-mono"
                >
                  ← Back to Compliance Health
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Audit Evidence Package downloaded as PDF!')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Compliance Health Gauge Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">94.8%</div>
                  <div className="text-xs text-slate-400">OISD Compliance Score</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold font-mono text-blue-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400">PESO UPV Compliance Score</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold font-mono text-amber-400 mb-1">1 Gap</div>
                  <div className="text-xs text-slate-400">Audit Gap Flagged</div>
                </div>
              </div>

              {/* Regulatory Mapping Table */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Active Regulatory Mapping (OISD / PESO / Factory Act)
                </div>

                {complianceStandards.map(std => (
                  <div
                    key={std.code}
                    className="p-4 rounded-xl bg-[#151D2A] border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {std.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">{std.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({std.authority})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-inter">{std.requirement}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Last Verified Audit: {std.lastAudit}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        std.status === 'COMPLIANT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {std.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!showCertificate && (
          <div className="p-4 border-t border-slate-800 bg-[#111827] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Audit Engine: Auto-Syncing with QMS & Plant Records
            </span>
            <button
              onClick={() => setShowCertificate(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Audit Evidence Package</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
