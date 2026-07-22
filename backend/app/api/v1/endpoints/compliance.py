from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.auth import RoleChecker
from app.schemas.compliance import ComplianceReport, ComplianceReportRequest, ExportRequest
from app.services.compliance.ComplianceEngine import ComplianceEngine

router = APIRouter()
engine = ComplianceEngine()

compliance_check = RoleChecker(allowed_roles=["Auditor", "Admin"])


@router.post("/report", response_model=ComplianceReport, status_code=status.HTTP_201_CREATED)
def generate_report(
    request: ComplianceReportRequest, current_user: dict = Depends(compliance_check)
):
    try:
        report = engine.generate_report(request)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{report_id}", response_model=ComplianceReport)
def get_report(report_id: str, current_user: dict = Depends(compliance_check)):
    report = engine.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found.")
    return report


@router.post("/export/pdf")
def export_pdf(request: ExportRequest, current_user: dict = Depends(compliance_check)):
    report = engine.get_report(request.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found.")
    pdf_bytes = engine.export_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{request.report_id}.pdf"},
    )


@router.post("/export/docx")
def export_docx(request: ExportRequest, current_user: dict = Depends(compliance_check)):
    report = engine.get_report(request.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found.")
    docx_bytes = engine.export_docx(report)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=report_{request.report_id}.docx"},
    )
