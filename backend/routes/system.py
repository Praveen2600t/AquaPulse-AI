from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime, timezone, timedelta
from backend.models.schemas import SystemOverview, PurifierMetadata
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine
from backend.ml.diagnostics import diagnostic_engine
from backend.ml.rul_predictor import rul_engine

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/info", response_model=PurifierMetadata)
def get_system_info():
    return PurifierMetadata()

@router.get("/overview")
def get_system_overview() -> Dict[str, Any]:
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)
    faults = diagnostic_engine.diagnose(reading)
    rul_list = rul_engine.predict_component_rul(components, reading)

    # Calculate overall purifier health score (weighted average of components)
    weights = {
        "ro_membrane": 0.40,
        "sediment_filter": 0.20,
        "carbon_filter": 0.20,
        "uf_filter": 0.10,
        "uv_chamber": 0.10
    }
    overall_health = sum(c["health_percentage"] * weights.get(c["id"], 0.2) for c in components)

    # Next maintenance days is minimum of nominal RULs
    min_rul_item = min(rul_list, key=lambda x: x["nominal_days_left"])
    days_to_next = min_rul_item["nominal_days_left"]
    maint_date = (datetime.now(timezone.utc) + timedelta(days=days_to_next)).strftime("%Y-%m-%d")

    # Generate user-facing summary sentence based on real conditions
    if len(faults) == 0 and reading["salt_rejection"] >= 92.0:
        purifier_status = "OPERATIONAL"
        status_summary = "Your purifier is operating normally. All water quality metrics are within optimal range."
    elif any(f["severity"] == "critical" for f in faults):
        purifier_status = "CRITICAL_ACTION_REQUIRED"
        critical_fault = next(f for f in faults if f["severity"] == "critical")
        status_summary = f"Attention: {critical_fault['name']} detected. Recommended action: {critical_fault['recommended_action']}"
    else:
        purifier_status = "DEGRADED"
        first_fault = faults[0] if faults else None
        status_summary = f"Notice: {first_fault['name'] if first_fault else 'Component maintenance due soon'}. System operating in sub-optimal state."

    return {
        "purifier_status": purifier_status,
        "status_summary": status_summary,
        "overall_health": round(overall_health, 1),
        "active_alerts_count": len(faults),
        "predicted_maintenance_date": maint_date,
        "days_to_next_maintenance": days_to_next,
        "total_liters_purified": reading["total_liters_purified"],
        "current_operating_mode": simulator.operating_mode,
        "feed_tds": reading["feed_tds"],
        "permeate_tds": reading["permeate_tds"],
        "salt_rejection": reading["salt_rejection"],
        "product_flow": reading["product_flow"],
        "reject_flow": reading["reject_flow"],
        "latest_reading": reading,
        "components": components,
        "active_faults": faults,
        "rul_predictions": rul_list
    }
