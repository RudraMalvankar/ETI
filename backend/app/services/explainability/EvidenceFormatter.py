from typing import List, Dict, Any

class EvidenceFormatter:
    def format_graph_evidence(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Mock formatting deterministic graph inputs to evidence
        scenarios = context.get('scenarios', [])
        evidence = []
        if scenarios:
            best_sc = scenarios[0]
            evidence.append({
                "source": "Knowledge Graph",
                "evidence_type": "Blast Radius",
                "details": f"Traversed {len(best_sc.get('affected_assets', []))} connected downstream assets."
            })
        return evidence

    def format_simulation_evidence(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenarios = context.get('scenarios', [])
        evidence = []
        if scenarios:
            best_sc = scenarios[0]
            evidence.append({
                "source": "Shadow Simulation",
                "evidence_type": "Risk Evaluation",
                "details": f"Calculated downtime of {best_sc.get('estimated_downtime_hours')} hrs."
            })
        return evidence

    def format_document_evidence(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        docs = context.get('documents', [])
        evidence = []
        for doc in docs:
            evidence.append({
                "source": "Qdrant Index",
                "evidence_type": "Maintenance Manual",
                "details": doc.get('text', '')[:100]
            })
        return evidence
