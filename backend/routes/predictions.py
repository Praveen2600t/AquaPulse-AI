from fastapi import APIRouter
from typing import List, Dict, Any
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine
from backend.ml.rul_predictor import rul_engine

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("/rul")
def get_rul_predictions() -> List[Dict[str, Any]]:
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)
    return rul_engine.predict_component_rul(components, reading)

@router.get("/degradation-curve")
def get_degradation_curve() -> List[Dict[str, Any]]:
    """Returns projected forward degradation curve for components over the next 180 days."""
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)
    points = []
    
    # 0 to 180 days in steps of 15 days
    for day in range(0, 195, 15):
        point = {"day": day}
        for c in components:
            cid = c["id"]
            curr_h = c["health_percentage"]
            # Non-linear degradation decay curve
            rate = 0.4 if cid == "ro_membrane" else (0.8 if cid == "sediment_filter" else 0.5)
            projected = max(0.0, curr_h - (day * rate) - (0.001 * (day ** 1.8)))
            point[cid] = round(projected, 1)
        points.append(point)
    return points
