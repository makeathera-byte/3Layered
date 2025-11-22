"use client";

import dynamic from "next/dynamic";

const GlassSceneSimple = dynamic(
  () => import("@/components/GlassSceneSimple"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-sm">Initializing 3D...</p>
        </div>
      </div>
    )
  }
);

export default GlassSceneSimple;

