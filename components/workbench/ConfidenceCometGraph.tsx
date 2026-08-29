"use client";

import React from "react";
import { InvestigationVerificationResult } from "@/types";
import { Activity } from "lucide-react";

interface ConfidenceCometGraphProps {
  verification?: InvestigationVerificationResult | null;
  isAnalyzing?: boolean;
}

export const ConfidenceCometGraph: React.FC<ConfidenceCometGraphProps> = ({
  verification,
  isAnalyzing = false,
}) => {
  const confidenceScore =
    verification?.overallConfidence === "HIGH"
      ? 92
      : verification?.overallConfidence === "MEDIUM"
      ? 68
      : 35;

  const dataPoints = [
    { label: "Decomposition", value: 40 },
    { label: "Retrieval", value: 62 },
    { label: "Stance Grounding", value: Math.max(30, confidenceScore - 15) },
    { label: "Consensus", value: Math.max(35, confidenceScore - 5) },
    { label: "Final Synthesis", value: confidenceScore },
  ];

  return (
    <div className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
              Confidence Calibration Trajectory
            </h2>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Deterministic confidence accumulation across pipeline stages
            </p>
          </div>
        </div>

        <div className="text-xs text-[#D7DADF] px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
          <span className="text-[#8D949D]">Calibrated Score: </span>
          <strong className="text-[#D4AF5A]">{confidenceScore}%</strong>
        </div>
      </div>

      {/* SVG Trajectory Chart */}
      <div className="h-44 w-full rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] p-4 relative flex items-center justify-center">
        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-xs text-[#D4AF5A]">
            <Activity className="h-4 w-4 animate-spin" />
            <span>Calibrating confidence metrics...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Threshold Guides */}
            <div className="relative flex-1 flex items-end">
              <svg className="w-full h-24 overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(212,175,90,0.12)" strokeDasharray="3 3" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(212,175,90,0.12)" strokeDasharray="3 3" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(212,175,90,0.12)" strokeDasharray="3 3" />

                {/* Trajectory Polyline */}
                <polyline
                  fill="none"
                  stroke="#D4AF5A"
                  strokeWidth="2.5"
                  points={dataPoints
                    .map((pt, idx) => {
                      const x = (idx / (dataPoints.length - 1)) * 95 + 2.5;
                      const y = 100 - pt.value * 0.9;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                  className="transition-all duration-500"
                />

                {/* Data Points */}
                {dataPoints.map((pt, idx) => {
                  const x = (idx / (dataPoints.length - 1)) * 95 + 2.5;
                  const y = 100 - pt.value * 0.9;
                  const isLast = idx === dataPoints.length - 1;

                  return (
                    <g key={idx}>
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r={isLast ? 5 : 3.5}
                        fill={isLast ? "#D4AF5A" : "#0D0F12"}
                        stroke="#D4AF5A"
                        strokeWidth="2"
                      />
                      <text
                        x={`${x}%`}
                        y={`${y - 12}%`}
                        fill="#D7DADF"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {pt.value}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis Labels */}
            <div className="flex justify-between text-[10px] text-[#8D949D] pt-2 border-t border-[rgba(212,175,90,0.15)]">
              {dataPoints.map((pt, idx) => (
                <span key={idx} className="truncate max-w-[80px] text-center">
                  {pt.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
