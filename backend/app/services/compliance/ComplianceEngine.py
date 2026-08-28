from collections import OrderedDict

from app.schemas.compliance import ComplianceReport, ComplianceReportRequest
from app.services.compliance.AuditTrail import AuditTrail
from app.services.compliance.ReportGenerator import ReportGenerator
from app.services.memory.OperationalMemoryEngine import OperationalMemoryEngine

_MAX_REPORT_CACHE = 100


class ComplianceEngine:
    """
    Main orchestrator for Compliance & Audit Engine.
    """

    _report_cache: OrderedDict[str, ComplianceReport] = OrderedDict()

    def __init__(self):
        self.generator = ReportGenerator()
        self.audit = AuditTrail()
        self.memory = OperationalMemoryEngine()

    def generate_report(self, request: ComplianceReportRequest) -> ComplianceReport:
        memory = self.memory.get_incident(request.incident_id)
        if not memory:
            raise ValueError(f"Incident memory '{request.incident_id}' not found.")

        report = self.generator.generate(memory)
        ComplianceEngine._report_cache[report.report_id] = report
        ComplianceEngine._report_cache.move_to_end(report.report_id)
        if len(ComplianceEngine._report_cache) > _MAX_REPORT_CACHE:
            ComplianceEngine._report_cache.popitem(last=False)
        return report

    def get_report(self, report_id: str) -> ComplianceReport | None:
        return ComplianceEngine._report_cache.get(report_id)

    def export_pdf(self, report: ComplianceReport) -> bytes:
        return self.audit.export_pdf(report)

    def export_docx(self, report: ComplianceReport) -> bytes:
        return self.audit.export_docx(report)
