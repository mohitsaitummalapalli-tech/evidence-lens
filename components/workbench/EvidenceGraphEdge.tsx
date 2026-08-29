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
  isActive?: boolean;
}

interface EvidenceGraphEdgeProps {
  edge: GraphEdgeData;
}

const EDGE_COLORS = {
  hierarchy: "#D4AF5A", // Gold root connection
  supports: "#10B981",  // Emerald
  contradicts: "#F43F5E", // Rose
  insufficient: "#8D949D", // Slate
  provenance: "#38BDF8", // Cyan
};

export const EvidenceGraphEdge: React.FC<EvidenceGraphEdgeProps> = ({ edge }) => {
  const color = EDGE_COLORS[edge.type] || EDGE_COLORS.hierarchy;
  const strokeDash = edge.type === "insufficient" || edge.type === "provenance" ? "4 4" : "none";
  const strokeWidth = edge.type === "hierarchy" ? 2 : 1.5;

  // Compute bezier control points for smooth investigative flow
  const dx = edge.toX - edge.fromX;
  const cx1 = edge.fromX + dx * 0.5;
  const cy1 = edge.fromY;
  const cx2 = edge.fromX + dx * 0.5;
  const cy2 = edge.toY;

  const pathD = `M ${edge.fromX} ${edge.fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.toX} ${edge.toY}`;

  return (
    <g className="evidence-edge">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDash}
        strokeOpacity={0.65}
        className="transition-all duration-300"
      />
    </g>
  );
};
