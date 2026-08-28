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
  const gridRef = useRef<HTMLDivElement | null>(null);

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
      targetX = ((e.clientX - centerX) / centerX) * 12; // Max 12px shift
      targetY = ((e.clientY - centerY) / centerY) * 8; // Max 8px shift
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      // Lerp for liquid smooth interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX * 1.2}px, ${currentY * 1.2}px, 0)`;
      }

      if (gridRef.current) {
        gridRef.current.style.transform = `perspective(800px) rotateX(55deg) translate3d(${currentX * 0.4}px, ${currentY * 0.4}px, 0)`;
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
      return "from-[#D4AF37]/15 via-[#E2C15C]/05 to-transparent animate-pulse";
    }

    switch (verdict) {
      case "VERIFIED":
        return "from-[#10B981]/18 via-[#059669]/06 to-transparent";
      case "FALSE":
        return "from-[#EF4444]/18 via-[#DC2626]/06 to-transparent";
      case "MIXED":
        return "from-[#F59E0B]/18 via-[#D97706]/06 to-transparent";
      case "UNVERIFIED":
      default:
        return "from-[#D4AF37]/10 via-[#B38F24]/04 to-transparent";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dynamic Verdict Atmosphere Glow */}
        <div
          ref={glowRef}
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-radial transition-all duration-1000 ease-out blur-3xl opacity-60 ${getAtmosphereClasses()}`}
        />

        {/* 3D Perspective Forensic Grid */}
        <div
          ref={gridRef}
          className="absolute -bottom-40 left-[-15%] w-[130%] h-[700px] pointer-events-none opacity-40 transition-transform duration-300"
          style={{
            transform: "perspective(800px) rotateX(55deg)",
            transformOrigin: "bottom center",
            backgroundImage: `
              linear-gradient(to right, rgba(212, 175, 55, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 175, 55, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 60%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 60%, black 20%, transparent 80%)",
          }}
        />

        {/* Floating Particle Canvas */}
        <FloatingParticleField />
      </div>

      {/* Main Content Render */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
