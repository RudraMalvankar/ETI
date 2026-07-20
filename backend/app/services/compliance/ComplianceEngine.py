from app.schemas.compliance import ComplianceReport, ComplianceReportRequest, ExportRequest
from app.schemas.memory import IncidentMemory
from app.services.compliance.ReportGenerator import ReportGenerator
from app.services.compliance.AuditTrail import AuditTrail
from app.services.memory.OperationalMemoryEngine import OperationalMemoryEngine

class ComplianceEngine:
    """
    Orchestrates Compliance reporting.
    """
    def __init__(self):
        self.generator = ReportGenerator()
        self.audit = AuditTrail()
        self.memory = OperationalMemoryEngine()

    def generate_report(self, request: ComplianceReportRequest) -> ComplianceReport:
        memory = self.memory.get_incident(request.incident_id)
        if not memory:
            raise ValueError("Incident not found in memory.")
            
        return self.generator.generate(memory)

    def export_pdf(self, report: ComplianceReport) -> bytes:
        return self.audit.export_pdf(report)
        
    def export_docx(self, report: ComplianceReport) -> bytes:
        return self.audit.export_docx(report)
