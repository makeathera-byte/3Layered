"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, Suspense, useState, useEffect } from "react";

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

function BasicCube() {
  const groupRef = useRef<THREE.Group>(null!);
  
  const geo = useMemo(() => new THREE.BoxGeometry(1.8, 1.8, 1.8), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff", // Pure white
        metalness: 1.0, // Maximum metalness for ultra-shiny effect
        roughness: 0.0, // Perfectly smooth for maximum shininess
        transmission: 0.0, // No transmission - solid
        clearcoat: 1.0, // Full clearcoat for maximum shine
        clearcoatRoughness: 0.0, // Perfectly smooth clearcoat
        reflectivity: 1.0, // Maximum reflectivity
        envMapIntensity: 4.5, // Very strong reflection intensity for maximum shininess
        side: THREE.FrontSide, // Single-sided
        transparent: false, // Solid
        opacity: 1.0, // Fully opaque
        emissive: "#ffffff", // White emissive for brightness
        emissiveIntensity: 0.15, // Subtle emissive intensity
      }),
    []
  );
  const bodyDiagonal = useMemo(() => new THREE.Vector3(1, 1, 1).normalize(), []);
  const alignedRef = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // One-time: align the cube so a vertex faces the camera (camera looks -Z)
    if (!alignedRef.current) {
      const q = new THREE.Quaternion().setFromUnitVectors(bodyDiagonal, new THREE.Vector3(0, 0, -1));
      groupRef.current.quaternion.copy(q);
      alignedRef.current = true;
    }
    // Slow vertical hover
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    // Rotate around the body diagonal to preserve corner-facing orientation
    groupRef.current.rotateOnAxis(bodyDiagonal, 0.12 * delta);
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}

function Satellites() {
  const group = useRef<THREE.Group>(null!);
  const t = useRef(0);

  const satellites = useMemo(() => {
    const g = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 1, roughness: 0.35 });
    const panelMat = new THREE.MeshStandardMaterial({ color: "#1e5fa8", emissive: "#3da2ff", emissiveIntensity: 0.6, side: THREE.DoubleSide });

    const mkSat = (r: number, speed: number, incline: number, phase: number) => {
      const s = new THREE.Group();
      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.04), bodyMat);
      s.add(body);
      // Panels
      const pL = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), panelMat);
      pL.position.x = -0.08;
      pL.rotation.y = Math.PI / 2;
      const pR = pL.clone();
      pR.position.x = 0.08;
      s.add(pL, pR);

      (s as any).userData = { r, speed, incline, phase };
      return s;
    };

    // Three orbital rings with varied speeds and inclinations
    const ring1 = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ph) => mkSat(2.2, 0.7, 0.05, ph));
    const ring2 = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ph) => mkSat(2.6, 0.5, -0.12, ph));
    const ring3 = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ph) => mkSat(3.0, 0.35, 0.24, ph));
    g.add(...ring1, ...ring2, ...ring3);

    return g;
  }, []);

  useFrame(() => {
    t.current += 0.01;
    if (!group.current) return;
    for (const child of group.current.children) {
      const { r, speed, incline, phase } = (child as any).userData || {};
      if (r) {
        const angle = t.current * speed + phase;
        const pos = new THREE.Vector3(r * Math.cos(angle), 0, r * Math.sin(angle));
        pos.applyEuler(new THREE.Euler(incline, 0, 0));
        child.position.copy(pos);
        (child as THREE.Object3D).lookAt(0, 0, 0);
        child.rotation.y += 0.01;
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={satellites} />
    </group>
  );
}

export function GlassScene({ className }: { className?: string }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize 3D scene:', err);
        setError(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl`}>
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-slate-300 text-sm">3D scene unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className || ''} w-full h-full`} style={{ minHeight: '360px' }}>
      {!isReady && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-sm">Loading 3D Scene...</p>
          </div>
        </div>
      )}
      {isReady && (
        <Canvas 
          className="w-full h-full" 
          camera={{ position: [0, 0.4, 4.6], fov: 45 }}
          gl={{ 
            antialias: false, // Disabled for performance
            alpha: true,
            powerPreference: "high-performance", // Prefer performance over quality
            stencil: false, // Disable stencil buffer
            depth: true,
          }}
          dpr={[0.8, 1.2]} // Lower DPR for better performance
          performance={{ min: 0.5 }} // Allow lower framerate on slow devices
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 3, 2]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={1.8} color="#ffffff" />
          <directionalLight position={[0, 5, -2]} intensity={2.0} color="#ffffff" />
          <directionalLight position={[3, -2, 4]} intensity={1.5} color="#ffffff" />
          <pointLight position={[0, 3, 2]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-3, 1, 3]} intensity={1.0} color="#ffffff" />
          <pointLight position={[3, 2, -2]} intensity={1.0} color="#ffffff" />
          <pointLight position={[0, 4, 0]} intensity={0.9} color="#ffffff" />
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
            rotateSpeed={0.5} // Reduced for smoother performance
            zoomSpeed={0.8} // Reduced for smoother performance
            makeDefault
          />
        </Canvas>
      )}
    </div>
  );
}
