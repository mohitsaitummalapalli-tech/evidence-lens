"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  InvestigationVerificationResult,
  ClaimVerdictType,
  VerificationConfidence,
} from "@/types";
import {
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Activity,
  Sparkles,
} from "lucide-react";

interface ConfidenceCometGraphProps {
  verification?: InvestigationVerificationResult;
  isAnalyzing?: boolean;
}

// Deterministic Confidence Mapping
const CONFIDENCE_SCORE_MAP: Record<VerificationConfidence, number> = {
  HIGH: 90,
  MEDIUM: 65,
  LOW: 35,
};

export const ConfidenceCometGraph: React.FC<ConfidenceCometGraphProps> = ({
  verification,
  isAnalyzing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe Container Width Tracking
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const claimVerifications = useMemo(
    () => verification?.claimVerifications || [],
    [verification?.claimVerifications]
  );

  // Compute mapped claim metrics
  const mappedPoints = useMemo(() => {
    return claimVerifications.map((cv, index) => {
      const score = CONFIDENCE_SCORE_MAP[cv.confidence] ?? 50;
      return {
        index,
        claimId: cv.claimId || `C${index + 1}`,
        claimText: cv.claimText,
        verdict: cv.verdict,
        confidence: cv.confidence,
        confidenceScore: score,
        supportingCount: cv.supportingEvidenceIds?.length || 0,
        contradictingCount: cv.contradictingEvidenceIds?.length || 0,
        reasoning: cv.reasoning,
      };
    });
  }, [claimVerifications]);

  // Compute average confidence
  const avgConfidence = useMemo(() => {
    if (mappedPoints.length === 0) return 0;
    const sum = mappedPoints.reduce((acc, p) => acc + p.confidenceScore, 0);
    return Math.round(sum / mappedPoints.length);
  }, [mappedPoints]);

  // Dimensions & Coordinates calculation for responsive SVG
  const width = 800;
  const height = 280;
  const padding = useMemo(() => ({ top: 40, right: 60, bottom: 50, left: 60 }), []);

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Convert Score (0-100) to SVG Y coordinate
  const getY = useCallback(
    (score: number) => {
      const clamped = Math.max(0, Math.min(100, score));
      return padding.top + plotHeight - (clamped / 100) * plotHeight;
    },
    [padding.top, plotHeight]
  );

  // Convert Claim index to SVG X coordinate
  const getX = useCallback(
    (index: number, total: number) => {
      if (total <= 1) return padding.left + plotWidth / 2;
      return padding.left + (index / (total - 1)) * plotWidth;
    },
    [padding.left, plotWidth]
  );

  // Construct SVG Path through coordinates
  const { pathD, areaD, coordinates } = useMemo(() => {
    if (mappedPoints.length === 0) {
      return { pathD: "", areaD: "", coordinates: [] };
    }

    const coords = mappedPoints.map((p, idx) => ({
      x: getX(idx, mappedPoints.length),
      y: getY(p.confidenceScore),
      point: p,
    }));

    if (coords.length === 1) {
      const c = coords[0];
      const singlePath = `M ${padding.left} ${c.y} L ${width - padding.right} ${c.y}`;
      const singleArea = `M ${padding.left} ${c.y} L ${width - padding.right} ${c.y} L ${width - padding.right} ${
        padding.top + plotHeight
      } L ${padding.left} ${padding.top + plotHeight} Z`;
      return { pathD: singlePath, areaD: singleArea, coordinates: coords };
    }

    // Smooth Bezier Curve generation
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const baseY = padding.top + plotHeight;
    const area = `${d} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

    return { pathD: d, areaD: area, coordinates: coords };
  }, [mappedPoints, getX, getY, padding.left, padding.right, padding.top, plotHeight, width]);

  // Replay animation trigger
  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  // Helper styling for verdict
  const getVerdictStyle = (verdict: ClaimVerdictType) => {
    switch (verdict) {
      case "TRUE":
        return {
          color: "#10B981",
          fill: "#064E3B",
          stroke: "#34D399",
          glow: "rgba(16, 185, 129, 0.4)",
          badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
        };
      case "FALSE":
        return {
          color: "#EF4444",
          fill: "#7F1D1D",
          stroke: "#F87171",
          glow: "rgba(239, 68, 68, 0.4)",
          badgeBg: "bg-red-950/80 text-red-300 border-red-700/60",
          icon: <XCircle className="h-3 w-3 text-red-400" />,
        };
      case "MIXED":
        return {
          color: "#F59E0B",
          fill: "#78350F",
          stroke: "#FCD34D",
          glow: "rgba(245, 158, 11, 0.4)",
          badgeBg: "bg-amber-950/80 text-amber-300 border-amber-700/60",
          icon: <AlertTriangle className="h-3 w-3 text-amber-400" />,
        };
      case "UNVERIFIED":
      default:
        return {
          color: "#94A3B8",
          fill: "#161B24",
          stroke: "#94A3B8",
          glow: "rgba(148, 163, 184, 0.3)",
          badgeBg: "bg-[#161B24] text-[#CBD5E1] border-stone-700",
          icon: <HelpCircle className="h-3 w-3 text-[#94A3B8]" />,
        };
    }
  };

  // Hover point handler for tooltip positioning
  const handlePointMouseEnter = (index: number, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoveredPointIndex(index);
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointMouseLeave = () => {
    setHoveredPointIndex(null);
    setTooltipPos(null);
  };

  // If no verification exists and not analyzing, return null
  if (!verification && !isAnalyzing) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#11141A] border border-stone-800 rounded-xl shadow-2xl flex flex-col transition-all duration-300 relative overflow-hidden"
    >
      {/* Header with Title & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-stone-800 bg-[#0B0D11]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8F9FA] tracking-wide">
                Confidence Progression
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase border border-emerald-700/50 bg-emerald-950/60 text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>{isAnalyzing ? "CALCULATING..." : "ANALYSIS COMPLETE"}</span>
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
              Confidence trajectory across individual claim verifications
            </p>
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Telemetry Box */}
          <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8] px-3 py-1.5 rounded-lg bg-[#161B24] border border-stone-800">
            <div>
              CLAIMS: <span className="text-[#F8F9FA] font-bold">{mappedPoints.length}</span>
            </div>
            <div className="text-stone-700">•</div>
            <div>
              AVG CONFIDENCE:{" "}
              <span className="text-emerald-400 font-bold">{avgConfidence}%</span>
            </div>
          </div>

          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Animation" : "Play Animation"}
            className="p-2 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] border border-stone-800 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current text-red-400" />}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            onClick={handleReplay}
            title="Replay Trajectory"
            className="p-2 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-red-400 border border-stone-800 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Graph Container */}
      <div className="p-4 sm:p-6 w-full relative select-none">
        {isAnalyzing ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#94A3B8] font-mono text-xs">
            <Activity className="h-6 w-6 text-red-400 animate-pulse" />
            <p className="animate-pulse text-[#CBD5E1]">
              Calculating confidence trajectory across claims...
            </p>
          </div>
        ) : mappedPoints.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs font-mono text-[#94A3B8]">
            No verified claim confidence trajectory to display.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              key={replayKey}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[650px] max-h-[320px]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            >
              {/* Definitions */}
              <defs>
                {/* Red/Silver Trajectory Gradient */}
                <linearGradient id="redTrajectoryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F87171" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>

                {/* Area Gradient */}
                <linearGradient id="redAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
                  <stop offset="70%" stopColor="#EF4444" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>

                {/* Comet Glow Filter */}
                <filter id="cometGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Point Glow Filter */}
                <filter id="pointGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {[100, 75, 50, 25, 0].map((score) => {
                const y = getY(score);
                const isBaseline = score === 50;

                return (
                  <g key={score} className="grid-row">
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isBaseline ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.05)"}
                      strokeDasharray={isBaseline ? "4 4" : undefined}
                      strokeWidth={isBaseline ? 1.5 : 1}
                    />
                    <text
                      x={padding.left - 12}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-stone-500 font-medium"
                    >
                      {score}%
                    </text>
                  </g>
                );
              })}

              {/* Confidence Band Labels */}
              <text
                x={width - padding.right + 8}
                y={getY(90) + 3}
                className="text-[9px] font-mono fill-emerald-500/70 font-semibold"
              >
                HIGH (90%)
              </text>
              <text
                x={width - padding.right + 8}
                y={getY(65) + 3}
                className="text-[9px] font-mono fill-stone-400 font-semibold"
              >
                MED (65%)
              </text>
              <text
                x={width - padding.right + 8}
                y={getY(35) + 3}
                className="text-[9px] font-mono fill-amber-500/70 font-semibold"
              >
                LOW (35%)
              </text>

              {/* Shaded Area Under Curve */}
              {areaD && (
                <path
                  d={areaD}
                  fill="url(#redAreaGrad)"
                  className="transition-opacity duration-500"
                />
              )}

              {/* Base SVG Trajectory Path */}
              {pathD && (
                <>
                  {/* Subtle Background Glow Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.2)"
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Primary Crimson Path */}
                  <path
                    id={`confidenceTrajectoryPath-${replayKey}`}
                    d={pathD}
                    fill="none"
                    stroke="url(#redTrajectoryGrad)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Traveling Indicator Particle along Trajectory */}
              {pathD && isPlaying && (
                <g className="comet-group">
                  <circle r={8} fill="#EF4444" opacity={0.35} filter="url(#cometGlowFilter)">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path={pathD}
                      rotate="auto"
                    />
                  </circle>

                  <circle r={4} fill="#F87171" opacity={0.8} filter="url(#cometGlowFilter)">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path={pathD}
                      rotate="auto"
                    />
                  </circle>

                  <circle r={2.5} fill="#FFFFFF">
                    <animateMotion
                      dur="3.2s"
                      repeatCount="indefinite"
                      path={pathD}
                      rotate="auto"
                    />
                  </circle>
                </g>
              )}

              {/* Data Points on the Trajectory */}
              {coordinates.map((coord, idx) => {
                const style = getVerdictStyle(coord.point.verdict);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onMouseEnter={(e) => handlePointMouseEnter(idx, e)}
                    onMouseMove={(e) => handlePointMouseEnter(idx, e)}
                    onMouseLeave={handlePointMouseLeave}
                  >
                    {/* Outer Pulse Ring */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? 14 : 9}
                      fill={style.glow}
                      className="transition-all duration-200"
                    />

                    {/* Main Node Point */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? 7 : 5.5}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={isHovered ? 2.5 : 2}
                      filter="url(#pointGlowFilter)"
                      className="transition-all duration-200"
                    />

                    {/* Center Core Dot */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={2}
                      fill="#FFFFFF"
                      className="transition-all duration-200"
                    />

                    {/* X-Axis Claim Label */}
                    <text
                      x={coord.x}
                      y={height - padding.bottom + 20}
                      textAnchor="middle"
                      className={`text-xs font-mono font-bold transition-colors ${
                        isHovered ? "fill-red-400" : "fill-[#94A3B8]"
                      }`}
                    >
                      {coord.point.claimId}
                    </text>

                    {/* Verdict Tag Below X Label */}
                    <text
                      x={coord.x}
                      y={height - padding.bottom + 34}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-semibold"
                      fill={style.color}
                    >
                      {coord.point.verdict} ({coord.point.confidenceScore}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Tooltip Card */}
        {hoveredPointIndex !== null && tooltipPos && mappedPoints[hoveredPointIndex] && (
          <div
            className="absolute z-30 pointer-events-none p-3.5 rounded-xl bg-[#0B0D11]/95 border border-stone-800 shadow-2xl max-w-xs text-xs space-y-2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(tooltipPos.x + 12, containerWidth - 270)}px`,
              top: `${Math.max(10, tooltipPos.y - 120)}px`,
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-[#F8F9FA]">
                  {mappedPoints[hoveredPointIndex].claimId}
                </span>
                <span className="text-[10px] text-stone-500">•</span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {mappedPoints[hoveredPointIndex].confidence} CONFIDENCE
                </span>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                  getVerdictStyle(mappedPoints[hoveredPointIndex].verdict).badgeBg
                }`}
              >
                {getVerdictStyle(mappedPoints[hoveredPointIndex].verdict).icon}
                {mappedPoints[hoveredPointIndex].verdict}
              </span>
            </div>

            {/* Claim Statement */}
            <p className="text-[#F8F9FA] text-xs font-medium leading-snug line-clamp-3">
              {mappedPoints[hoveredPointIndex].claimText}
            </p>

            {/* Supporting / Contradicting Counts */}
            <div className="flex items-center justify-between text-[10px] font-mono bg-[#161B24] p-2 rounded-lg border border-stone-800">
              <div className="text-emerald-400">
                SUPPORTS: {mappedPoints[hoveredPointIndex].supportingCount}
              </div>
              <div className="text-stone-700">|</div>
              <div className="text-red-400">
                CONTRADICTS: {mappedPoints[hoveredPointIndex].contradictingCount}
              </div>
            </div>

            {/* Confidence Score Pill */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-0.5">
              <span>Numeric Weight:</span>
              <span className="text-[#F8F9FA] font-bold">
                {mappedPoints[hoveredPointIndex].confidenceScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Forensic Bar */}
      <div className="p-3 border-t border-stone-800 bg-[#0B0D11]/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8] z-10">
        <div className="flex items-center gap-2 text-[#CBD5E1]">
          <Shield className="h-3.5 w-3.5 text-red-400" />
          <span>Confidence progression across individual claim verifications</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Hover node for full claim citation breakdown</span>
        </div>
      </div>
    </div>
  );
};
