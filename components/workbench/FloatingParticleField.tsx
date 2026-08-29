"use client";

import React from "react";

/**
 * Minimal subtle ambient background gradient.
 * Eliminates distracting sci-fi particles for a professional editorial experience.
 */
export const FloatingParticleField: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40"
      aria-hidden="true"
    >
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-950/10 blur-[120px] rounded-full" />
    </div>
  );
};
