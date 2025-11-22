"use client";

import { useEffect, useState } from "react";
import GlassSceneClient from "./GlassSceneClient";

export default function GlassSceneTest({ className }: { className?: string }) {
  const [key, setKey] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const log = `[${new Date().toLocaleTimeString()}] Component mounted`;
    setLogs((prev) => [...prev, log]);
    console.log(log);
  }, []);

  const handleRefresh = () => {
    const log = `[${new Date().toLocaleTimeString()}] Manual refresh triggered`;
    setLogs((prev) => [...prev, log]);
    console.log(log);
    setKey((prev) => prev + 1);
  };

  return (
    <div className={className}>
      <div className="mb-2 flex gap-2 items-center">
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
        >
          🔄 Refresh 3D Scene
        </button>
        <span className="text-xs text-slate-400">Render count: {key + 1}</span>
      </div>
      
      <div className="h-[360px] md:h-[420px] rounded-2xl overflow-hidden border-2 border-emerald-500/30">
        <GlassSceneClient key={key} className="h-full" />
      </div>
      
      {logs.length > 0 && (
        <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-300 max-h-32 overflow-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}

