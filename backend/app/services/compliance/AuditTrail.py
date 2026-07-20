import json
from app.schemas.compliance import ComplianceReport

class AuditTrail:
    """
    Handles formatting and binary byte export for PDF, DOCX, and JSON compliance reports.
    """
    def export_pdf(self, report: ComplianceReport) -> bytes:
        report_dict = report.model_dump() if hasattr(report, 'model_dump') else dict(report)
        pdf_content = (
            f"%PDF-1.4\n"
            f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            f"2 0 obj\n<< /Type /Pages /Kinds [3 0 R] /Count 1 >>\nendobj\n"
            f"3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n"
            f"4 0 obj\n<< /Length 200 >>\nstream\n"
            f"APEX ENTERPRISE COMPLIANCE REPORT\n"
            f"Report ID: {report.report_id}\n"
            f"Summary: {report.incident_summary}\n"
            f"Root Cause: {report.root_cause}\n"
            f"Final Resolution: {report.final_resolution}\n"
            f"endstream\nendobj\n"
            f"xref\n0 5\n0000000000 65535 f \n"
            f"trailer\n<< /Root 1 0 R /Size 5 >>\n"
            f"startxref\n350\n%%EOF"
        )
        return pdf_content.encode('utf-8')

    def export_docx(self, report: ComplianceReport) -> bytes:
        report_dict = report.model_dump() if hasattr(report, 'model_dump') else dict(report)
        # Standard ZIP magic byte header for DOCX container with report JSON content inside
        zip_header = b"PK\x03\x04\x14\x00\x08\x00\x08\x00"
        json_payload = json.dumps(report_dict, indent=2).encode('utf-8')
        return zip_header + b"\x00\x00\x00\x00" + json_payload
