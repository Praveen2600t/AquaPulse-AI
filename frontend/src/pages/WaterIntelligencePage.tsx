import React from 'react';
import { SensorReading } from '../services/api';
import {
  Droplets,
  Gauge,
  Activity,
  Thermometer,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface WaterIntelligencePageProps {
  reading: SensorReading;
  history: SensorReading[];
}

export const WaterIntelligencePage: React.FC<WaterIntelligencePageProps> = ({
  reading,
  history,
}) => {
  const chartData = history.slice(-30).map((r) => ({
    time: r.timestamp.slice(11, 19),
    feed_ec: r.feed_ec,
    perm_ec: r.permeate_ec,
    feed_tds: r.feed_tds,
    perm_tds: r.permeate_tds,
    salt_rej: r.salt_rejection,
    p1: r.p1_feed_pressure,
    p2: r.p2_pump_inlet_pressure,
    p3: r.p3_membrane_pressure,
    dp: r.pre_filter_dp,
    temp: r.feed_temp,
    turbidity: r.feed_turbidity,
    orp: r.feed_orp,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            WATER INTELLIGENCE &amp; HYDRODYNAMICS
          </span>
          <span className="text-xs text-slate-400 font-mono">11 Sensor Channels</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-cyan-400" />
          Sensor Telemetry &amp; Physics Derivations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time monitoring of raw feed water chemistry, hydraulic membrane pressures, and thermodynamic temperature corrections.
        </p>
      </div>

      {/* Physics Derivation Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Formula 1: Salt Rejection */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            DERIVATION 1
          </span>
          <h4 className="text-xs font-bold text-white mt-1">Salt Rejection (R)</h4>
          <p className="text-2xl font-black text-cyan-300 mt-2">
            {reading.salt_rejection.toFixed(1)}%
          </p>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 mt-2">
            R = (1 - EC_perm / EC_feed) × 100
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Measures ionic rejection efficiency of the polyamide thin-film composite membrane.
          </p>
        </div>

        {/* Formula 2: Pre-Filter Pressure Drop */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            DERIVATION 2
          </span>
          <h4 className="text-xs font-bold text-white mt-1">Pre-Filter ΔP</h4>
          <p className="text-2xl font-black text-cyan-300 mt-2">
            {reading.pre_filter_dp.toFixed(1)} psi
          </p>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 mt-2">
            ΔP_pre = P1 - P2
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Differential pressure across sediment &amp; carbon stages. Normal: 3-8 psi.
          </p>
        </div>

        {/* Formula 3: Temperature Correction Factor (TCF) */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            DERIVATION 3
          </span>
          <h4 className="text-xs font-bold text-white mt-1">Temp Correction (TCF)</h4>
          <p className="text-2xl font-black text-cyan-300 mt-2">
            {reading.tcf.toFixed(4)}
          </p>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300 mt-2">
            TCF = exp[2640(1/298.15 - 1/T)]
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Standard Arrhenius water viscosity compensation normalized to 25°C (298.15 K).
          </p>
        </div>

        {/* Formula 4: Recovery Ratio */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            DERIVATION 4
          </span>
          <h4 className="text-xs font-bold text-white mt-1">Recovery Ratio</h4>
          <p className="text-2xl font-black text-cyan-300 mt-2">
            {reading.recovery_ratio.toFixed(1)}%
          </p>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 mt-2">
            Rec = (Q_prod / Q_total) × 100
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Ratio of dispensed permeate water to raw feed water volume.
          </p>
        </div>
      </div>

      {/* Sensor Channels Grid Table */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Active Telemetry Channel Data
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Feed EC</span>
            <p className="text-lg font-bold text-white mt-1">{reading.feed_ec.toFixed(1)} µS</p>
            <span className="text-[10px] text-slate-400">TDS: {reading.feed_tds.toFixed(0)} ppm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Permeate EC</span>
            <p className="text-lg font-bold text-white mt-1">{reading.permeate_ec.toFixed(1)} µS</p>
            <span className="text-[10px] text-slate-400">TDS: {reading.permeate_tds.toFixed(0)} ppm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Feed pH</span>
            <p className="text-lg font-bold text-white mt-1">{reading.feed_ph.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-400">Potable 6.5 - 8.5</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Feed ORP</span>
            <p className="text-lg font-bold text-white mt-1">{reading.feed_orp.toFixed(1)} mV</p>
            <span className="text-[10px] text-slate-400">Oxidant Potential</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Feed Turbidity</span>
            <p className="text-lg font-bold text-white mt-1">{reading.feed_turbidity.toFixed(2)} NTU</p>
            <span className="text-[10px] text-slate-400">Suspended Silt</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Water Temp</span>
            <p className="text-lg font-bold text-white mt-1">{reading.feed_temp.toFixed(1)} °C</p>
            <span className="text-[10px] text-slate-400">Ambient Tap</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">P1 Pressure (Feed)</span>
            <p className="text-lg font-bold text-white mt-1">{reading.p1_feed_pressure.toFixed(1)} psi</p>
            <span className="text-[10px] text-slate-400">Tap Mains Supply</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">P2 (Pump Inlet)</span>
            <p className="text-lg font-bold text-white mt-1">{reading.p2_pump_inlet_pressure.toFixed(1)} psi</p>
            <span className="text-[10px] text-slate-400">Post Pre-Filter</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">P3 (RO Inlet)</span>
            <p className="text-lg font-bold text-white mt-1">{reading.p3_membrane_pressure.toFixed(1)} psi</p>
            <span className="text-[10px] text-slate-400">Booster Operating</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Product Flow</span>
            <p className="text-lg font-bold text-white mt-1">{reading.product_flow.toFixed(1)} L/h</p>
            <span className="text-[10px] text-cyan-400">Dispensed Water</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Reject Flow</span>
            <p className="text-lg font-bold text-white mt-1">{reading.reject_flow.toFixed(1)} L/h</p>
            <span className="text-[10px] text-amber-400">Brine Discharge</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Purified</span>
            <p className="text-lg font-bold text-white mt-1">{(reading.total_liters_purified || 14820).toFixed(0)} L</p>
            <span className="text-[10px] text-slate-400">Cumulative Volume</span>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Raw Feed EC vs Permeate EC */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Feed vs. Permeate Conductivity (µS/cm)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparison of raw inlet salinity vs purified water permeate.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#0284c7',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="feed_ec" stroke="#38bdf8" name="Feed EC" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="perm_ec" stroke="#10b981" name="Permeate EC" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hydraulic Pressures (P1, P2, P3) */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            Hydraulic Pressures: P1, P2 &amp; P3 (psi)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Feed pressure (P1), pump suction (P2), and RO membrane head (P3).
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#0284c7',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="p1" stroke="#94a3b8" name="P1 Feed" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p2" stroke="#f59e0b" name="P2 Suction" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p3" stroke="#06b6d4" name="P3 Membrane" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white">Scientific &amp; Regulatory Safety Note</h4>
          <p className="text-slate-400 leading-relaxed">
            AquaPulse AI monitors physical, chemical, and hydraulic proxy indicators. ORP (Oxidation-Reduction Potential) measures overall net oxidizer potential and must not be described as a chlorine-specific concentration. Neither TDS, pH, ORP, nor Turbidity establish microbiological potability. The system does not detect biological pathogens or certify drinking water safety.
          </p>
        </div>
      </div>
    </div>
  );
};
