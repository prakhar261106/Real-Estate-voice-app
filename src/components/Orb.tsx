import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedCore({ state }: { state: 'IDLE' | 'LISTENING' | 'SPEAKING' | 'CONNECTING' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((stateObj, delta) => {
    time.current += delta;
    if (meshRef.current) {
      // Rotation
      meshRef.current.rotation.x = time.current * 0.2;
      meshRef.current.rotation.y = time.current * 0.3;
      
      // Dynamic scale
      if (state === 'SPEAKING') {
        const scale = 1 + Math.sin(time.current * 15) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      } else if (state === 'LISTENING') {
        const scale = 1 + Math.sin(time.current * 5) * 0.05;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  const getColor = () => {
    if (state === 'SPEAKING') return '#d4af37';
    if (state === 'LISTENING') return '#06b6d4';
    if (state === 'CONNECTING') return '#8b5cf6';
    return '#475569';
  };

  const getDistort = () => {
    if (state === 'SPEAKING') return 0.6;
    if (state === 'LISTENING') return 0.3;
    return 0; // Flat geometric shape when idle
  };

  const getSpeed = () => {
    if (state === 'SPEAKING') return 5;
    if (state === 'LISTENING') return 2;
    return 0;
  };

  return (
    <Icosahedron ref={meshRef} args={[1.2, state === 'IDLE' ? 0 : 2]}>
      <MeshDistortMaterial
        color={getColor()}
        envMapIntensity={1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        metalness={0.9}
        roughness={0.1}
        distort={getDistort()}
        speed={getSpeed()}
        wireframe={state === 'IDLE'}
      />
    </Icosahedron>
  );
}

export function OrbCanvas({ state, onClick }: { state: 'IDLE' | 'LISTENING' | 'SPEAKING' | 'CONNECTING', onClick: () => void }) {
  return (
    <div 
      className={`relative w-64 h-64 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95`}
      onClick={onClick}
    >
      {/* Decorative inner rings */}
      <div className={`absolute inset-0 rounded-full border-2 border-[#d4af37]/20 ${state === 'SPEAKING' ? 'animate-ping' : ''}`} />
      <div className={`absolute inset-4 rounded-full border-2 border-[#06b6d4]/20 ${state === 'LISTENING' ? 'animate-pulse' : ''}`} />
      
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        <AnimatedCore state={state} />
      </Canvas>
    </div>
  );
}
