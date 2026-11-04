from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SensorReading(BaseModel):
    timestamp: datetime
    feed_ec: float
    feed_tds: float
    feed_ph: float
    feed_orp: float
    feed_turbidity: float
    feed_temp: float
    p1_feed_pressure: float
    p2_pump_inlet_pressure: float
    p3_membrane_pressure: float
    product_flow: float
    reject_flow: float
    permeate_ec: float
    permeate_tds: float
    salt_rejection: float
    pre_filter_dp: float
    tcf: float
    recovery_ratio: float

class ComponentHealth(BaseModel):
    id: str
    name: str
    category: str
    health_percentage: float
    status: str # healthy, warning, critical, offline
    estimated_days_remaining: int
    liters_processed: float
    rated_capacity_liters: float
    current_dp_psi: Optional[float] = None
    fouling_index: float
    fault_detected: Optional[str] = None
    service_recommendation: str
    last_replaced: str

class FailureFingerprint(BaseModel):
    fault_code: str
    name: str
    severity: str # info, warning, critical
    is_detected: bool
    confidence: float # 0.0 to 1.0 calibrated
    evidence: List[str]
    affected_components: List[str]
    root_cause: str
    recommended_action: str
    sensor_correlations: Dict[str, float]

class RULPrediction(BaseModel):
    component_id: str
    component_name: str
    nominal_days_left: int
    optimistic_days_left: int
    pessimistic_days_left: int
    maintenance_priority: str # Low, Medium, High, Urgent
    confidence_interval: str
    primary_degradation_factor: str
    model_method: str

class SystemOverview(BaseModel):
    purifier_status: str # "OPERATIONAL", "MAINTENANCE_REQUIRED", "DEGRADED"
    status_summary: str
    overall_health: float
    active_alerts_count: int
    predicted_maintenance_date: str
    days_to_next_maintenance: int
    total_liters_purified: float
    current_operating_mode: str
    feed_tds: float
    permeate_tds: float
    salt_rejection: float
    product_flow: float
    reject_flow: float
    latest_reading: SensorReading
    components: List[ComponentHealth]
    active_faults: List[FailureFingerprint]

class ScenarioInput(BaseModel):
    feed_conductivity: float = Field(default=850.0, ge=50.0, le=4000.0)
    feed_pressure: float = Field(default=35.0, ge=5.0, le=80.0)
    temperature: float = Field(default=25.0, ge=4.0, le=50.0)
    turbidity: float = Field(default=2.5, ge=0.05, le=50.0)
    simulated_filter_age_days: int = Field(default=90, ge=1, le=720)
    flow_demand: float = Field(default=15.0, ge=5.0, le=25.0)

class ScenarioResult(BaseModel):
    scenario: ScenarioInput
    baseline_salt_rejection: float
    simulated_salt_rejection: float
    baseline_pre_filter_dp: float
    simulated_pre_filter_dp: float
    membrane_stress_index: float
    uv_dose_efficacy: float
    projected_rul_change_days: int
    fault_risks: List[str]
    engineering_insights: List[str]

class MaintenanceItem(BaseModel):
    id: Optional[int] = None
    date: datetime
    component: str
    action: str
    technician: str
    notes: Optional[str] = None
    liters_at_service: float
    cost: float

class PurifierMetadata(BaseModel):
    name: str = "AquaPulse AI"
    tagline: str = "A water purifier that reads your water and warns you before the filter fails."
    team: str = "NEXTGEN AI"
    members: List[str] = ["Praveen K", "Prithika C"]
    institution: str = "Sri Ramakrishna Institute of Technology, Coimbatore"
    version: str = "2.0.0-PROD"
