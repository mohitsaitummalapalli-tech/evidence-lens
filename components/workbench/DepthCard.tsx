"use client";

import React from "react";

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
}) => {
  return (
    <div
      className={`relative rounded-lg bg-[#11151A] border border-[#2A3038] hover:border-[#343B45] transition-all duration-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};
