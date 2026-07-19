from app.schemas.simulation import RiskProfile
from typing import List, Dict

class RiskEvaluator:
    """
    Computes risk deterministically based on affected assets and their criticality.
    """
    def compute_risk(self, affected_assets: List[Dict[str, str]], scenario_type: str) -> RiskProfile:
        safety = 0.0
        operational = 0.0
        financial = 0.0
        environmental = 0.0

        for asset in affected_assets:
            criticality = asset.get('criticality', 'medium')
            multiplier = 3.0 if criticality == 'critical' else 2.0 if criticality == 'high' else 1.0

            safety += 1.5 * multiplier
            operational += 2.0 * multiplier
            financial += 1.0 * multiplier
            environmental += 0.5 * multiplier

        # Scenario modifier
        mod = 0.5 if scenario_type == 'Best Case' else 1.0 if scenario_type == 'Expected Case' else 2.0
        
        safety = min(100.0, safety * mod)
        operational = min(100.0, operational * mod)
        financial = min(100.0, financial * mod)
        environmental = min(100.0, environmental * mod)

        overall = (safety * 0.4) + (operational * 0.3) + (financial * 0.2) + (environmental * 0.1)

        return RiskProfile(
            safety_risk=round(safety, 2),
            operational_risk=round(operational, 2),
            financial_risk=round(financial, 2),
            environmental_risk=round(environmental, 2),
            overall_score=round(overall, 2)
        )
