"use client";
import React, { useEffect, useRef, useState } from "react";

export function GlobalLighting() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 600, y: 360 });
  const [enabled, setEnabled] = useState(true);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const checkSetting = () => {
      const setting = document.body.getAttribute("data-global-lighting");
      return setting === "on";
    };

    // Check initial setting
    const initialEnabled = checkSetting();
    setEnabled(initialEnabled);

    // Watch for changes
    const observer = new MutationObserver(() => {
      const isEnabled = checkSetting();
      setEnabled(isEnabled);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-global-lighting"],
    });

    const handler = (e: MouseEvent) => {
      const isEnabled = checkSetting();
      if (isEnabled) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
      }
    };

    window.addEventListener("mousemove", handler);

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handler);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Don't render when disabled
  if (!enabled) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 20,
    mixBlendMode: "soft-light",
    background: `radial-gradient(360px 180px at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%),
                 radial-gradient(220px 110px at ${pos.x + 80}px ${pos.y - 40}px, rgba(16,185,129,0.14), rgba(16,185,129,0) 60%)`,
  };

  return <div style={style} />;
}
