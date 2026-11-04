import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ComponentHealth } from '../../services/api';

interface PurifierModelProps {
  components: ComponentHealth[];
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
  explodedProgress: number; // 0.0 (compact) to 1.0 (fully exploded)
}

export const PurifierModel: React.FC<PurifierModelProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  explodedProgress,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const uvGlowRef = useRef<THREE.PointLight>(null);

  // Helper to get status color for materials
  const getStatusColor = (id: string, defaultColor: string) => {
    const comp = components.find((c) => c.id === id);
    if (!comp) return defaultColor;
    if (comp.status === 'critical') return '#ef4444'; // Red
    if (comp.status === 'warning') return '#f59e0b';  // Amber
    if (comp.status === 'offline') return '#64748b';  // Grey
    return defaultColor; // Teal/Cyan or specified healthy color
  };

  const isSelected = (id: string) => selectedComponent === id;

  // Animate subtle UV light pulsing
  useFrame(({ clock }) => {
    if (uvGlowRef.current) {
      const t = clock.getElapsedTime();
      uvGlowRef.current.intensity = 1.8 + Math.sin(t * 4) * 0.4;
    }
  });

  const p = explodedProgress; // interpolation factor

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* 1. CHASSIS / BACKPLATE MOUNTING */}
      <mesh position={[0, 1.2, -0.9 - p * 0.5]}>
        <boxGeometry args={[4.2, 3.8, 0.15]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Top Mounting Bracket */}
      <mesh position={[0, 3.0, -0.7 - p * 0.4]}>
        <boxGeometry args={[4.0, 0.3, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* =========================================================================
          STAGE 1: SEDIMENT FILTER (5 Micron Polypropylene Spun)
          Position: Left vertical canister
      ========================================================================= */}
      <group
        position={[-1.4 - p * 1.5, 0.4 - p * 0.6, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('sediment_filter');
        }}
      >
        {/* Canister Head / Manifold */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.35, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Clear Acrylic Outer Bowl */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.4, 2.0, 32]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.38}
            roughness={0.1}
            transmission={0.85}
            thickness={0.5}
            ior={1.45}
          />
        </mesh>

        {/* Internal 5-Micron Spun Candle Core */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.85, 24]} />
          <meshStandardMaterial
            color={isSelected('sediment_filter') ? '#38bdf8' : getStatusColor('sediment_filter', '#f8fafc')}
            emissive={isSelected('sediment_filter') ? '#0284c7' : (getStatusColor('sediment_filter', '#000000') === '#ef4444' ? '#7f1d1d' : '#000000')}
            emissiveIntensity={isSelected('sediment_filter') ? 0.6 : 0.2}
            roughness={0.85}
          />
        </mesh>

        {/* Component Label Plaque in 3D */}
        <mesh position={[0, -1.15, 0.4]}>
          <boxGeometry args={[0.7, 0.2, 0.05]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>
      </group>

      {/* =========================================================================
          STAGE 2: ACTIVATED CARBON BLOCK FILTER
          Position: Middle-Left vertical canister
      ========================================================================= */}
      <group
        position={[-0.1 - p * 0.4, 0.4 - p * 0.6, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('carbon_filter');
        }}
      >
        {/* Canister Head */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.35, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Housing Bowl */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.4, 2.0, 32]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            transparent
            opacity={0.45}
            roughness={0.2}
            transmission={0.7}
          />
        </mesh>

        {/* Carbon Core (Dark Porous Block) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 1.85, 24]} />
          <meshStandardMaterial
            color={isSelected('carbon_filter') ? '#38bdf8' : getStatusColor('carbon_filter', '#334155')}
            emissive={isSelected('carbon_filter') ? '#0284c7' : (getStatusColor('carbon_filter', '#000000') === '#ef4444' ? '#7f1d1d' : '#000000')}
            emissiveIntensity={isSelected('carbon_filter') ? 0.6 : 0.2}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Label Plaque */}
        <mesh position={[0, -1.15, 0.4]}>
          <boxGeometry args={[0.7, 0.2, 0.05]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
      </group>

      {/* =========================================================================
          BOOSTER PUMP ASSEMBLY
          Position: Right lower deck
      ========================================================================= */}
      <group position={[1.3 + p * 0.8, 0.3, -0.2]}>
        {/* Motor Cylinder Body */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 1.3, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Cooling Ribs */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
          <mesh key={i} position={[offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.46, 0.46, 0.04, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Pump Head (Diaphragm Casing) */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.48, 0.4, 24]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Pressure Gauge Widget */}
        <mesh position={[0.75, 0.55, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* =========================================================================
          STAGE 3: REVERSE OSMOSIS (RO) MEMBRANE VESSEL
          Position: Top Horizontal Cylinder
      ========================================================================= */}
      <group
        position={[0, 2.1 + p * 1.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('ro_membrane');
        }}
      >
        {/* Main Vessel Body */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 3.2, 32]} />
          <meshStandardMaterial
            color={isSelected('ro_membrane') ? '#38bdf8' : getStatusColor('ro_membrane', '#f8fafc')}
            emissive={isSelected('ro_membrane') ? '#0284c7' : (getStatusColor('ro_membrane', '#000000') === '#ef4444' ? '#991b1b' : '#000000')}
            emissiveIntensity={isSelected('ro_membrane') ? 0.7 : 0.2}
            roughness={0.25}
            metalness={0.3}
          />
        </mesh>

        {/* Vessel End Cap Left (Feed Port) */}
        <mesh position={[-1.68, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.42, 0.25, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Vessel End Cap Right (Dual Permeate & Reject Outlets) */}
        <mesh position={[1.68, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.45, 0.25, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Decorative RO Membrane Label Banner */}
        <mesh position={[0, 0.43, 0]}>
          <boxGeometry args={[1.6, 0.02, 0.25]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>
      </group>

      {/* =========================================================================
          STAGE 4: ULTRA-FILTRATION (UF) POST-FILTER
          Position: Top Inline Slim Capsule
      ========================================================================= */}
      <group
        position={[-0.3 - p * 0.5, 2.9 + p * 1.8, 0.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('uf_filter');
        }}
      >
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 2.2, 24]} />
          <meshStandardMaterial
            color={isSelected('uf_filter') ? '#38bdf8' : getStatusColor('uf_filter', '#e0f2fe')}
            emissive={isSelected('uf_filter') ? '#0284c7' : '#000000'}
            emissiveIntensity={isSelected('uf_filter') ? 0.6 : 0.1}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* =========================================================================
          STAGE 5: UV DISINFECTION CHAMBER
          Position: Right Polished Stainless Steel Chamber
      ========================================================================= */}
      <group
        position={[1.3 + p * 1.4, 2.9 + p * 1.8, 0.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('uv_chamber');
        }}
      >
        {/* Stainless Steel Barrel */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 1.4, 32]} />
          <meshStandardMaterial
            color={isSelected('uv_chamber') ? '#38bdf8' : getStatusColor('uv_chamber', '#e2e8f0')}
            metalness={0.92}
            roughness={0.12}
            emissive={isSelected('uv_chamber') ? '#0284c7' : '#000000'}
            emissiveIntensity={isSelected('uv_chamber') ? 0.6 : 0.1}
          />
        </mesh>

        {/* End Terminal Quartz Caps with Purple Glow */}
        <mesh position={[-0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.27, 0.27, 0.08, 24]} />
          <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.27, 0.27, 0.08, 24]} />
          <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={1.2} />
        </mesh>

        {/* Internal Glowing UV-C 254nm Light Source */}
        <pointLight
          ref={uvGlowRef}
          position={[0, 0, 0.3]}
          color="#a855f7"
          intensity={1.8}
          distance={2.5}
        />
      </group>

      {/* =========================================================================
          CONNECTING PIPING & PORTS
      ========================================================================= */}
      {/* Feed Inlet Port (Bottom-Left) */}
      <group position={[-2.1 - p * 1.5, -0.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 16]} />
          <meshStandardMaterial color="#10b981" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      </group>

      {/* Inter-stage Tube 1: Sediment to Carbon */}
      <mesh position={[-0.75 - p * 0.95, 1.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} />
      </mesh>

      {/* Inter-stage Tube 2: Carbon to Booster Pump */}
      <mesh position={[0.55 + p * 0.2, 0.8, -0.1]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 16]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} />
      </mesh>

      {/* Inter-stage Tube 3: Booster Pump to RO Vessel Inlet */}
      <mesh position={[0.6 + p * 0.4, 1.8 + p * 0.6, -0.1]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Clean Water Permeate Tube to Outlet Faucet (Top-Right) */}
      <group position={[2.1 + p * 1.4, 3.2 + p * 1.8, 0.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Reject Water Brine Tube to Drain (Downwards from RO vessel end cap) */}
      <group position={[1.75 + p * 0.3, 1.2, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.5} />
        </mesh>
        {/* Flow Restrictor Valve (FR450) */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} />
          <meshStandardMaterial color="#c2410c" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
