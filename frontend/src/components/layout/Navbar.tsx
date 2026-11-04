import React from 'react';
import { Droplets, Activity, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface NavbarProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
  overallHealth: number;
  activeAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  overallHealth,
  activeAlertsCount,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await api.downloadPdfReport();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Droplets className="w-6 h-6 text-slate-950 fill-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              AquaPulse <span className="text-cyan-400">AI</span>
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              v2.0 PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            NEXTGEN AI • Sri Ramakrishna Institute of Technology, Coimbatore
          </p>
        </div>
      </div>

      {/* Right Controls: Mode Selector & Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Simulation Scenario Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <Activity className="w-4 h-4 text-cyan-400 hidden md:block" />
          <span className="text-xs text-slate-400 hidden lg:inline">Mode:</span>
          <select
            value={currentMode}
            onChange={(e) => onModeChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-cyan-300 outline-none cursor-pointer"
          >
            <option value="NORMAL" className="bg-slate-900 text-white">Normal Nominal Operation</option>
            <option value="PREFILTER_CLOGGED" className="bg-slate-900 text-white">Fault: Pre-Filter Clogging (ΔP &gt; 15 psi)</option>
            <option value="MEMBRANE_SCALING" className="bg-slate-900 text-white">Fault: RO Membrane Scaling (Rejection Drop)</option>
            <option value="MEMBRANE_DEGRADED" className="bg-slate-900 text-white">Fault: Oxidant Chemical Attack (High ORP)</option>
            <option value="CONDUCTIVITY_SPIKE" className="bg-slate-900 text-white">Fault: Raw Water Salinity Spike (&gt;1400 µS)</option>
            <option value="PRESSURE_ABNORMAL" className="bg-slate-900 text-white">Fault: Low Feed Pressure (&lt;10 psi)</option>
            <option value="SENSOR_DRIFT" className="bg-slate-900 text-white">Fault: Sensor Drift / Signal Freeze</option>
          </select>
        </div>

        {/* Live Telemetry Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 tracking-wider">LIVE</span>
        </div>

        {/* Health Indicator Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
          {activeAlertsCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-bold text-white">{overallHealth.toFixed(0)}%</span>
        </div>

        {/* Download PDF Diagnostic Report */}
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{downloading ? 'Generating...' : 'PDF Report'}</span>
        </button>
      </div>
    </header>
  );
};
