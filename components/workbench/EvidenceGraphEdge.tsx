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
  { stroke: string; glow: string }
> = {
  SUPPORTS: {
    stroke: "#10B981", // emerald
    glow: "rgba(16, 185, 129, 0.2)",
  },
  CONTRADICTS: {
    stroke: "#F43F5E", // rose
    glow: "rgba(244, 63, 94, 0.2)",
  },
  MIXED: {
    stroke: "#F59E0B", // amber
    glow: "rgba(245, 158, 11, 0.2)",
  },
  INSUFFICIENT: {
    stroke: "#707984", // neutral slate
    glow: "rgba(112, 121, 132, 0.15)",
  },
  NEUTRAL: {
    stroke: "#A7AFB8", // secondary slate
    glow: "rgba(167, 175, 184, 0.15)",
  },
  UNCERTAIN: {
    stroke: "#707984",
    glow: "rgba(112, 121, 132, 0.15)",
  },
};

const ROOT_EDGE_COLOR = {
  stroke: "#D9DEE5",
  glow: "rgba(217, 222, 229, 0.2)",
};

const IMAGE_PROVENANCE_EDGE_COLOR = {
  stroke: "#38BDF8",
  glow: "rgba(56, 189, 248, 0.2)",
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

  const baseStrokeWidth = isHighlighted ? 2.5 : 1.5;
  const opacity = isDimmed ? "opacity-15" : isHighlighted ? "opacity-100" : "opacity-60";

  return (
    <g className={`transition-opacity duration-300 ${opacity}`}>
      {/* Subtle Shadow/Glow Line */}
      {isHighlighted && (
        <path
          d={edge.pathD}
          fill="none"
          stroke={colorConfig.glow}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Main Vector Path */}
      <path
        id={`edge-path-${edge.id}`}
        d={edge.pathD}
        fill="none"
        stroke={colorConfig.stroke}
        strokeWidth={baseStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Edge Direction Arrow Marker / Terminal Dot */}
      <circle
        cx={edge.endX}
        cy={edge.endY}
        r={isHighlighted ? 3.5 : 2.5}
        fill={colorConfig.stroke}
        className="transition-all duration-200"
      />
    </g>
  );
};
