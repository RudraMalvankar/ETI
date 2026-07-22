from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import RoleChecker
from app.schemas.simulation import SimulationRequest, SimulationResponse, SimulationStatistics
from app.services.simulation.SimulationEngine import SimulationEngine
from app.services.simulation.SimulationSerializer import global_simulation_db

router = APIRouter()

sim_read_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Auditor", "Admin"])
sim_run_check = RoleChecker(allowed_roles=["Operator", "Engineer", "Admin"])


@router.post("/run", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
def run_simulation(request: SimulationRequest, current_user: dict = Depends(sim_run_check)):
    engine = SimulationEngine()
    try:
        return engine.run_simulation(request)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{simulation_id}", response_model=SimulationResponse)
def get_simulation(simulation_id: str, current_user: dict = Depends(sim_read_check)):
    sim = global_simulation_db.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


@router.get("/scenarios/{simulation_id}")
def get_scenarios(simulation_id: str, current_user: dict = Depends(sim_read_check)):
    sim = global_simulation_db.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"scenarios": sim.scenarios}


@router.get("/statistics/", response_model=SimulationStatistics)
def get_statistics(current_user: dict = Depends(sim_read_check)):
    all_sims = global_simulation_db.get_all()
    total_sims = len(all_sims)
    total_scenarios = sum(len(s.scenarios) for s in all_sims)

    total_downtime = 0.0
    if total_scenarios > 0:
        for sim in all_sims:
            for sc in sim.scenarios:
                total_downtime += sc.estimated_downtime_hours
        avg_downtime = total_downtime / total_scenarios
    else:
        avg_downtime = 0.0

    return SimulationStatistics(
        total_simulations=total_sims,
        total_scenarios_generated=total_scenarios,
        average_downtime=avg_downtime,
    )
