from fastapi import APIRouter, Response
from backend.simulation.engine import simulator
from backend.simulation.health_engine import ComponentHealthEngine
from backend.ml.diagnostics import diagnostic_engine
from backend.ml.rul_predictor import rul_engine
from backend.reports.generator import generate_pdf_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/download")
def download_pdf_report():
    reading = simulator.generate_current_reading()
    components = ComponentHealthEngine.evaluate_all(reading)
    faults = diagnostic_engine.diagnose(reading)
    rul_list = rul_engine.predict_component_rul(components, reading)

    pdf_bytes = generate_pdf_report(reading, components, faults, rul_list)

    filename = f"AquaPulse_Diagnostic_Report_{reading['timestamp'][:10]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
