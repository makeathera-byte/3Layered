"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function BasicCube() {
  const groupRef = useRef<THREE.Group>(null!);
  
  const geo = useMemo(() => new THREE.BoxGeometry(1.8, 1.8, 1.8), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e8f0f5", // Slightly cool white with metallic tint
        metalness: 0.4, // Metallic finish
        roughness: 0.05, // Very smooth, almost mirror-like
        transmission: 0.85, // Glass-like but with metallic properties
        thickness: 1.2, // Increased thickness for better glass refraction
        ior: 1.6, // Slightly higher IOR for metallic glass
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        envMapIntensity: 4.0, // Reduced for performance
        side: THREE.FrontSide, // Single-sided for better performance
        // Removed expensive properties: sheen, emissive
      }),
    []
  );
  const bodyDiagonal = useMemo(() => new THREE.Vector3(1, 1, 1).normalize(), []);
  const alignedRef = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (!alignedRef.current) {
      const q = new THREE.Quaternion().setFromUnitVectors(bodyDiagonal, new THREE.Vector3(0, 0, -1));
      groupRef.current.quaternion.copy(q);
      alignedRef.current = true;
    }
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    groupRef.current.rotateOnAxis(bodyDiagonal, 0.12 * delta);
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 text-sm">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

// Safe Environment wrapper - disabled to avoid HDR loading errors
// We use excellent manual lighting instead which provides better control
function SafeEnvironment() {
  // Environment component disabled to prevent HDR loading errors
  // The scene already has excellent lighting:
  // - Ambient light for base illumination
  // - Multiple directional lights for depth
  // - Point light for highlights
  // This provides better performance and reliability than HDR environment maps
  return null;
}

export default function GlassSceneSimple({ className }: { className?: string }) {
  return (
    <div className={`${className || ''} w-full h-full`} style={{ minHeight: '360px' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas 
          className="w-full h-full" 
          camera={{ position: [0, 0.4, 4.6], fov: 45 }}
          gl={{ 
            antialias: false, // Disabled for performance
            alpha: true,
            preserveDrawingBuffer: false, // Disabled for performance
            powerPreference: "high-performance", // Prefer performance over quality
            stencil: false, // Disable stencil buffer
            depth: true,
          }}
          dpr={[0.8, 1.2]} // Lower DPR for better performance
          performance={{ min: 0.5 }} // Allow lower framerate on slow devices
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 3, 2]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#b8d4ff" />
          {/* Removed point light for better performance */}
          <Suspense fallback={null}>
            <SafeEnvironment />
          </Suspense>
          <BasicCube />
          <OrbitControls 
            enablePan={false} 
            enableDamping 
            dampingFactor={0.08} 
            minDistance={3.2} 
            maxDistance={7.5}
            enableZoom={true}
            enableRotate={true}
            rotateSpeed={0.5} // Reduced for smoother performance
            zoomSpeed={0.8} // Reduced for smoother performance
            makeDefault
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

