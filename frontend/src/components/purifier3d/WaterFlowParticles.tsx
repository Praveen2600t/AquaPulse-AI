import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterFlowParticlesProps {
  explodedProgress: number;
  productFlow: number; // L/h
  rejectFlow: number;  // L/h
}

export const WaterFlowParticles: React.FC<WaterFlowParticlesProps> = ({
  explodedProgress,
  productFlow,
  rejectFlow,
}) => {
  const p = explodedProgress;

  // Particle counts
  const cleanCount = 35;
  const rejectCount = 25;

  const cleanPointsRef = useRef<THREE.InstancedMesh>(null);
  const rejectPointsRef = useRef<THREE.InstancedMesh>(null);

  // Define keyframes for Clean Water Permeate path (RO outlet -> UF -> UV -> Faucet)
  const cleanPath = useMemo(() => {
    return [
      new THREE.Vector3(1.68, 2.1, 0),        // RO permeate outlet
      new THREE.Vector3(1.0, 2.5, 0.1),       // Rising to manifold
      new THREE.Vector3(-0.3, 2.9, 0.2),      // Through UF filter
      new THREE.Vector3(0.8, 2.9, 0.2),       // Entering UV
      new THREE.Vector3(1.8, 2.9, 0.2),       // Exiting UV
      new THREE.Vector3(2.3, 3.2, 0.2),       // Clean Outlet Faucet
    ];
  }, []);

  // Define keyframes for Reject Brine path (RO reject port -> Flow Restrictor -> Drain)
  const rejectPath = useMemo(() => {
    return [
      new THREE.Vector3(1.72, 2.05, 0),       // RO reject port
      new THREE.Vector3(1.75, 1.4, 0),        // Heading down
      new THREE.Vector3(1.75, 0.9, 0),        // Through Flow Restrictor (FR450)
      new THREE.Vector3(1.75, 0.2, 0),        // Line to drain
      new THREE.Vector3(1.85, -0.6, 0),       // Discharge to drain
    ];
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Track progress along curve for each particle
  const cleanProgress = useRef(new Float32Array(cleanCount).map(() => Math.random()));
  const rejectProgress = useRef(new Float32Array(rejectCount).map(() => Math.random()));

  useFrame((_, delta) => {
    // Flow speed scales with real product & reject flow rate
    const cleanSpeed = (productFlow / 15.0) * 0.35 * delta;
    const rejectSpeed = (rejectFlow / 20.0) * 0.45 * delta;

    // 1. Update Clean Permeate Particles
    if (cleanPointsRef.current) {
      for (let i = 0; i < cleanCount; i++) {
        cleanProgress.current[i] = (cleanProgress.current[i] + cleanSpeed) % 1.0;
        const progress = cleanProgress.current[i];
        
        // Linear interpolation across keyframes
        const seg = progress * (cleanPath.length - 1);
        const idx = Math.floor(seg);
        const frac = seg - idx;
        const nextIdx = Math.min(idx + 1, cleanPath.length - 1);

        const v1 = cleanPath[idx];
        const v2 = cleanPath[nextIdx];

        const x = v1.x + (v2.x - v1.x) * frac + (i > 15 ? p * 0.8 : 0);
        const y = v1.y + (v2.y - v1.y) * frac + p * 1.0;
        const z = v1.z + (v2.z - v1.z) * frac;

        dummy.position.set(x, y - 0.6, z);
        dummy.scale.setScalar(0.045 + Math.sin(progress * Math.PI) * 0.02);
        dummy.updateMatrix();
        cleanPointsRef.current.setMatrixAt(i, dummy.matrix);
      }
      cleanPointsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Reject Brine Particles
    if (rejectPointsRef.current) {
      for (let i = 0; i < rejectCount; i++) {
        rejectProgress.current[i] = (rejectProgress.current[i] + rejectSpeed) % 1.0;
        const progress = rejectProgress.current[i];

        const seg = progress * (rejectPath.length - 1);
        const idx = Math.floor(seg);
        const frac = seg - idx;
        const nextIdx = Math.min(idx + 1, rejectPath.length - 1);

        const v1 = rejectPath[idx];
        const v2 = rejectPath[nextIdx];

        const x = v1.x + (v2.x - v1.x) * frac + p * 0.3;
        const y = v1.y + (v2.y - v1.y) * frac + (progress < 0.2 ? p * 1.0 : 0);
        const z = v1.z + (v2.z - v1.z) * frac;

        dummy.position.set(x, y - 0.6, z);
        dummy.scale.setScalar(0.04 + Math.sin(progress * Math.PI) * 0.015);
        dummy.updateMatrix();
        rejectPointsRef.current.setMatrixAt(i, dummy.matrix);
      }
      rejectPointsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Clean Permeate Particle Stream (Glowing Cyan) */}
      <instancedMesh ref={cleanPointsRef} args={[undefined, undefined, cleanCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.88} />
      </instancedMesh>

      {/* Reject Brine Particle Stream (Amber/Orange) */}
      <instancedMesh ref={rejectPointsRef} args={[undefined, undefined, rejectCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
      </instancedMesh>
    </group>
  );
};
