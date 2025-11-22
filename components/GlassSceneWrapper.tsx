"use client";

import { Component, ReactNode } from "react";
import GlassScene from "./GlassSceneClient";

interface Props {
  children?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("3D Scene Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`${this.props.className} flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl`}>
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-slate-300 text-sm">
              3D visualization temporarily unavailable
            </p>
            <p className="text-slate-400 text-xs mt-2">
              Your browser may not support WebGL
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function GlassSceneWrapper({ className }: { className?: string }) {
  return (
    <ErrorBoundary className={className}>
      <GlassScene className={className} />
    </ErrorBoundary>
  );
}

