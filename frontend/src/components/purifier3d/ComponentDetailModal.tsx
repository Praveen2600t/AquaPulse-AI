import React from 'react';
import { ComponentHealth, SensorReading } from '../../services/api';
import { X, Wrench, AlertTriangle, ShieldCheck, Activity, Gauge, Clock, Calendar } from 'lucide-react';

interface ComponentDetailModalProps {
  component: ComponentHealth | null;
  sensorReading: SensorReading;
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  sensorReading,
  onClose,
}) => {
  if (!component) return null;

  const isHealthy = component.status === 'healthy';
  const isWarning = component.status === 'warning';
  const isCritical = component.status === 'critical';

  return (
    <div className="absolute top-4 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] glass-panel p-5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-start justify-between pb-3 border-b border-slate-700/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            {component.category}
          </span>
          <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
            {component.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Health Meter */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Stage Health Condition</span>
          <span
            className={`font-bold ${
              isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {component.health_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.max(5, component.health_percentage)}%` }}
          />
        </div>
      </div>

      {/* Grid of Key Technical Metrics */}
      <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Days Left
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            ~{component.estimated_days_remaining} days
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Fouling Index
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {component.fouling_index.toFixed(1)} / 10.0
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Liters Filtered
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {component.liters_processed.toLocaleString()} L
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Last Serviced
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {component.last_replaced}
          </p>
        </div>
      </div>

      {/* Active Fault Alert if any */}
      {component.fault_detected && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-red-300">Fault Detected</h4>
            <p className="text-xs text-red-200 mt-0.5 leading-relaxed">
              {component.fault_detected}
            </p>
          </div>
        </div>
      )}

      {/* Service Recommendation */}
      <div className="mt-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
          <Wrench className="w-3.5 h-3.5" /> Maintenance Recommendation
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {component.service_recommendation}
        </p>
      </div>
    </div>
  );
};
