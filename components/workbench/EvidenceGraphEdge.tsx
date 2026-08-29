"use client";

import React from "react";

export interface GraphEdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  type: "hierarchy" | "supports" | "contradicts" | "insufficient" | "provenance";
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}

interface EvidenceGraphEdgeProps {
  edge: GraphEdgeData;
}

const EDGE_COLORS: Record<string, { stroke: string; particle: string }> = {
  hierarchy: { stroke: "#D4AF5A", particle: "#E1C16E" },     // Metallic Gold
  supports: { stroke: "#10B981", particle: "#34D399" },      // Emerald
  contradicts: { stroke: "#F43F5E", particle: "#FB7185" },   // Rose
  insufficient: { stroke: "#8D949D", particle: "#D7DADF" },  // Platinum / Slate
  provenance: { stroke: "#38BDF8", particle: "#7DD3FC" },    // Cyan
};

export const EvidenceGraphEdge: React.FC<EvidenceGraphEdgeProps> = ({ edge }) => {
  const theme = EDGE_COLORS[edge.type] || EDGE_COLORS.hierarchy;
  const strokeDash = edge.type === "insufficient" || edge.type === "provenance" ? "4 4" : "none";
  const baseStrokeWidth = edge.type === "hierarchy" ? 2 : 1.75;
  const strokeWidth = edge.isHighlighted ? baseStrokeWidth + 1.2 : baseStrokeWidth;

  const opacity = edge.isDimmed ? 0.15 : edge.isHighlighted ? 0.95 : 0.65;
  const particleOpacity = edge.isDimmed ? 0 : edge.isHighlighted ? 1 : 0.85;

  // Compute bezier control points for smooth investigative flow
  const dx = edge.toX - edge.fromX;
  const cx1 = edge.fromX + dx * 0.5;
  const cy1 = edge.fromY;
  const cx2 = edge.fromX + dx * 0.5;
  const cy2 = edge.toY;

  const pathD = `M ${edge.fromX} ${edge.fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.toX} ${edge.toY}`;

  // Unique animation duration based on edge distance to avoid unnatural lockstep
  const distance = Math.hypot(edge.toX - edge.fromX, edge.toY - edge.fromY);
  const durSeconds = Math.max(1.8, Math.min(3.2, distance / 160));

  return (
    <g className="evidence-edge transition-opacity duration-300">
      {/* Primary Bezier Connection Line */}
      <path
        d={pathD}
        fill="none"
        stroke={theme.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDash}
        strokeOpacity={opacity}
        className="transition-all duration-300"
      />

      {/* Travelling Information Particle along Flow Direction */}
      {!edge.isDimmed && (
        <circle r={edge.isHighlighted ? 3.5 : 2.5} fill={theme.particle} opacity={particleOpacity}>
          <animateMotion
            dur={`${durSeconds}s`}
            repeatCount="indefinite"
            path={pathD}
            calcMode="linear"
          />
        </circle>
      )}
    </g>
  );
};
