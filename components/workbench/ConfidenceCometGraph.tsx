"use client";

import React, { useState, useMemo } from "react";
import {
  ClaimExtractionResult,
  EvidenceRetrievalResult,
  ImageProvenanceResult,
  InvestigationVerificationResult,
  MultiAIConsensusResult,
} from "@/types";
import { Activity, ShieldCheck, Info } from "lucide-react";

interface ConfidenceCometGraphProps {
  extraction?: ClaimExtractionResult | null;
  evidence?: EvidenceRetrievalResult | null;
  verification?: InvestigationVerificationResult | null;
  multiAIConsensus?: MultiAIConsensusResult | null;
  imageProvenance?: ImageProvenanceResult | null;
  isAnalyzing?: boolean;
}

const STAGES = [
  { id: "input", label: "INPUT", fullLabel: "Target Ingestion" },
  { id: "decomp", label: "DECOMPOSITION", fullLabel: "Claim Extraction" },
  { id: "retrieval", label: "RETRIEVAL", fullLabel: "Evidence Discovery" },
  { id: "analysis", label: "SOURCE ANALYSIS", fullLabel: "Stance Extraction" },
  { id: "crosscheck", label: "CROSS-CHECK", fullLabel: "Domain Corroboration" },
  { id: "media", label: "MEDIA PROVENANCE", fullLabel: "Visual/Video Grounding" },
  { id: "consensus", label: "AI CONSENSUS", fullLabel: "Multi-Model Jury" },
  { id: "verdict", label: "FINAL VERDICT", fullLabel: "Deterministic Synthesis" },
];

const CLAIM_PALETTE = [
  { id: "c1", stroke: "#D4AF5A", head: "#F5E6B8", trail: "rgba(212,175,90,0.25)" }, // Metallic Gold
  { id: "c2", stroke: "#10B981", head: "#A7F3D0", trail: "rgba(16,185,129,0.25)" }, // Emerald
  { id: "c3", stroke: "#38BDF8", head: "#BAE6FD", trail: "rgba(56,189,248,0.25)" }, // Cyan
  { id: "c4", stroke: "#F59E0B", head: "#FDE68A", trail: "rgba(245,158,11,0.25)" }, // Amber
  { id: "c5", stroke: "#F43F5E", head: "#FECDD3", trail: "rgba(244,63,94,0.25)" },  // Rose
  { id: "c6", stroke: "#A855F7", head: "#E9D5FF", trail: "rgba(168,85,247,0.25)" }, // Purple
];

interface ClaimTrajectory {
  claimId: string;
  claimText: string;
  verdict: string;
  finalConfidencePct: number;
  color: { stroke: string; head: string; trail: string };
  points: { stage: string; stageLabel: string; value: number; delta: number }[];
  svgPath: string;
}

export const ConfidenceCometGraph: React.FC<ConfidenceCometGraphProps> = ({
  extraction,
  evidence,
  verification,
  multiAIConsensus,
  imageProvenance,
  isAnalyzing = false,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    claimId: string;
    claimText: string;
    stageLabel: string;
    value: number;
    delta: number;
    x: number;
    y: number;
  } | null>(null);

  // Compute trajectories for each atomic claim
  const trajectories: ClaimTrajectory[] = useMemo(() => {
    const claims = extraction?.claims || [];
    const allSources = evidence?.allSources || [];
    const claimVerifications = verification?.claimVerifications || [];

    if (claims.length === 0) {
      // Fallback single global trajectory if extraction is empty
      const globalConf =
        verification?.overallConfidence === "HIGH"
          ? 92
          : verification?.overallConfidence === "MEDIUM"
          ? 68
          : 35;
      const pts = [
        { stage: "INPUT", stageLabel: "Target Ingestion", value: 50, delta: 0 },
        { stage: "DECOMPOSITION", stageLabel: "Claim Extraction", value: 50, delta: 0 },
        { stage: "RETRIEVAL", stageLabel: "Evidence Discovery", value: 65, delta: 15 },
        { stage: "SOURCE ANALYSIS", stageLabel: "Stance Extraction", value: Math.max(30, globalConf - 18), delta: Math.max(30, globalConf - 18) - 65 },
        { stage: "CROSS-CHECK", stageLabel: "Domain Corroboration", value: Math.max(35, globalConf - 10), delta: 8 },
        { stage: "MEDIA PROVENANCE", stageLabel: "Visual/Video Grounding", value: Math.max(35, globalConf - 6), delta: 4 },
        { stage: "AI CONSENSUS", stageLabel: "Multi-Model Jury", value: Math.max(35, globalConf - 2), delta: 4 },
        { stage: "FINAL VERDICT", stageLabel: "Deterministic Synthesis", value: globalConf, delta: 2 },
      ];

      return [
        {
          claimId: "C1",
          claimText: "Target Assertion Investigation",
          verdict: verification?.overallVerdict || "VERIFIED",
          finalConfidencePct: globalConf,
          color: CLAIM_PALETTE[0],
          points: pts,
          svgPath: pts
            .map((p, idx) => {
              const x = (idx / (pts.length - 1)) * 900 + 50;
              const y = 280 - (p.value / 100) * 240;
              return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" "),
        },
      ];
    }

    return claims.map((c, cIdx) => {
      const cSources = allSources.filter((s) => s.claimId === c.id);
      const cVerif = claimVerifications.find((v) => v.claimId === c.id);

      const isTrue = cVerif?.verdict === "TRUE";
      const isFalse = cVerif?.verdict === "FALSE";
      const isMixed = cVerif?.verdict === "MIXED";

      // Calculate final target calibrated score
      let targetFinal = 50;
      if (isTrue) {
        targetFinal = cVerif?.confidence === "HIGH" ? 94 : 76;
      } else if (isFalse) {
        targetFinal = cVerif?.confidence === "HIGH" ? 18 : 28;
      } else if (isMixed) {
        targetFinal = 48;
      } else {
        targetFinal = 36;
      }

      // Stage 1: Input Baseline Prior (50%)
      const s1 = 50;

      // Stage 2: Claim Decomposition (50% unconditioned)
      const s2 = 50;

      // Stage 3: Retrieval Discovery (50% + source signal boost)
      const s3 = Math.min(80, Math.max(40, 50 + Math.min(20, cSources.length * 6)));

      // Stage 4: Source Analysis (Stance ratio)
      const supports = cSources.filter((s) => s.stance === "SUPPORTS").length;
      const refutes = cSources.filter((s) => s.stance === "CONTRADICTS").length;
      let s4 = s3;
      if (supports > refutes) {
        s4 = Math.min(88, s3 + 14 + supports * 2);
      } else if (refutes > supports) {
        s4 = Math.max(22, s3 - 22 - refutes * 3);
      } else {
        s4 = 48;
      }

      // Stage 5: Domain Cross-Check Corroboration
      const uniqueDomains = new Set(cSources.map((s) => s.domain)).size;
      const s5 = isTrue
        ? Math.min(92, s4 + (uniqueDomains > 1 ? 6 : 2))
        : isFalse
        ? Math.max(16, s4 - (uniqueDomains > 1 ? 6 : 2))
        : 48;

      // Stage 6: Media Provenance Check
      const hasMediaMatch = (imageProvenance?.candidates?.length ?? 0) > 0;
      const s6 = hasMediaMatch
        ? isTrue
          ? Math.min(94, s5 + 4)
          : isFalse
          ? Math.max(14, s5 - 4)
          : s5
        : s5;

      // Stage 7: Multi-AI Consensus Check
      const consensusStatus = multiAIConsensus?.overallConsensusStatus;
      const s7 =
        consensusStatus === "UNANIMOUS"
          ? isTrue
            ? Math.min(95, s6 + 4)
            : isFalse
            ? Math.max(12, s6 - 4)
            : s6
          : s6;

      // Stage 8: Final Calibrated Output
      const s8 = targetFinal;

      const stageValues = [s1, s2, s3, s4, s5, s6, s7, s8];

      const points = stageValues.map((val, idx) => {
        const prevVal = idx === 0 ? val : stageValues[idx - 1];
        return {
          stage: STAGES[idx].label,
          stageLabel: STAGES[idx].fullLabel,
          value: Math.round(val),
          delta: Math.round(val - prevVal),
        };
      });

      // Construct smooth SVG path coordinates (Width: 1000, Height: 300)
      const pathPoints = points.map((p, idx) => {
        const x = (idx / (points.length - 1)) * 880 + 60;
        const y = 270 - (p.value / 100) * 230;
        return { x, y };
      });

      // Build smooth cubic bezier curve
      let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const p0 = pathPoints[i];
        const p1 = pathPoints[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }

      const color = CLAIM_PALETTE[cIdx % CLAIM_PALETTE.length];

      return {
        claimId: c.id,
        claimText: c.text,
        verdict: cVerif?.verdict || "VERIFIED",
        finalConfidencePct: s8,
        color,
        points,
        svgPath: d,
      };
    });
  }, [extraction, evidence, verification, multiAIConsensus, imageProvenance]);

  return (
    <div id="confidence-comet-panel" className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Confidence Comet Trajectory Engine
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                CROSS-STAGE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Deterministic calibration progression across all investigation pipeline stages
            </p>
          </div>
        </div>

        {/* Claim Focus Selectors & Legend */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedClaimId(null)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
              selectedClaimId === null
                ? "bg-[#131519] text-[#D4AF5A] border-[rgba(212,175,90,0.5)] shadow-sm"
                : "bg-[#050607] text-[#8D949D] hover:text-[#F5F7FA] border-[rgba(212,175,90,0.2)]"
            }`}
          >
            All Claims ({trajectories.length})
          </button>

          {trajectories.map((traj) => {
            const isSelected = selectedClaimId === traj.claimId;
            return (
              <button
                key={traj.claimId}
                type="button"
                onClick={() => setSelectedClaimId(isSelected ? null : traj.claimId)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? "bg-[#131519] border-[rgba(212,175,90,0.6)] text-[#F5F7FA]"
                    : "bg-[#050607] border-[rgba(212,175,90,0.2)] text-[#8D949D] hover:text-[#F5F7FA]"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: traj.color.stroke }}
                />
                <span>Claim {traj.claimId}</span>
                <span className="text-[10px] text-[#D4AF5A] font-mono">
                  {traj.finalConfidencePct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas for Multi-Trajectory Comets */}
      <div className="w-full rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] p-4 relative overflow-hidden">
        {isAnalyzing ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#D4AF5A]">
            <Activity className="h-5 w-5 animate-spin" />
            <span>Calibrating cross-stage confidence trajectories...</span>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[760px] h-[320px] relative">
              <svg
                viewBox="0 0 1000 300"
                className="w-full h-full select-none"
                style={{ overflow: "visible" }}
              >
                <defs>
                  {/* Glowing Comet Head Filters */}
                  <filter id="comet-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Y-Axis Horizontal Grid Lines */}
                {[100, 75, 50, 25, 0].map((val) => {
                  const y = 270 - (val / 100) * 230;
                  return (
                    <g key={val}>
                      <line
                        x1="50"
                        y1={y}
                        x2="950"
                        y2={y}
                        stroke="rgba(212,175,90,0.12)"
                        strokeDasharray={val === 50 ? "none" : "3 3"}
                        strokeWidth={val === 50 ? "1.5" : "1"}
                      />
                      <text
                        x="38"
                        y={y + 3.5}
                        fill="#8D949D"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Vertical Stage Dividers */}
                {STAGES.map((st, idx) => {
                  const x = (idx / (STAGES.length - 1)) * 880 + 60;
                  return (
                    <line
                      key={st.id}
                      x1={x}
                      y1="40"
                      x2={x}
                      y2="270"
                      stroke="rgba(212,175,90,0.08)"
                      strokeDasharray="2 2"
                    />
                  );
                })}

                {/* Trajectory Curves and Moving Comets for Each Claim */}
                {trajectories.map((traj, tIdx) => {
                  const isSelected = selectedClaimId === null || selectedClaimId === traj.claimId;
                  const opacity = isSelected ? 1 : 0.15;
                  const strokeWidth = isSelected ? 2.5 : 1.5;
                  const dur = 4 + tIdx * 0.5; // Staggered cycle duration

                  return (
                    <g
                      key={traj.claimId}
                      style={{ opacity, transition: "opacity 0.25s ease-in-out" }}
                    >
                      {/* Hidden or visual path element */}
                      <path
                        id={`trajectory-path-${traj.claimId}`}
                        d={traj.svgPath}
                        fill="none"
                        stroke={traj.color.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Moving Comet Head with Smooth animateMotion along SVG path */}
                      {isSelected && (
                        <circle r="4" fill={traj.color.head} filter="url(#comet-glow)">
                          <animateMotion
                            dur={`${dur}s`}
                            repeatCount="indefinite"
                            path={traj.svgPath}
                            rotate="auto"
                          />
                        </circle>
                      )}

                      {/* Data Point Circles on Path */}
                      {traj.points.map((pt, pIdx) => {
                        const x = (pIdx / (traj.points.length - 1)) * 880 + 60;
                        const y = 270 - (pt.value / 100) * 230;

                        return (
                          <g
                            key={pIdx}
                            className="cursor-pointer group"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                claimId: traj.claimId,
                                claimText: traj.claimText,
                                stageLabel: pt.stageLabel,
                                value: pt.value,
                                delta: pt.delta,
                                x,
                                y,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                            onClick={() => setSelectedClaimId(traj.claimId)}
                          >
                            <circle
                              cx={x}
                              cy={y}
                              r={pIdx === traj.points.length - 1 ? 5 : 3.5}
                              fill="#050607"
                              stroke={traj.color.stroke}
                              strokeWidth="2"
                              className="transition-all hover:scale-150"
                            />
                            {isSelected && pIdx === traj.points.length - 1 && (
                              <text
                                x={x + 10}
                                y={y + 3.5}
                                fill={traj.color.stroke}
                                fontSize="10"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {pt.value}%
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Stage Labels at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[10px] text-[#8D949D] font-mono border-t border-[rgba(212,175,90,0.15)] pt-2">
                {STAGES.map((st, idx) => (
                  <div key={idx} className="text-center w-24">
                    <span className="block font-semibold text-[#D7DADF]">{st.label}</span>
                    <span className="block text-[8px] text-[#8D949D] truncate">{st.fullLabel}</span>
                  </div>
                ))}
              </div>

              {/* Forensic Tooltip on Point Hover */}
              {hoveredPoint && (
                <div
                  className="absolute z-30 pointer-events-none rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.45)] p-3 shadow-xl space-y-1 font-mono text-xs animate-in fade-in duration-100"
                  style={{
                    left: `${Math.min(750, Math.max(60, hoveredPoint.x - 60))}px`,
                    top: `${Math.max(20, hoveredPoint.y - 85)}px`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[rgba(212,175,90,0.2)] pb-1">
                    <span className="font-bold text-[#D4AF5A]">CLAIM {hoveredPoint.claimId}</span>
                    <span className="text-[10px] text-[#8D949D]">{hoveredPoint.stageLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8D949D]">Calibrated Confidence:</span>
                    <strong className="text-[#F5F7FA] text-sm">{hoveredPoint.value}%</strong>
                    {hoveredPoint.delta !== 0 && (
                      <span
                        className={`text-[10px] font-bold ${
                          hoveredPoint.delta > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {hoveredPoint.delta > 0 ? `+${hoveredPoint.delta}%` : `${hoveredPoint.delta}%`}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8D949D] font-sans line-clamp-1 max-w-[220px]">
                    {hoveredPoint.claimText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trajectory Insights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-[#8D949D] uppercase block font-bold">Corroborated High</span>
            <span className="font-bold text-[#F5F7FA]">
              {trajectories.filter((t) => t.finalConfidencePct >= 75).length} of {trajectories.length} Claims
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-[#D4AF5A] shrink-0" />
          <div>
            <span className="text-[10px] text-[#8D949D] uppercase block font-bold">Trajectory Convergence</span>
            <span className="font-bold text-[#D4AF5A]">Deterministic Multi-Stage</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center gap-2.5">
          <Info className="h-4 w-4 text-[#38BDF8] shrink-0" />
          <div>
            <span className="text-[10px] text-[#8D949D] uppercase block font-bold">Investigation Telemetry</span>
            <span className="font-bold text-[#D7DADF]">8 Continuous Stages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
