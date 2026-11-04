import React, { useState } from 'react';
import { SystemOverview, api } from '../services/api';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ReportsPageProps {
  overview: SystemOverview;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ overview }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.downloadPdfReport();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const reading = overview.latest_reading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              AUDIT CERTIFICATION &amp; REPORTS
            </span>
            <span className="text-xs text-slate-400 font-mono">ReportLab PDF Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Engineering Diagnostic &amp; Water Quality Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download certified PDF system audits complete with institutional credentials, physics validations, and service forecasts.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Compiling PDF...' : 'Download Official PDF Report'}
        </button>
      </div>

      {/* Report Preview Document Canvas */}
      <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl space-y-6 max-w-4xl mx-auto bg-slate-950/80">
        {/* Document Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold">AQUAPULSE AI SYSTEM AUDIT</span>
            <h3 className="text-xl font-black text-white">
              Water Purifier Diagnostic Certificate
            </h3>
            <p className="text-xs text-slate-400">
              Institution: Sri Ramakrishna Institute of Technology, Coimbatore
            </p>
            <p className="text-xs text-slate-400">
              Engineering Team: NEXTGEN AI (Praveen K, Prithika C)
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 space-y-1">
            <p><span className="text-slate-500">Serial:</span> AP-9000-SRIT</p>
            <p><span className="text-slate-500">Model:</span> AquaPulse Pro 75GPD</p>
            <p><span className="text-slate-500">Date:</span> {new Date().toISOString().slice(0, 10)}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
              CERTIFIED GENERATION
            </span>
          </div>
        </div>

        {/* 1. Executive Summary Table */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
            1. Operational Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Status</span>
              <p className="font-bold text-white mt-0.5">{overview.purifier_status}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Salt Rejection</span>
              <p className="font-bold text-cyan-300 mt-0.5">{overview.salt_rejection.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Feed TDS</span>
              <p className="font-bold text-white mt-0.5">{overview.feed_tds.toFixed(0)} ppm</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Permeate TDS</span>
              <p className="font-bold text-emerald-400 mt-0.5">{overview.permeate_tds.toFixed(0)} ppm</p>
            </div>
          </div>
        </div>

        {/* 2. Sensor Telemetry Snapshot */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
            2. Sensor Telemetry Audit
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Sensor Channel</th>
                  <th className="p-3">Reading</th>
                  <th className="p-3">Nominal Limit</th>
                  <th className="p-3">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="p-3">Feed EC (Conductivity)</td>
                  <td className="p-3 text-cyan-300">{reading.feed_ec.toFixed(1)} µS/cm</td>
                  <td className="p-3 text-slate-400">200 - 1000 µS/cm</td>
                  <td className="p-3 text-emerald-400 font-sans">Normal</td>
                </tr>
                <tr>
                  <td className="p-3">Permeate Conductivity</td>
                  <td className="p-3 text-cyan-300">{reading.permeate_ec.toFixed(1)} µS/cm</td>
                  <td className="p-3 text-slate-400">&lt; 60 µS/cm</td>
                  <td className="p-3 text-emerald-400 font-sans">Optimal</td>
                </tr>
                <tr>
                  <td className="p-3">Pre-Filter ΔP (P1 - P2)</td>
                  <td className="p-3 text-cyan-300">{reading.pre_filter_dp.toFixed(1)} psi</td>
                  <td className="p-3 text-slate-400">&lt; 10.0 psi</td>
                  <td className="p-3 text-emerald-400 font-sans">{reading.pre_filter_dp < 10 ? 'Nominal' : 'Clogged'}</td>
                </tr>
                <tr>
                  <td className="p-3">Membrane Head (P3)</td>
                  <td className="p-3 text-cyan-300">{reading.p3_membrane_pressure.toFixed(1)} psi</td>
                  <td className="p-3 text-slate-400">70 - 95 psi</td>
                  <td className="p-3 text-emerald-400 font-sans">Nominal</td>
                </tr>
                <tr>
                  <td className="p-3">Temperature Correction Factor</td>
                  <td className="p-3 text-cyan-300">{reading.tcf.toFixed(4)}</td>
                  <td className="p-3 text-slate-400">25°C Norm (1.000)</td>
                  <td className="p-3 text-emerald-400 font-sans">Calibrated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Component Health & RUL Summary */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
            3. Filtration Stage Health &amp; Projected Service Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {overview.components.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{c.name.split(' ')[0]}</span>
                <p className="text-base font-bold text-white mt-0.5">{c.health_percentage.toFixed(0)}%</p>
                <p className="text-[11px] text-cyan-300 mt-1">RUL: ~{c.estimated_days_remaining}d</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Mandatory Scientific Safety Statement */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <p className="font-bold text-slate-300">Mandatory Regulatory Notice:</p>
          <p>
            AquaPulse AI monitors physical, chemical, and hydraulic proxy indicators. ORP (Oxidation-Reduction Potential) measures overall net oxidizer potential and must not be described as a chlorine-specific concentration. Neither TDS, pH, ORP, nor Turbidity establish microbiological potability. The system does not detect biological pathogens or certify drinking water safety.
          </p>
        </div>
      </div>
    </div>
  );
};
