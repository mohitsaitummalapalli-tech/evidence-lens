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
  type: "root_to_claim" | "claim_to_evidence" | "image_to_provenance";
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
  speed: "3.5s",
};

const IMAGE_PROVENANCE_EDGE_COLOR = {
  stroke: "#06B6D4", // cyan provenance
  glow: "rgba(6, 182, 212, 0.45)",
  comet: "#67E8F9",
  speed: "2.9s",
};

export const EvidenceGraphEdge: React.FC<EvidenceGraphEdgeProps> = ({
  edge,
  isHighlighted = false,
  isDimmed = false,
}) => {
  const isRootEdge = edge.type === "root_to_claim";
  const isProvenanceEdge = edge.type === "image_to_provenance";

  const colorConfig = isRootEdge
    ? ROOT_EDGE_COLOR
    : isProvenanceEdge
    ? IMAGE_PROVENANCE_EDGE_COLOR
    : STANCE_EDGE_COLORS[edge.stance || "UNCERTAIN"] || STANCE_EDGE_COLORS.UNCERTAIN;

  const baseStrokeWidth = isHighlighted ? 3.5 : isRootEdge || isProvenanceEdge ? 2.5 : 2;
  const glowStrokeWidth = isHighlighted ? 9 : 6;
  const opacity = isDimmed ? "opacity-15" : isHighlighted ? "opacity-100" : "opacity-75";

  return (
    <g className={`transition-opacity duration-300 ${opacity}`}>
      {/* Background Glow Layer */}
      <path
        d={edge.pathD}
        fill="none"
        stroke={colorConfig.glow}
        strokeWidth={glowStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Core Vector Path */}
      <path
        id={`edge-path-${edge.id}`}
        d={edge.pathD}
        fill="none"
        stroke={colorConfig.stroke}
        strokeWidth={baseStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-200"
      />

      {/* Travelling Animated Comet Particle (Continuous SVG Motion) */}
      {!isDimmed && (
        <g className="comet-particle">
          {/* Outer Comet Glow */}
          <circle r={6} fill={colorConfig.comet} opacity={0.4}>
            <animateMotion
              dur={colorConfig.speed}
              repeatCount="indefinite"
              path={edge.pathD}
              rotate="auto"
            />
          </circle>

          {/* Core Luminous Comet Head */}
          <circle r={3} fill="#FFFFFF">
            <animateMotion
              dur={colorConfig.speed}
              repeatCount="indefinite"
              path={edge.pathD}
              rotate="auto"
            />
          </circle>
        </g>
      )}
    </g>
  );
};
