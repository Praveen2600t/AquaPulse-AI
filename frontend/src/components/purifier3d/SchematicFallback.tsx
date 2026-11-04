import React from 'react';
import { ComponentHealth } from '../../services/api';
import { Layers, CheckCircle2, AlertTriangle, AlertCircle, Droplets } from 'lucide-react';

interface SchematicFallbackProps {
  components: ComponentHealth[];
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
  productFlow: number;
  rejectFlow: number;
}

export const SchematicFallback: React.FC<SchematicFallbackProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  productFlow,
  rejectFlow,
}) => {
  const getComp = (id: string) => components.find((c) => c.id === id);

  const renderCard = (id: string, stageNum: number, name: string, category: string) => {
    const comp = getComp(id);
    const isSel = selectedComponent === id;
    const status = comp?.status || 'healthy';

    const borderColor =
      status === 'critical'
        ? 'border-red-500'
        : status === 'warning'
        ? 'border-amber-500'
        : 'border-cyan-500/40';

    const bgGlow =
      status === 'critical'
        ? 'bg-red-950/30'
        : status === 'warning'
        ? 'bg-amber-950/30'
        : 'bg-cyan-950/20';

    return (
      <button
        onClick={() => onSelectComponent(id)}
        className={`w-full p-4 rounded-xl border text-left transition-all ${borderColor} ${bgGlow} ${
          isSel ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]' : 'hover:border-cyan-400'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/30">
            Stage {stageNum} • {category}
          </span>
          {status === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : status === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <h4 className="text-sm font-bold text-white mb-1">{name}</h4>
        <div className="flex items-center justify-between text-xs text-slate-300 mt-2">
          <span>Health: {comp ? comp.health_percentage.toFixed(1) : 100}%</span>
          <span className="text-cyan-300">RUL: ~{comp?.estimated_days_remaining || 90}d</span>
        </div>
      </button>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            2D Isometric Flow Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-stage schematic representation (WebGL Hardware Acceleration Fallback)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Droplets className="w-4 h-4" /> Permeate Flow: {productFlow.toFixed(1)} L/h
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Droplets className="w-4 h-4" /> Reject Flow: {rejectFlow.toFixed(1)} L/h
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {renderCard('sediment_filter', 1, 'Sediment Filter', 'Pre-Treatment')}
        {renderCard('carbon_filter', 2, 'Activated Carbon', 'Adsorption')}
        {renderCard('ro_membrane', 3, 'RO Membrane Vessel', 'Main Separation')}
        {renderCard('uf_filter', 4, 'Ultra-Filtration', 'Polishing')}
        {renderCard('uv_chamber', 5, 'UV-C Disinfection', 'Biocidal')}
      </div>
    </div>
  );
};
