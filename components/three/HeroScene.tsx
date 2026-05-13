"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { MathUtils } from "three";

function FloatingOrb(): React.ReactElement {
  const meshRef = useRef<Mesh>(null);
  const target = useMemo(() => ({ x: 0, y: 0 }), []);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const { pointer } = state;
    target.x = MathUtils.lerp(target.x, pointer.x * 0.35, 0.06);
    target.y = MathUtils.lerp(target.y, pointer.y * 0.25, 0.06);
    m.rotation.x = state.clock.elapsedTime * 0.12 + target.y * 0.4;
    m.rotation.y = state.clock.elapsedTime * 0.18 + target.x * 0.5;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.55}>
      <Sphere ref={meshRef} args={[1.05, 64, 64]} scale={1.35}>
        <MeshDistortMaterial
          color="#6d28d9"
          emissive="#22d3ee"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.55}
          distort={0.45}
          speed={2.2}
        />
      </Sphere>
    </Float>
  );
}

export function HeroScene(): React.ReactElement {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        className="h-full w-full"
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 2, 4]} intensity={1.1} />
        <FloatingOrb />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
