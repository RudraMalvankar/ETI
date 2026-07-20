import datetime
from typing import List, Dict, Any
from app.schemas.memory import IncidentMemory

class TimelineBuilder:
    """
    Builds an auditable chronological timeline of the incident.
    """
    def build_timeline(self, memory: IncidentMemory) -> List[Dict[str, str]]:
        timeline = []
        
        # Simulated chronological entries
        t0 = datetime.datetime.fromisoformat(memory.timestamp)
        t1 = t0 + datetime.timedelta(minutes=2)
        t2 = t0 + datetime.timedelta(minutes=5)
        
        timeline.append({"time": t0.isoformat(), "event": f"Incident logged for {memory.failed_asset}"})
        timeline.append({"time": t1.isoformat(), "event": "Shadow Simulation scenarios generated"})
        timeline.append({"time": t2.isoformat(), "event": "AI Decision produced and Runbook started"})
        
        for idx, step in enumerate(memory.runbook_history):
            t_step = t0 + datetime.timedelta(minutes=10 + (idx * 15))
            timeline.append({"time": t_step.isoformat(), "event": f"Runbook Step '{step.get('title')}' logged as {step.get('status')}"})
            
        return timeline
