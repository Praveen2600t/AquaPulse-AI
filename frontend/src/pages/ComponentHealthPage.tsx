import React from 'react';
import { ComponentHealth, SensorReading } from '../services/api';
import {
  HeartPulse,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Gauge,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ComponentHealthPageProps {
  components: ComponentHealth[];
  sensorReading: SensorReading;
  onSelectComponent: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ComponentHealthPage: React.FC<ComponentHealthPageProps> = ({
  components,
  sensorReading,
  onSelectComponent,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            COMPONENT HEALTH CENTRE
          </span>
          <span className="text-xs text-slate-400 font-mono">5 Filtration Subsystems</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-cyan-400" />
          Filtration Stage Health &amp; Wear Trajectories
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed condition assessment, fouling indices, accumulated volumetric wear, and tailored service recommendations.
        </p>
      </div>

      {/* Grid of 5 Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {components.map((comp) => {
          const isCritical = comp.status === 'critical';
          const isWarning = comp.status === 'warning';
          const isHealthy = comp.status === 'healthy';

          return (
            <div
              key={comp.id}
              className={`p-6 rounded-3xl glass-panel border transition-all flex flex-col justify-between ${
                isCritical
                  ? 'border-red-500/50 bg-red-950/20'
                  : isWarning
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-cyan-500/25 bg-slate-900/60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                    {comp.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {isCritical ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-4 h-4" /> Critical
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-4 h-4" /> Warning
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Healthy
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{comp.name}</h3>

                {/* Health Meter */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-400">Remaining Health</span>
                    <span
                      className={
                        isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'
                      }
                    >
                      {comp.health_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.max(5, comp.health_percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Days Left
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      ~{comp.estimated_days_remaining} d
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" /> Fouling Index
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {comp.fouling_index.toFixed(1)} / 10
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" /> Filtered
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {comp.liters_processed.toLocaleString()} L
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" /> Serviced
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">{comp.last_replaced}</p>
                  </div>
                </div>

                {/* Fault Alert Box */}
                {comp.fault_detected && (
                  <div className="mt-3.5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs">
                    <span className="font-bold text-red-300 flex items-center gap-1.5 mb-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Condition Alert
                    </span>
                    <p className="text-red-200 text-[11px] leading-relaxed">
                      {comp.fault_detected}
                    </p>
                  </div>
                )}

                {/* Service Recommendation */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Wrench className="w-3.5 h-3.5" /> Service Guidance
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {comp.service_recommendation}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  onSelectComponent(comp.id);
                  onNavigateTab('twin');
                }}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-slate-300 font-semibold text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
              >
                Inspect in 3D Twin <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
