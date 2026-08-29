"use client";

import React from "react";

interface DepthCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: "sm" | "md" | "lg" | "floating";
  floatingPhase?: "none" | "slow" | "pulse";
  enableTilt?: boolean;
}

export const DepthCard: React.FC<DepthCardProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.22)] hover:border-[rgba(212,175,90,0.45)] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};
