# AquaPulse AI

> **"A water purifier that reads your water and warns you before the filter fails."**

Developed by **Team NEXTGEN AI**  
- **Prithika C** & **Praveen K** 
- **Sri Ramakrishna Institute of Technology, Coimbatore**

---

## 1. Executive Summary

AquaPulse AI is an industrial-grade, AI-powered smart water purifier monitoring, predictive maintenance, and 3D digital twin platform.

Using physics-informed modeling, multi-channel synthetic telemetry, and Scikit-Learn failure fingerprint diagnostics, AquaPulse AI detects pre-filter clogging, membrane scaling, chemical oxidant breakthroughs, and sensor anomalies before irreversible hardware damage or contaminated water dispensation occurs.

---

## 2. Platform Architecture & Innovation

### A. Interactive 3D Water Purifier Digital Twin
Built using **Three.js**, **React Three Fiber (R3F)**, and **Drei**:
- **3D Components Modeled**:
  1. Sediment Spun Candle (5 Micron Polypropylene in clear acrylic housing)
  2. Activated Carbon Block Filter (Porous extruded carbon core)
  3. Booster Pump Assembly (Metallic finned motor with diaphragm head)
  4. TFC Reverse Osmosis (RO) Membrane Vessel (High-pressure composite cylinder)
  5. Post-Polishing Ultra-Filtration (UF) Inline Capsule
  6. UV-C Disinfection Chamber (Polished stainless steel with 254nm germicidal tube)
  7. Food-grade connecting tubing & capillary flow restrictor (FR450)
- **Interactive Capabilities**:
  - 360° OrbitControls (rotate, pan, zoom)
  - **Exploded Assembly View**: Animates components outward along spatial axes to inspect internal filter cartridges, O-rings, and plumbing connections
  - **Animated Particle Flow**: Real-time particles simulating raw feed inlet stream, clean permeate stream (glowing cyan), and brine reject discharge stream (amber)
  - **Interactive Selection**: Clicking any stage highlights the component with emissive glowing aura and opens the technical telemetry HUD modal
  - **WebGL Fallback**: Automatic isometric 2D fallback mode for devices without WebGL acceleration

### B. Physics-Informed Hydrodynamic Modeling
- **Salt Rejection**:
  $$R = \left(1 - \frac{EC_{permeate}}{EC_{feed}}\right) \times 100\%$$
- **Pre-Filter Pressure Drop**:
  $$\Delta P_{pre} = P_1 - P_2$$
- **Temperature Correction Factor (TCF)**:
  $$TCF = \exp\left[2640 \cdot \left(\frac{1}{298.15} - \frac{1}{T_{kelvin}}\right)\right]$$
- **Normalized Permeate Flow**:
  $$Q_{norm} = \frac{Q_{actual}}{TCF}$$
- **Recovery Ratio**:
  $$\text{Recovery} = \frac{Q_{product}}{Q_{product} + Q_{reject}} \times 100\%$$

### C. Failure Fingerprint Engine & Machine Learning
Hybrid diagnostic architecture combining deterministic physics limits with Scikit-Learn:
- **Isolation Forest**: Unsupervised anomaly detection identifying multi-sensor deviations
- **Random Forest Classifier**: Multi-class diagnostic engine outputting calibrated probabilities
- **Monitored Malfunctions**:
  1. `PREFILTER_CLOGGED`: High differential pressure ($\Delta P > 15 \text{ psi}$), starved booster pump suction
  2. `MEMBRANE_SCALING`: Salt rejection collapse ($R < 88\%$), mineral compaction
  3. `OXIDANT_EXPOSURE`: Free chlorine breakthrough past carbon, elevated ORP ($> 450 \text{ mV}$)
  4. `CONDUCTIVITY_SPIKE`: Raw water salinity surges ($> 1400 \ \mu\text{S/cm}$)
  5. `PRESSURE_ABNORMAL`: Low feed pressure ($P_1 < 10 \text{ psi}$), cavitation risk
  6. `FLOW_RATIO_ABNORMAL`: Flow restrictor scale choking or membrane bypass

### D. Automated PDF Diagnostic Certification
Built-in server-side PDF generator using **ReportLab**, producing formal water quality and engineering audit certificates with institutional credentials, physics validations, and service forecasts.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **3D Graphics** | Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei) |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Machine Learning** | Scikit-Learn, NumPy, Pandas |
| **Reports** | ReportLab |
| **Database** | SQLite (Local Dev) / PostgreSQL (Production) |
| **Hosting** | Vercel (Frontend), Render / Railway (Backend) |

---

## 4. Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Praveen2600t/AquaPulse-AI.git
cd AquaPulse-AI
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run backend tests
python -m pytest backend/tests/ -v

# Start FastAPI development server
uvicorn backend.main:app --reload --port 8000
```
Backend API will be accessible at `http://localhost:8000`. Interactive Swagger documentation available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## 5. Deployment Guide

### A. Vercel Frontend Deployment
1. Import the repository into your Vercel Dashboard (`Praveen2600t/AquaPulse-AI`).
2. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (or keep root with configured `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Settings > Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://your-aquapulse-backend.onrender.com
   ```
4. Deploy. Vercel will build and serve the single-page application with SPA routing rules handled via `vercel.json`.

### B. Backend Deployment (Render / Railway)
1. Create a new Web Service pointing to `https://github.com/Praveen2600t/AquaPulse-AI.git`.
2. Configure settings:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. In **Environment Variables**, configure:
   ```env
   ENVIRONMENT=production
   PORT=8000
   DATABASE_URL=postgresql://user:password@hostname:5432/aquapulse
   SECRET_KEY=aquapulse-production-secret-key-srit-nextgen-2026
   ```
4. Verification: Query the `/api/health` endpoint on your deployed backend.

---

## 6. Repository Structure

```
AquaPulse-AI/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node, python, secrets
├── vercel.json               # Root Vercel SPA routing and build configuration
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── backend/
│   ├── database.py           # SQLAlchemy database configuration
│   ├── main.py               # FastAPI application entrypoint & WebSockets
│   ├── requirements.txt      # Backend Python dependencies
│   ├── models/
│   │   ├── db_models.py      # SQLAlchemy persistence models
│   │   └── schemas.py        # Pydantic validation schemas
│   ├── simulation/
│   │   ├── engine.py         # Physics-informed synthetic sensor engine
│   │   └── health_engine.py  # 5-stage filter health degradation engine
│   ├── ml/
│   │   ├── diagnostics.py    # Failure Fingerprint Engine & Scikit-Learn models
│   │   └── rul_predictor.py  # Predictive maintenance & RUL regressor
│   ├── reports/
│   │   └── generator.py      # ReportLab official PDF certificate generator
│   ├── routes/
│   │   ├── system.py         # System overview & metadata
│   │   ├── telemetry.py      # Real-time sensor endpoints & history
│   │   ├── diagnostics.py    # Active fault fingerprinting
│   │   ├── predictions.py    # RUL predictions & degradation curves
│   │   ├── simulation.py     # What-If scenario sandbox
│   │   ├── maintenance.py    # Service logs, DIY guides, checklist
│   │   └── reports.py        # PDF report download endpoint
│   └── tests/
│       ├── test_physics.py
│       ├── test_simulation.py
│       ├── test_diagnostics.py
│       ├── test_reports.py
│       └── test_api.py
└── frontend/
    ├── package.json          # Node dependencies
    ├── vite.config.ts        # Vite + Tailwind 4 configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── vercel.json           # Frontend Vercel routing rules
    ├── index.html            # Web entry point
    └── src/
        ├── App.tsx           # Main application router
        ├── index.css         # Industrial dark theme design system
        ├── services/
        │   └── api.ts        # Axios client & local physics fallback
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx
        │   │   └── Sidebar.tsx
        │   └── purifier3d/
        │       ├── PurifierModel.tsx        # 3D geometries & materials
        │       ├── WaterFlowParticles.tsx   # Animated particle streamlines
        │       ├── DigitalTwinViewer.tsx    # R3F Canvas & OrbitControls
        │       ├── SchematicFallback.tsx    # 2D isometric fallback
        │       └── ComponentDetailModal.tsx # Filter inspection HUD
        └── pages/
            ├── OverviewDashboard.tsx
            ├── DigitalTwinPage.tsx
            ├── WaterIntelligencePage.tsx
            ├── ComponentHealthPage.tsx
            ├── DiagnosticsPage.tsx
            ├── PredictiveMaintenancePage.tsx
            ├── WhatIfSimulatorPage.tsx
            ├── MaintenanceCentrePage.tsx
            ├── ReportsPage.tsx
            └── SettingsPage.tsx
```

---

## 7. Mandatory Scientific & Safety Disclaimers

> **Safety Notice:**
> AquaPulse AI monitors physical, chemical, and hydraulic proxy indicators (Conductivity, TDS, pH, ORP, Turbidity, Pressure). 
> - **Oxidation-Reduction Potential (ORP)** measures overall net oxidizer potential and must not be described as a chlorine-specific concentration.
> - Neither TDS, pH, ORP, nor Turbidity establish microbiological potability.
> - The system does **NOT** detect biological pathogens or certify drinking water safety.
> - AI maintenance predictions are prototype estimates calculated using physics-informed degradation models and must never supersede physical laboratory inspections or manufacturer guidelines.

---

## 8. Authors & Institutional Credits

**Team NEXTGEN AI**  
- **Praveen K** & **Prithika C**  
- Department of Computer Science & Engineering / AI & DS  
- **Sri Ramakrishna Institute of Technology (SRIT), Coimbatore, Tamil Nadu, India**  
- GitHub Repository: [https://github.com/Praveen2600t/AquaPulse-AI](https://github.com/Praveen2600t/AquaPulse-AI)
