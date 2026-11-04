import pytest
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine
from backend.ml.diagnostics import diagnostic_engine
from backend.ml.rul_predictor import rul_engine
from backend.reports.generator import generate_pdf_report

def test_pdf_report_generation():
    simulator.set_mode("NORMAL")
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)
    faults = diagnostic_engine.diagnose(reading)
    rul_list = rul_engine.predict_component_rul(components, reading)

    pdf_bytes = generate_pdf_report(reading, components, faults, rul_list)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000 # Valid generated PDF document
    # PDF magic bytes header check
    assert pdf_bytes.startswith(b"%PDF-")
