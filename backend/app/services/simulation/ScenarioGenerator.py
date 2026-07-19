from app.schemas.simulation import ScenarioResult, SimulationRequest
from app.services.simulation.StateManager import StateManager
from app.services.simulation.PropagationEngine import PropagationEngine
from app.services.simulation.RiskEvaluator import RiskEvaluator
from app.services.simulation.ImpactAnalyzer import ImpactAnalyzer
import uuid

class ScenarioGenerator:
    """
    Generates deterministic scenarios based on the incident.
    """
    def __init__(self):
        self.propagation = PropagationEngine()
        self.risk_eval = RiskEvaluator()
        self.impact_eval = ImpactAnalyzer()

    def generate(self, request: SimulationRequest, scenario_type: str) -> ScenarioResult:
        state_mgr = StateManager()
        state_mgr.initialize_state()

        # Depth modifier based on scenario
        depth = 2 if scenario_type == 'Best Case' else 4 if scenario_type == 'Expected Case' else 6
        
        affected_ids, path = self.propagation.simulate_propagation(request.failed_asset, max_depth=depth)
        
        # Update state manager
        state_mgr.update_node_state(request.failed_asset, "failed", 1.0)
        for a_id in affected_ids:
            state_mgr.update_node_state(a_id, "compromised", 0.5)

        # Retrieve asset details for risk/impact evaluation
        snapshot = state_mgr.get_state_snapshot()
        affected_assets_data = [snapshot[aid] for aid in affected_ids if aid in snapshot]
        
        risk_profile = self.risk_eval.compute_risk(affected_assets_data, scenario_type)
        impact = self.impact_eval.compute_impact(affected_assets_data, scenario_type)

        safety_level = "SAFE"
        if risk_profile.safety_risk > 70:
            safety_level = "CRITICAL"
        elif risk_profile.safety_risk > 40:
            safety_level = "WARNING"

        return ScenarioResult(
            scenario_id=str(uuid.uuid4()),
            name=scenario_type,
            affected_assets=affected_ids,
            propagation_path=path,
            risk_score=risk_profile,
            estimated_downtime_hours=impact['downtime_hours'],
            estimated_cost_usd=impact['cost_usd'],
            safety_level=safety_level,
            system_state_snapshot=snapshot
        )
