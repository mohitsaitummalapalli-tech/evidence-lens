"use client";

import React, { useRef } from "react";
import { FloatingParticleField } from "./FloatingParticleField";
import { OverallVerdictType } from "@/types";

interface Forensic3DLayerProps {
  verdict?: OverallVerdictType | null;
  isInvestigating?: boolean;
  children?: React.ReactNode;
}

export const Forensic3DLayer: React.FC<Forensic3DLayerProps> = ({
  verdict,
  isInvestigating = false,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Subtle semantic atmosphere glow depending on verdict state
  const getAtmosphereClasses = () => {
    if (isInvestigating) {
      return "from-slate-500/10 via-transparent to-transparent";
    }

    switch (verdict) {
      case "VERIFIED":
        return "from-emerald-500/08 via-emerald-950/02 to-transparent";
      case "FALSE":
        return "from-rose-500/08 via-rose-950/02 to-transparent";
      case "MIXED":
        return "from-amber-500/08 via-amber-950/02 to-transparent";
      case "UNVERIFIED":
      default:
        return "from-slate-500/05 via-transparent to-transparent";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Subtle Atmosphere Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-radial transition-all duration-700 blur-3xl opacity-40 ${getAtmosphereClasses()}`}
        />
        <FloatingParticleField />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
