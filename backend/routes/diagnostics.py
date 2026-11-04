from fastapi import APIRouter
from typing import List, Dict, Any
from backend.simulation.engine import simulator
from backend.ml.diagnostics import diagnostic_engine
from backend.ml.rul_predictor import rul_engine

router = APIRouter(prefix="/api/diagnostics", tags=["Diagnostics"])

@router.get("/fingerprints")
def get_failure_fingerprints() -> Dict[str, Any]:
    reading = simulator.generate_current_reading()
    detected_faults = diagnostic_engine.diagnose(reading)
    return {
        "timestamp": reading["timestamp"],
        "operating_mode": simulator.operating_mode,
        "total_active_faults": len(detected_faults),
        "faults": detected_faults
    }

@router.get("/model-metrics")
def get_model_metrics() -> Dict[str, Any]:
    return rul_engine.get_model_evaluation_metrics()
