import React from 'react';
import {
  SystemOverview,
  SensorReading,
  FailureFingerprint,
  ComponentHealth,
  RULPrediction,
} from '../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Droplets,
  Gauge,
  Activity,
  Calendar,
  Box,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface OverviewDashboardProps {
  overview: SystemOverview;
  history: SensorReading[];
  onNavigateTab: (tab: any) => void;
  onSelectComponent: (id: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  overview,
  history,
  onNavigateTab,
  onSelectComponent,
}) => {
  const isHealthy = overview.active_alerts_count === 0 && overview.salt_rejection >= 90;
  const isCritical = overview.purifier_status === 'CRITICAL_ACTION_REQUIRED';

  const chartData = history.slice(-25).map((r, i) => ({
    time: r.timestamp.slice(11, 19),
    feed_ec: r.feed_ec,
    perm_ec: r.permeate_ec,
    rejection: r.salt_rejection,
    dp: r.pre_filter_dp,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Operational Status Banner */}
      <div
        className={`p-6 rounded-3xl border transition-all shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isCritical
            ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-950 border-red-500/50 text-red-200'
            : isHealthy
            ? 'bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-slate-950 border-cyan-500/40 text-cyan-100'
            : 'bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-slate-950 border-amber-500/40 text-amber-100'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isCritical
                ? 'bg-red-500/20 text-red-400'
                : isHealthy
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isCritical ? (
              <AlertCircle className="w-8 h-8" />
            ) : isHealthy ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-current">
                {overview.purifier_status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Mode: {overview.current_operating_mode}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">
              {overview.status_summary}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Continuous physics evaluation & AI anomaly monitoring active. Next recommended service in {overview.days_to_next_maintenance} days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('twin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25"
          >
            <Box className="w-4 h-4" />
            Inspect 3D Twin
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Purifier Health
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.overall_health.toFixed(1)}%
          </p>
          <span className="text-[11px] text-cyan-400 font-medium">Weighted Composite</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Salt Rejection
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.salt_rejection.toFixed(1)}%
          </p>
          <span className={`text-[11px] font-medium ${overview.salt_rejection >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {overview.salt_rejection >= 90 ? 'Nominal (>90%)' : 'Sub-optimal'}
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Permeate TDS
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.permeate_tds.toFixed(0)} <span className="text-xs font-normal text-slate-400">ppm</span>
          </p>
          <span className="text-[11px] text-slate-400">Feed: {overview.feed_tds.toFixed(0)} ppm</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Pre-Filter ΔP
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.latest_reading.pre_filter_dp.toFixed(1)} <span className="text-xs font-normal text-slate-400">psi</span>
          </p>
          <span className={`text-[11px] font-medium ${overview.latest_reading.pre_filter_dp < 10 ? 'text-emerald-400' : 'text-red-400'}`}>
            {overview.latest_reading.pre_filter_dp < 10 ? 'Clean (<10 psi)' : 'Clogged (>12 psi)'}
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Product Flow
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.product_flow.toFixed(1)} <span className="text-xs font-normal text-slate-400">L/h</span>
          </p>
          <span className="text-[11px] text-slate-400">Reject: {overview.reject_flow.toFixed(1)} L/h</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel glass-card-hover border border-cyan-500/20">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Next Service
          </span>
          <p className="text-2xl font-black text-white mt-2">
            {overview.days_to_next_maintenance} <span className="text-xs font-normal text-slate-400">days</span>
          </p>
          <span className="text-[11px] text-cyan-400">{overview.predicted_maintenance_date}</span>
        </div>
      </div>

      {/* 3. Middle Section: Stage Health Summary & Real-time Rejection Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 5-Stage Purifier Health */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                Component Stage Health Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Click any stage to view in the 3D Digital Twin or inspect technical wear parameters.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Health Center <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {overview.components.map((comp: ComponentHealth) => {
              const statusColor =
                comp.status === 'critical'
                  ? 'border-red-500/60 bg-red-950/20 text-red-400'
                  : comp.status === 'warning'
                  ? 'border-amber-500/60 bg-amber-950/20 text-amber-400'
                  : 'border-cyan-500/30 bg-slate-900/60 text-cyan-400';

              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    onSelectComponent(comp.id);
                    onNavigateTab('twin');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] ${statusColor}`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {comp.category}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">
                    {comp.name}
                  </h4>
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <span className="text-lg font-black text-white">
                      {comp.health_percentage.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-300">
                      ~{comp.estimated_days_remaining}d
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.status === 'critical'
                          ? 'bg-red-500'
                          : comp.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.max(5, comp.health_percentage)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick 3D Teaser Strip */}
          <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Interactive 3D Digital Twin</p>
                <p className="text-[11px] text-slate-400">
                  Rotate 360°, trigger exploded assembly, and observe live animated permeate & brine particle flow.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('twin')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all shrink-0"
            >
              Open 3D Model
            </button>
          </div>
        </div>

        {/* Right 1 Col: Real-time Salt Rejection Trend */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Live Salt Rejection Trend
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                {overview.salt_rejection.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Physics equation: R = (1 - EC_perm / EC_feed) × 100
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRej" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[70, 100]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#0284c7',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rejection"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRej)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Nominal Bound: &gt; 92.0%</span>
            <span className="text-cyan-300">TCF: {overview.latest_reading.tcf.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Active AI Faults & Predictive Maintenance Quickview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active AI Faults */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Active AI Failure Fingerprints ({overview.active_faults.length})
            </h3>
            <button
              onClick={() => onNavigateTab('diagnostics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Diagnostics Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overview.active_faults.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">All Fingerprints Clear</p>
              <p className="text-xs text-slate-400 mt-1">
                Isolation Forest and deterministic physics engines detect zero active anomalies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.active_faults.map((f: FailureFingerprint, i: number) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border ${
                    f.severity === 'critical'
                      ? 'bg-red-950/30 border-red-500/40'
                      : 'bg-amber-950/30 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{f.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-900 border border-current">
                      Confidence: {Math.round(f.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {f.root_cause}
                  </p>
                  <div className="text-[11px] text-cyan-300 font-medium">
                    Action: {f.recommended_action}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictive Maintenance & RUL Forecast */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Predictive RUL & Service Forecast
            </h3>
            <button
              onClick={() => onNavigateTab('predictions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              View Model Projections <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {overview.rul_predictions.slice(0, 3).map((pred: RULPrediction) => (
              <div
                key={pred.component_id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{pred.component_name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {pred.primary_degradation_factor}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-300">
                    {pred.nominal_days_left} days
                  </span>
                  <p className="text-[10px] text-slate-400">
                    [{pred.pessimistic_days_left}d - {pred.optimistic_days_left}d]
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            Methodology: Physics-Informed Exponential Degradation Regression. MAE: 3.8 days.
          </div>
        </div>
      </div>
    </div>
  );
};
