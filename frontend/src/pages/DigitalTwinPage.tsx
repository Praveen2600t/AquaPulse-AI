import React from 'react';
import { ComponentHealth, SensorReading } from '../services/api';
import { DigitalTwinViewer } from '../components/purifier3d/DigitalTwinViewer';
import { Box, Layers, Droplets, Info, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface DigitalTwinPageProps {
  components: ComponentHealth[];
  sensorReading: SensorReading;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  components,
  sensorReading,
  selectedComponentId,
  onSelectComponent,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              PHYSICS &amp; 3D DIGITAL TWIN
            </span>
            <span className="text-xs text-slate-400 font-mono">Three.js / WebGL</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Box className="w-6 h-6 text-cyan-400" />
            Interactive 3D Purifier Digital Twin
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rotate 360°, inspect individual filter stages, explode assemblies, and watch live permeate &amp; reject water flows.
          </p>
        </div>

        {/* Component Selector Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {components.map((c) => {
            const isSel = selectedComponentId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectComponent(isSel ? null : c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSel
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-cyan-500/40'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <DigitalTwinViewer
        components={components}
        sensorReading={sensorReading}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      />

      {/* Purifier Stages Architecture Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">1</span>
            <h4 className="text-sm font-bold text-white">Pre-Filtration Subsystem</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consists of the 5-micron Spun Polypropylene Candle to trap rust and suspended clay, followed by the Activated Carbon Block to adsorb chlorine, VOCs, and chloramines prior to RO entry.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">2</span>
            <h4 className="text-sm font-bold text-white">RO High-Pressure Separation</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Booster pump elevates hydraulic pressure to ~85 psi overcoming osmotic pressure. The semi-permeable spiral wound polyamide membrane rejects up to 96% of dissolved ionic salts.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">3</span>
            <h4 className="text-sm font-bold text-white">Post-Polishing &amp; Biocidal Chamber</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Permeate stream traverses the hollow-fiber Ultra-Filtration (UF) polish cartridge before entering the 11W 254nm stainless steel UV-C Disinfection Chamber ensuring safe dispensation.
          </p>
        </div>
      </div>
    </div>
  );
};
