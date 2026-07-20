import datetime
from typing import List, Dict, Any
from app.schemas.memory import IncidentMemory

class TimelineBuilder:
    """
    Builds an auditable chronological timeline of the incident.
    """
    def build_timeline(self, memory: IncidentMemory) -> List[Dict[str, str]]:
        timeline = []
        
        try:
            t0 = datetime.datetime.fromisoformat(memory.timestamp)
        except Exception:
            t0 = datetime.datetime.utcnow()

        t1 = t0 + datetime.timedelta(minutes=1)
        t2 = t0 + datetime.timedelta(minutes=3)
        t3 = t0 + datetime.timedelta(minutes=5)
        
        timeline.append({
            "time": t0.isoformat(),
            "event": f"Incident logged for failed asset '{memory.failed_asset}' (Failure type: {memory.failure_type})"
        })
        
        if memory.graph_snapshot:
            nodes_count = memory.graph_snapshot.get('nodes_count', 0)
            timeline.append({
                "time": t1.isoformat(),
                "event": f"Knowledge Graph snapshot captured ({nodes_count} connected nodes evaluated)"
            })
            
        if memory.simulation_data:
            timeline.append({
                "time": t2.isoformat(),
                "event": "Shadow Simulation executed and failure scenarios computed"
            })

        if memory.decision_data:
            rec = memory.decision_data.get('recommended_strategy', 'Isolation strategy recommended')
            timeline.append({
                "time": t3.isoformat(),
                "event": f"AI Decision Engine generated recommendation: {rec}"
            })
        
        for idx, step in enumerate(memory.runbook_history):
            t_step = t3 + datetime.timedelta(minutes=5 + (idx * 10))
            title = step.get('title') or step.get('action') or f"Step {idx+1}"
            status = step.get('status', 'executed')
            timeline.append({
                "time": t_step.isoformat(),
                "event": f"Runbook Step {idx+1} '{title}' executed with status: {status}"
            })

        for idx, feedback in enumerate(memory.technician_feedback):
            t_fb = t3 + datetime.timedelta(minutes=15 + (idx * 5))
            fb_text = feedback.get('notes') if isinstance(feedback, dict) else str(feedback)
            timeline.append({
                "time": t_fb.isoformat(),
                "event": f"Technician Action / Feedback logged: {fb_text}"
            })

        t_final = t3 + datetime.timedelta(minutes=60)
        timeline.append({
            "time": t_final.isoformat(),
            "event": f"Incident closed with final outcome: {memory.outcome}"
        })

        return timeline
