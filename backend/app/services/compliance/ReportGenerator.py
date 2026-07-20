from app.schemas.compliance import ComplianceReport
from app.schemas.memory import IncidentMemory
from app.services.compliance.TimelineBuilder import TimelineBuilder
from app.services.compliance.EvidenceCollector import EvidenceCollector
from app.services.compliance.ComplianceValidator import ComplianceValidator
import uuid

class ReportGenerator:
    """
    Generates the master compliance report.
    """
    def __init__(self):
        self.timeline_builder = TimelineBuilder()
        self.evidence_collector = EvidenceCollector()
        self.validator = ComplianceValidator()

    def generate(self, memory: IncidentMemory) -> ComplianceReport:
        return ComplianceReport(
            report_id=str(uuid.uuid4()),
            incident_summary=f"Incident {memory.failure_type} on {memory.failed_asset}",
            root_cause="Determined via deterministic graph mapping.",
            timeline=self.timeline_builder.build_timeline(memory),
            graph_snapshot=memory.graph_snapshot,
            simulation_results=memory.simulation_data,
            decision_trace=memory.decision_data,
            supporting_evidence=self.evidence_collector.collect(memory),
            runbook_history=memory.runbook_history,
            technician_actions=memory.technician_feedback,
            compliance_checklist=self.validator.validate(memory),
            final_resolution=memory.outcome
        )
