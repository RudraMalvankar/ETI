from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation.ScenarioGenerator import ScenarioGenerator
from app.services.simulation.SimulationSerializer import global_simulation_db
import uuid

class SimulationEngine:
    """
    Orchestrates the deterministic Shadow Simulation Engine.
    """
    def __init__(self):
        self.generator = ScenarioGenerator()

    def run_simulation(self, request: SimulationRequest) -> SimulationResponse:
        scenarios = []
        for s_type in ["Best Case", "Expected Case", "Worst Case"]:
            scenarios.append(self.generator.generate(request, s_type))

        response = SimulationResponse(
            simulation_id=str(uuid.uuid4()),
            request=request,
            scenarios=scenarios
        )
        
        global_simulation_db.save(response.simulation_id, response)
        
        return response
