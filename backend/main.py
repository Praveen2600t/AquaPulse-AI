import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import telemetry, diagnostics, predictions, simulation, maintenance, reports, system
from backend.simulation.engine import simulator

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AquaPulse AI API",
    description="Backend API for AquaPulse AI Smart Water Purifier Monitoring & Predictive Maintenance Platform",
    version="2.0.0"
)

# CORS Configuration
# Allow local dev and production Vercel frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routers
app.include_router(system.router)
app.include_router(telemetry.router)
app.include_router(diagnostics.router)
app.include_router(predictions.router)
app.include_router(simulation.router)
app.include_router(maintenance.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "service": "AquaPulse AI Core API",
        "tagline": "A water purifier that reads your water and warns you before the filter fails.",
        "team": "NEXTGEN AI (Praveen K, Prithika C)",
        "institution": "Sri Ramakrishna Institute of Technology, Coimbatore",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": simulator.generate_current_reading()["timestamp"],
        "database": "connected",
        "simulation_engine": "active"
    }

# WebSocket for real-time live telemetry stream
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            reading = simulator.generate_current_reading()
            await websocket.send_json(reading)
            await asyncio.sleep(2.0) # 2-second streaming interval
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
