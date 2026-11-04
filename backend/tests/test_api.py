import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AquaPulse AI" in data["service"]

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_system_overview_endpoint():
    response = client.get("/api/system/overview")
    assert response.status_code == 200
    data = response.json()
    assert "overall_health" in data
    assert "salt_rejection" in data
    assert len(data["components"]) == 5
    assert "latest_reading" in data

def test_telemetry_current_and_history():
    res_curr = client.get("/api/telemetry/current")
    assert res_curr.status_code == 200
    assert "feed_ec" in res_curr.json()

    res_hist = client.get("/api/telemetry/history?limit=20")
    assert res_hist.status_code == 200
    assert len(res_hist.json()) <= 20

def test_simulation_scenario_endpoint():
    payload = {
        "feed_conductivity": 1200.0,
        "feed_pressure": 40.0,
        "temperature": 28.0,
        "turbidity": 4.0,
        "simulated_filter_age_days": 120,
        "flow_demand": 15.0
    }
    response = client.post("/api/simulation/scenario", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_salt_rejection" in data
    assert "simulated_pre_filter_dp" in data
    assert len(data["engineering_insights"]) > 0

def test_report_download_endpoint():
    response = client.get("/api/reports/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
