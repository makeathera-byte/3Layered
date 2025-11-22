"use client";

import dynamic from "next/dynamic";

// Client-side only component with no SSR
const GlassScene = dynamic(
  () => import("@/components/GlassScene").then((m) => m.GlassScene),
  { 
    ssr: false
  }
);

export default GlassScene;

