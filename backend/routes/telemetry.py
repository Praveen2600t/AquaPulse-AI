from fastapi import APIRouter, Query
from typing import List, Dict, Any
from backend.simulation.engine import simulator

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

@router.get("/current")
def get_current_reading() -> Dict[str, Any]:
    return simulator.generate_current_reading()

@router.get("/history")
def get_history(limit: int = Query(default=60, ge=10, le=200)) -> List[Dict[str, Any]]:
    # Ensure current reading is generated
    simulator.generate_current_reading()
    return simulator.history_buffer[-limit:]

@router.post("/mode")
def set_simulation_mode(mode: str) -> Dict[str, Any]:
    simulator.set_mode(mode)
    return {
        "status": "success",
        "mode": simulator.operating_mode,
        "message": f"Simulation operating mode updated to {simulator.operating_mode}"
    }
