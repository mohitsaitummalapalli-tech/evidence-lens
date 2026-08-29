"use client";

import React from "react";

/**
 * Clean subtle ambient background.
 * Eliminates distracting particles and glow for a professional analytical experience.
 */
export const FloatingParticleField: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30"
      aria-hidden="true"
    >
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D9DEE5]/[0.02] blur-[100px] rounded-full" />
    </div>
  );
};
