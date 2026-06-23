import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function RotatingStars() {
  const ref = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 35;
      
      // Parallax effect based on mouse
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mousePos.x * 2, 0.05);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mousePos.y * 2, 0.05);
    }
  });

  return (
    <group ref={ref}>
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export function TwinkleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <RotatingStars />
      </Canvas>
    </div>
  );
}
