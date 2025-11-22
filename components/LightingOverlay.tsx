"use client";
import React from "react";

export function LightingOverlay({ x, y }: { x: number; y: number }) {
  const style: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: "1rem",
    mixBlendMode: "soft-light",
    background: `radial-gradient(220px 110px at ${x}px ${y}px, rgba(0,127,95,0.28), rgba(255,255,255,0) 60%),
                 radial-gradient(140px 70px at ${x + 60}px ${y - 40}px, rgba(167, 238, 202, 0.22), rgba(168,255,211,0) 60%)`,
  };

  return <div style={style} />;
}
