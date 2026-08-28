"use client";

import React from "react";
import { EvidenceStance } from "@/types";

export interface GraphEdgeData {
  id: string;
  fromId: string;
  toId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  pathD: string;
  stance?: EvidenceStance;
  type: "root_to_claim" | "claim_to_evidence";
}

interface EvidenceGraphEdgeProps {
  edge: GraphEdgeData;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}

const STANCE_EDGE_COLORS: Record<
  EvidenceStance,
  { stroke: string; glow: string; comet: string; speed: string }
> = {
  SUPPORTS: {
    stroke: "#10B981", // emerald
    glow: "rgba(16, 185, 129, 0.4)",
    comet: "#34D399",
    speed: "2.8s",
  },
  CONTRADICTS: {
    stroke: "#EF4444", // crimson
    glow: "rgba(239, 68, 68, 0.4)",
    comet: "#F87171",
    speed: "2.4s",
  },
  MIXED: {
    stroke: "#F59E0B", // amber
    glow: "rgba(245, 158, 11, 0.4)",
    comet: "#FCD34D",
    speed: "3.2s",
  },
  INSUFFICIENT: {
    stroke: "#78716C", // stone
    glow: "rgba(120, 113, 108, 0.3)",
    comet: "#A8A29E",
    speed: "4.5s",
  },
  NEUTRAL: {
    stroke: "#94A3B8", // slate
    glow: "rgba(148, 163, 184, 0.3)",
    comet: "#CBD5E1",
    speed: "3.8s",
  },
  UNCERTAIN: {
    stroke: "#D4AF37", // metallic gold
    glow: "rgba(212, 175, 55, 0.3)",
    comet: "#E2C15C",
    speed: "4.0s",
  },
};

const ROOT_EDGE_COLOR = {
  stroke: "#D4AF37", // metallic gold
  glow: "rgba(212, 175, 55, 0.45)",
  comet: "#F3E5B8",
  speed: "3.0s",
};

export const EvidenceGraphEdge: React.FC<EvidenceGraphEdgeProps> = ({
  edge,
  isHighlighted = false,
  isDimmed = false,
}) => {
  const isRootEdge = edge.type === "root_to_claim";
  const edgeConfig = isRootEdge
    ? ROOT_EDGE_COLOR
    : STANCE_EDGE_COLORS[edge.stance || "UNCERTAIN"] || ROOT_EDGE_COLOR;

  const pathId = `path-${edge.id}`;
  const strokeWidth = isHighlighted ? 3 : isRootEdge ? 2 : 1.5;
  const opacity = isDimmed ? 0.15 : isHighlighted ? 1 : 0.75;

  return (
    <g className="transition-opacity duration-300" opacity={opacity}>
      {/* Background Subtle Glow Path */}
      <path
        d={edge.pathD}
        fill="none"
        stroke={edgeConfig.glow}
        strokeWidth={strokeWidth + (isHighlighted ? 4 : 2)}
        strokeLinecap="round"
      />

      {/* Main Connection Path */}
      <path
        id={pathId}
        d={edge.pathD}
        fill="none"
        stroke={edgeConfig.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={isHighlighted ? "none" : edge.stance === "INSUFFICIENT" ? "4 4" : "none"}
      />

      {/* Animated Comet Particle Traveling Along the Curve */}
      {!isDimmed && (
        <circle r={isHighlighted ? 4 : 3} fill={edgeConfig.comet} className="filter drop-shadow-[0_0_6px_currentColor]">
          <animateMotion
            dur={edgeConfig.speed}
            repeatCount="indefinite"
            rotate="auto"
            path={edge.pathD}
          />
        </circle>
      )}

      {/* Trailing Comet Secondary Particle for richer cinematic feel */}
      {!isDimmed && isHighlighted && (
        <circle r={2} fill={edgeConfig.comet} opacity={0.6}>
          <animateMotion
            dur={edgeConfig.speed}
            begin="0.2s"
            repeatCount="indefinite"
            rotate="auto"
            path={edge.pathD}
          />
        </circle>
      )}
    </g>
  );
};
