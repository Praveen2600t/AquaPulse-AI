import math
import pytest
from backend.simulation.engine import simulator

def test_salt_rejection_calculation():
    # R = (1 - EC_permeate / EC_feed) * 100
    # Case 1: Feed 1000 uS/cm, Permeate 50 uS/cm -> 95%
    r1 = simulator.calculate_salt_rejection(1000.0, 50.0)
    assert abs(r1 - 95.0) < 0.01

    # Case 2: Feed 800 uS/cm, Permeate 80 uS/cm -> 90%
    r2 = simulator.calculate_salt_rejection(800.0, 80.0)
    assert abs(r2 - 90.0) < 0.01

    # Edge cases
    assert simulator.calculate_salt_rejection(0.0, 50.0) == 0.0
    assert simulator.calculate_salt_rejection(1000.0, 1000.0) == 0.0

def test_temperature_correction_factor_tcf():
    # TCF = exp[2640 * (1/298.15 - 1/(T + 273.15))]
    # At 25 C (298.15 K), TCF must be exactly 1.000
    tcf_25 = simulator.calculate_tcf(25.0)
    assert abs(tcf_25 - 1.0) < 0.0001

    # Cold water (15 C) -> TCF < 1.0 (viscous water lowers flux)
    tcf_15 = simulator.calculate_tcf(15.0)
    assert tcf_15 < 1.0

    # Warm water (35 C) -> TCF > 1.0 (higher thermal flux)
    tcf_35 = simulator.calculate_tcf(35.0)
    assert tcf_35 > 1.0

def test_tds_conversion():
    reading = simulator.generate_current_reading()
    # Check that TDS = EC * 0.64
    assert abs(reading["feed_tds"] - round(reading["feed_ec"] * 0.64, 1)) <= 0.2
    assert abs(reading["permeate_tds"] - round(reading["permeate_ec"] * 0.64, 1)) <= 0.2
