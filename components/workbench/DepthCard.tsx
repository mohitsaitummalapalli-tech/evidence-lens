"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

interface DepthCardProps {
  children: React.ReactNode;
  className?: string;
  floatingPhase?: 1 | 2 | 3 | "none";
  enableTilt?: boolean;
  maxTiltDeg?: number;
  glowOnHover?: boolean;
}

export const DepthCard: React.FC<DepthCardProps> = ({
  children,
  className = "",
  floatingPhase = "none",
  enableTilt = true,
  maxTiltDeg = 3.5,
  glowOnHover = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || prefersReducedMotion || !cardRef.current) return;

    // Throttle tilt calculations via RAF
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles bounded by maxTiltDeg
      const rotateX = ((y - centerY) / centerY) * -maxTiltDeg;
      const rotateY = ((x - centerX) / centerX) * maxTiltDeg;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
    });
  };

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (cardRef.current && !prefersReducedMotion) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  };

  const floatingClass =
    !prefersReducedMotion && floatingPhase !== "none"
      ? `floating-card-${floatingPhase}`
      : "";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-all duration-300 ease-out will-change-transform ${floatingClass} ${
        glowOnHover && isHovered
          ? "shadow-[0_12px_36px_-8px_rgba(0,0,0,0.8),0_0_15px_rgba(255,255,255,0.03)]"
          : "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
      } ${className}`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Specular subtle edge highlight */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl border border-white/5 z-10 transition-opacity duration-300"
        style={{
          boxShadow: isHovered ? "inset 0 1px 1px rgba(255, 255, 255, 0.05)" : "none",
        }}
      />
      {children}
    </div>
  );
};
