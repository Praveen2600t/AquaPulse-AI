import pytest
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine

def test_sensor_engine_normal_reading():
    simulator.set_mode("NORMAL")
    reading = simulator.generate_current_reading()

    assert "feed_ec" in reading
    assert "permeate_ec" in reading
    assert "salt_rejection" in reading
    assert "pre_filter_dp" in reading
    assert "p1_feed_pressure" in reading
    assert "p2_pump_inlet_pressure" in reading
    assert "p3_membrane_pressure" in reading

    # In normal mode, salt rejection should be >= 92%
    assert reading["salt_rejection"] >= 90.0
    # Pre-filter DP should be < 10 psi
    assert reading["pre_filter_dp"] < 10.0
    # P1 should be greater than P2
    assert reading["p1_feed_pressure"] > reading["p2_pump_inlet_pressure"]

def test_prefilter_clogged_mode():
    simulator.set_mode("PREFILTER_CLOGGED")
    reading = simulator.generate_current_reading()

    # Pre-filter DP should spike > 12 psi
    assert reading["pre_filter_dp"] > 12.0
    # Turbidity should be elevated
    assert reading["feed_turbidity"] > 4.0

def test_membrane_scaling_mode():
    simulator.set_mode("MEMBRANE_SCALING")
    reading = simulator.generate_current_reading()

    # Rejection should drop significantly
    assert reading["salt_rejection"] < 89.0

def test_component_health_evaluation():
    simulator.set_mode("NORMAL")
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)

    assert len(components) == 5
    ids = [c["id"] for c in components]
    assert "sediment_filter" in ids
    assert "carbon_filter" in ids
    assert "ro_membrane" in ids
    assert "uf_filter" in ids
    assert "uv_chamber" in ids

    for c in components:
        assert 0.0 <= c["health_percentage"] <= 100.0
        assert c["status"] in ["healthy", "warning", "critical", "offline"]
        assert c["estimated_days_remaining"] > 0
