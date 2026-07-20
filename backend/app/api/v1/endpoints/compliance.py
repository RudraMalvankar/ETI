from fastapi import APIRouter, HTTPException, status, Response
from app.schemas.compliance import ComplianceReport, ComplianceReportRequest, ExportRequest
from app.services.compliance.ComplianceEngine import ComplianceEngine
from typing import Any

router = APIRouter()
engine = ComplianceEngine()

# We need a store to keep reports for export
_report_store = {}

@router.post("/report", response_model=ComplianceReport, status_code=status.HTTP_201_CREATED)
def generate_report(request: ComplianceReportRequest):
    try:
        report = engine.generate_report(request)
        _report_store[report.report_id] = report
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{report_id}", response_model=ComplianceReport)
def get_report(report_id: str):
    if report_id not in _report_store:
        raise HTTPException(status_code=404, detail="Report not found.")
    return _report_store[report_id]

@router.post("/export/pdf")
def export_pdf(request: ExportRequest):
    if request.report_id not in _report_store:
        raise HTTPException(status_code=404, detail="Report not found.")
    pdf_bytes = engine.export_pdf(_report_store[request.report_id])
    return Response(content=pdf_bytes, media_type="application/pdf")

@router.post("/export/docx")
def export_docx(request: ExportRequest):
    if request.report_id not in _report_store:
        raise HTTPException(status_code=404, detail="Report not found.")
    docx_bytes = engine.export_docx(_report_store[request.report_id])
    return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
