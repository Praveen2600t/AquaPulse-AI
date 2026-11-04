import pytest
from backend.simulation.engine import simulator
from backend.ml.diagnostics import diagnostic_engine

def test_diagnostics_normal_mode():
    simulator.set_mode("NORMAL")
    reading = simulator.generate_current_reading()
    faults = diagnostic_engine.diagnose(reading)

    # In nominal state, critical faults should be zero
    critical_faults = [f for f in faults if f["severity"] == "critical"]
    assert len(critical_faults) == 0

def test_diagnostics_prefilter_clogging_detected():
    simulator.set_mode("PREFILTER_CLOGGED")
    reading = simulator.generate_current_reading()
    faults = diagnostic_engine.diagnose(reading)

    fault_codes = [f["fault_code"] for f in faults]
    assert "PREFILTER_CLOGGED" in fault_codes

    # Check that confidence is calibrated between 0 and 1
    pf_fault = next(f for f in faults if f["fault_code"] == "PREFILTER_CLOGGED")
    assert 0.5 <= pf_fault["confidence"] <= 1.0
    assert len(pf_fault["evidence"]) > 0
    assert "sediment_filter" in pf_fault["affected_components"]

def test_diagnostics_membrane_scaling_detected():
    simulator.set_mode("MEMBRANE_SCALING")
    reading = simulator.generate_current_reading()
    faults = diagnostic_engine.diagnose(reading)

    fault_codes = [f["fault_code"] for f in faults]
    assert "MEMBRANE_SCALING" in fault_codes

def test_diagnostics_chemical_attack_detected():
    simulator.set_mode("MEMBRANE_DEGRADED")
    reading = simulator.generate_current_reading()
    faults = diagnostic_engine.diagnose(reading)

    fault_codes = [f["fault_code"] for f in faults]
    assert "OXIDANT_EXPOSURE" in fault_codes
