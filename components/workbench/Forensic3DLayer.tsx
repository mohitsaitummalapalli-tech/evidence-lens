"use client";

import React, { useEffect, useRef } from "react";
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
  const glowRef = useRef<HTMLDivElement | null>(null);

  // Mouse Parallax Effect with RAF interpolation
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * 8;
      targetY = ((e.clientY - centerY) / centerY) * 6;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Determine Atmosphere Glow Color based on active verdict state
  const getAtmosphereClasses = () => {
    if (isInvestigating) {
      return "from-red-950/20 via-red-900/05 to-transparent animate-pulse";
    }

    switch (verdict) {
      case "VERIFIED":
        return "from-emerald-950/20 via-emerald-900/05 to-transparent";
      case "FALSE":
        return "from-red-950/20 via-red-900/05 to-transparent";
      case "MIXED":
        return "from-amber-950/20 via-amber-900/05 to-transparent";
      case "UNVERIFIED":
      default:
        return "from-red-950/10 via-stone-900/05 to-transparent";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dynamic Verdict Atmosphere Glow */}
        <div
          ref={glowRef}
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-radial transition-all duration-1000 ease-out blur-3xl opacity-50 ${getAtmosphereClasses()}`}
        />

        {/* Ambient background */}
        <FloatingParticleField />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
