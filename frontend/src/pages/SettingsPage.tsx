import React from 'react';
import {
  Settings,
  Activity,
  Sliders,
  Server,
  User,
  Shield,
  HelpCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface SettingsPageProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            SYSTEM PREFERENCES &amp; TELEMETRY CONFIG
          </span>
          <span className="text-xs text-slate-400 font-mono">Platform Settings</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Settings &amp; Simulation Environment
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage system identity, simulation operating modes, telemetry polling frequencies, and deployment endpoints.
        </p>
      </div>

      {/* 1. Simulation Mode Controller */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Active Telemetry Simulation Mode
        </h3>
        <p className="text-xs text-slate-400">
          Inject specific real-world malfunction scenarios into the synthetic sensor stream to test AI diagnostics and 3D twin reactions in real-time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { id: 'NORMAL', label: 'Normal Nominal Operation', desc: 'All filters clean, optimal 96% salt rejection, nominal flow.' },
            { id: 'PREFILTER_CLOGGED', label: 'Pre-Filter Clogging', desc: 'Pre-filter ΔP spikes > 15 psi, starving booster pump suction.' },
            { id: 'MEMBRANE_SCALING', label: 'RO Membrane Scaling', desc: 'Severe salt rejection drop (< 85%), high TDS permeation.' },
            { id: 'MEMBRANE_DEGRADED', label: 'Oxidant Chemical Attack', desc: 'Chlorine breakthrough, elevated ORP > 450 mV, damaged pores.' },
            { id: 'CONDUCTIVITY_SPIKE', label: 'Raw Water Salinity Surge', desc: 'Inlet EC surges > 1400 µS/cm representing borewell shift.' },
            { id: 'PRESSURE_ABNORMAL', label: 'Low Feed Tap Pressure', desc: 'Mains pressure drops < 10 psi, risking cavitation.' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                currentMode === mode.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{mode.label}</span>
                {currentMode === mode.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. System Identity & Institution Credentials */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          System Identity &amp; Institution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Project Identity</span>
            <p className="text-sm font-bold text-white mt-1">AquaPulse AI</p>
            <p className="text-[11px] text-cyan-300 mt-0.5">
              "A water purifier that reads your water and warns you before the filter fails."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Engineering Team</span>
            <p className="text-sm font-bold text-white mt-1">NEXTGEN AI</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Praveen K &amp; Prithika C
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Affiliation &amp; Institution</span>
            <p className="text-sm font-bold text-white mt-1">Sri Ramakrishna Institute of Technology</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Coimbatore, Tamil Nadu, India</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Hardware Profile</span>
            <p className="text-sm font-bold text-white mt-1">AquaPulse Pro 75GPD</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Serial: AP-9000-SRIT</p>
          </div>
        </div>
      </div>

      {/* 3. API & Infrastructure Status */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          Architecture &amp; Cloud Deployment
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span>Frontend Hosting</span>
            <span className="font-bold text-cyan-400">Vercel (React + Vite + TypeScript)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span>Backend API Service</span>
            <span className="font-bold text-cyan-400">FastAPI (Python + Uvicorn + Scikit-Learn)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span>Database Backend</span>
            <span className="font-bold text-cyan-400">PostgreSQL (Production) / SQLite (Dev)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span>3D Digital Twin Engine</span>
            <span className="font-bold text-cyan-400">Three.js + React Three Fiber + Drei</span>
          </div>
        </div>
      </div>
    </div>
  );
};
