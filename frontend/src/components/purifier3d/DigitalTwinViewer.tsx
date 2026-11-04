import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ComponentHealth, SensorReading } from '../../services/api';
import { PurifierModel } from './PurifierModel';
import { WaterFlowParticles } from './WaterFlowParticles';
import { ComponentDetailModal } from './ComponentDetailModal';
import { SchematicFallback } from './SchematicFallback';
import {
  RotateCcw,
  Sliders,
  Play,
  Pause,
  Maximize2,
  Droplets,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface DigitalTwinViewerProps {
  components: ComponentHealth[];
  sensorReading: SensorReading;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string | null) => void;
}

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({
  components,
  sensorReading,
  selectedComponentId: externalSelected,
  onSelectComponent: externalOnSelect,
}) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [explodedSlider, setExplodedSlider] = useState<number>(0.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [showWaterFlow, setShowWaterFlow] = useState<boolean>(true);

  const selectedComponentId = externalSelected !== undefined ? externalSelected : internalSelected;
  const setSelectedComponentId = (id: string | null) => {
    if (externalOnSelect) {
      externalOnSelect(id);
    } else {
      setInternalSelected(id);
    }
  };

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Update exploded slider when button toggled
  const handleToggleExploded = () => {
    const next = !isExploded;
    setIsExploded(next);
    setExplodedSlider(next ? 1.0 : 0.0);
  };

  const selectedComp = components.find((c) => c.id === selectedComponentId) || null;

  if (!webglSupported) {
    return (
      <SchematicFallback
        components={components}
        selectedComponent={selectedComponentId}
        onSelectComponent={(id) => setSelectedComponentId(id)}
        productFlow={sensorReading.product_flow}
        rejectFlow={sensorReading.reject_flow}
      />
    );
  }

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#070e1b] via-[#091527] to-[#040811] border border-cyan-500/20 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas shadows dpr={[1, 2]} className="cursor-grab active:cursor-grabbing">
        <PerspectiveCamera makeDefault position={[0, 1.8, 6.2]} fov={45} />
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          enablePan={true}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 6}
        />

        {/* Studio Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-6, -2, -4]} intensity={0.5} color="#0284c7" />
        <pointLight position={[0, 4, 3]} intensity={1.2} color="#38bdf8" distance={10} />
        <pointLight position={[-2, 0, 2]} intensity={0.6} color="#06b6d4" />

        <Suspense fallback={null}>
          <PurifierModel
            components={components}
            selectedComponent={selectedComponentId}
            onSelectComponent={(id) => setSelectedComponentId(id)}
            explodedProgress={explodedSlider}
          />

          {showWaterFlow && (
            <WaterFlowParticles
              explodedProgress={explodedSlider}
              productFlow={sensorReading.product_flow}
              rejectFlow={sensorReading.reject_flow}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Floating HUD: Top-Left Legend & Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-2 rounded-xl glass-panel border border-cyan-500/30 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">3D DIGITAL TWIN</span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">
            {isExploded ? 'EXPLODED VIEW' : 'NORMAL ASSEMBLY'}
          </span>
        </div>

        {/* Color Key */}
        <div className="pointer-events-auto px-3 py-2 rounded-xl glass-panel border border-slate-700/60 flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical
          </span>
        </div>
      </div>

      {/* Floating HUD: Bottom Controls Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        {/* Exploded View Toggle */}
        <button
          onClick={handleToggleExploded}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isExploded
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {isExploded ? 'Normal View' : 'Exploded View'}
        </button>

        {/* Exploded slider */}
        <div className="flex items-center gap-2 px-2 border-l border-slate-700">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explodedSlider}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setExplodedSlider(val);
              setIsExploded(val > 0.05);
            }}
            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Water Flow Stream Toggle */}
        <button
          onClick={() => setShowWaterFlow(!showWaterFlow)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            showWaterFlow
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-800/80 text-slate-400'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Flow Particles
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-xl text-xs transition-colors ${
            autoRotate
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Clear Selection */}
        {selectedComponentId && (
          <button
            onClick={() => setSelectedComponentId(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700"
          >
            Clear Selected
          </button>
        )}
      </div>

      {/* Floating HUD: Water Flow Indicators (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden md:flex flex-col gap-1.5 text-right font-mono text-xs">
        <div className="px-3 py-1.5 rounded-xl glass-panel border border-cyan-500/20 text-cyan-400">
          Clean Permeate: <span className="font-bold">{sensorReading.product_flow.toFixed(1)} L/h</span>
        </div>
        <div className="px-3 py-1.5 rounded-xl glass-panel border border-amber-500/20 text-amber-400">
          Reject Brine: <span className="font-bold">{sensorReading.reject_flow.toFixed(1)} L/h</span>
        </div>
      </div>

      {/* Selected Component Detail Modal Overlay */}
      {selectedComp && (
        <ComponentDetailModal
          component={selectedComp}
          sensorReading={sensorReading}
          onClose={() => setSelectedComponentId(null)}
        />
      )}
    </div>
  );
};
