from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import ScenarioInput, ScenarioResult
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine
from backend.ml.diagnostics import diagnostic_engine

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/scenario", response_model=ScenarioResult)
def run_scenario_simulation(scenario: ScenarioInput) -> ScenarioResult:
    # 1. Baseline nominal physics
    base_reading = simulator.generate_current_reading()
    base_salt_rej = base_reading["salt_rejection"]
    base_dp = base_reading["pre_filter_dp"]

    # 2. Physics calculation for simulated scenario
    tcf = simulator.calculate_tcf(scenario.temperature)
    
    # Pre-filter pressure drop scales with turbidity and filter age
    age_factor = 1.0 + (scenario.simulated_filter_age_days / 180.0) * 1.5
    turbidity_factor = max(1.0, scenario.turbidity / 1.5)
    sim_dp = 3.5 * age_factor * turbidity_factor

    # Membrane salt rejection degradation with age and high temperature / high conductivity
    temp_penalty = max(0.0, (scenario.temperature - 25.0) * 0.15)
    age_rejection_loss = (scenario.simulated_filter_age_days / 365.0) * 4.5
    ec_polarization_loss = max(0.0, (scenario.feed_conductivity - 800.0) / 400.0 * 1.2)
    
    sim_salt_rejection = max(60.0, min(99.0, 96.5 - temp_penalty - age_rejection_loss - ec_polarization_loss))

    # Membrane Stress Index (0.0 to 10.0 scale)
    net_driving_pressure = max(10.0, scenario.feed_pressure - sim_dp)
    membrane_stress = min(10.0, (net_driving_pressure / 60.0 * 4.0) + (scenario.feed_conductivity / 1000.0 * 3.5))

    # UV Dose Efficacy (reduces if turbidity is high)
    uv_efficacy = max(40.0, min(100.0, 99.8 - (scenario.turbidity * 3.5) - (scenario.simulated_filter_age_days * 0.05)))

    # Projected RUL impact
    rul_delta_days = int(- (age_factor * 15.0) - (turbidity_factor * 8.0) - (ec_polarization_loss * 12.0))

    # Evaluate potential risks & insights
    fault_risks = []
    insights = []

    if sim_dp > 15.0:
        fault_risks.append("Pre-Filter Clogging Imminent: High pressure drop will starve booster pump.")
    if sim_salt_rejection < 90.0:
        fault_risks.append(f"Salt Rejection Compromised: Permeate TDS will rise above 75 ppm.")
    if scenario.temperature > 35.0:
        fault_risks.append("Thermal Flux Degradation: Elevated water temperature increases salt permeation rate.")
    if scenario.turbidity > 5.0:
        fault_risks.append("UV Sleeve Fouling Risk: Silt deposition reduces germicidal UV-C transmittance.")

    insights.append(f"Temperature Correction Factor calculated at TCF = {tcf:.4f}.")
    insights.append(f"Projected pre-filter pressure drop is {sim_dp:.1f} psi (Baseline: {base_dp:.1f} psi).")
    insights.append(f"Simulated salt rejection is {sim_salt_rejection:.1f}% vs baseline {base_salt_rej:.1f}%.")
    insights.append(f"Estimated filter life reduced by approximately {abs(rul_delta_days)} days under this load profile.")

    return ScenarioResult(
        scenario=scenario,
        baseline_salt_rejection=round(base_salt_rej, 2),
        simulated_salt_rejection=round(sim_salt_rejection, 2),
        baseline_pre_filter_dp=round(base_dp, 2),
        simulated_pre_filter_dp=round(sim_dp, 2),
        membrane_stress_index=round(membrane_stress, 2),
        uv_dose_efficacy=round(uv_efficacy, 1),
        projected_rul_change_days=rul_delta_days,
        fault_risks=fault_risks,
        engineering_insights=insights
    )
