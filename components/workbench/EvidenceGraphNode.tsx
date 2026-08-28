"use client";

import React from "react";
import {
  Shield,
  Sparkles,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle
} from "lucide-react";
import { AtomicClaim, EvidenceItem, EvidenceStance, ClaimVerdictType } from "@/types";

export interface GraphNodeData {
  id: string;
  type: "root" | "claim" | "evidence";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  title: string;
  subtitle?: string;
  stance?: EvidenceStance;
  verdict?: ClaimVerdictType;
  confidence?: string;
  url?: string;
  domain?: string;
  category?: string;
  rawClaim?: AtomicClaim;
  rawEvidence?: EvidenceItem;
}

interface EvidenceGraphNodeProps {
  node: GraphNodeData;
  isSelected?: boolean;
  isHovered?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick: (node: GraphNodeData) => void;
  onDoubleClick: (node: GraphNodeData) => void;
  onMouseEnter: (node: GraphNodeData, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const VERDICT_GLOWS: Record<ClaimVerdictType, { border: string; glow: string; badgeBg: string; text: string }> = {
  TRUE: {
    border: "border-emerald-500/60",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    badgeBg: "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
    text: "text-emerald-400",
  },
  FALSE: {
    border: "border-rose-500/60",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    badgeBg: "bg-rose-950/70 text-rose-300 border-rose-700/50",
    text: "text-rose-400",
  },
  MIXED: {
    border: "border-amber-500/60",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    badgeBg: "bg-amber-950/70 text-amber-300 border-amber-700/50",
    text: "text-amber-400",
  },
  UNVERIFIED: {
    border: "border-[#D4AF37]/35",
    glow: "shadow-[0_0_15px_rgba(212,175,55,0.15)]",
    badgeBg: "bg-[#131720] text-[#E2C15C] border-[#D4AF37]/30",
    text: "text-[#E2C15C]",
  },
};

const STANCE_BADGES: Record<EvidenceStance, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  SUPPORTS: {
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    bg: "bg-rose-950/70",
    text: "text-rose-300",
    border: "border-rose-700/50",
    icon: XCircle,
  },
  MIXED: {
    bg: "bg-purple-950/70",
    text: "text-purple-300",
    border: "border-purple-700/50",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-700/50",
    icon: HelpCircle,
  },
  NEUTRAL: {
    bg: "bg-stone-900/80",
    text: "text-[#C2C9D6]",
    border: "border-stone-700/50",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    bg: "bg-[#131720]",
    text: "text-[#E2C15C]",
    border: "border-[#D4AF37]/30",
    icon: HelpCircle,
  },
};

export const EvidenceGraphNode: React.FC<EvidenceGraphNodeProps> = ({
  node,
  isSelected = false,
  isDimmed = false,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isRoot = node.type === "root";
  const isClaim = node.type === "claim";
  const isEvidence = node.type === "evidence";

  const opacity = isDimmed ? "opacity-25" : "opacity-100";
  const selectRing = isSelected ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#08090C]" : "";

  // Render Root Node
  if (isRoot) {
    return (
      <foreignObject
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        className={`overflow-visible transition-all duration-300 cursor-pointer ${opacity}`}
        onClick={() => onClick(node)}
        onDoubleClick={() => onDoubleClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`h-full w-full bg-[#0D1017] border-2 border-[#D4AF37] rounded-2xl p-4 shadow-2xl shadow-black/80 flex flex-col justify-between transition-all hover:border-[#F3E5B8] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#131720] border border-[#D4AF37]/40 text-[#D4AF37]">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold gold-gradient-text tracking-wider uppercase">
                TARGET COMPOUND ASSERTION
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30">
              Root Node
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-[#F8F9FA] line-clamp-2 leading-relaxed italic">
            &ldquo;{node.title}&rdquo;
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-1">
            <span className="flex items-center gap-1 text-[#E2C15C]">
              <Sparkles className="h-3 w-3" />
              Click to view complete lineage
            </span>
            <span>Multimodal Grounding</span>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Render Atomic Claim Node
  if (isClaim) {
    const verdictStyle = node.verdict
      ? VERDICT_GLOWS[node.verdict]
      : VERDICT_GLOWS.UNVERIFIED;

    return (
      <foreignObject
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        className={`overflow-visible transition-all duration-300 cursor-pointer ${opacity}`}
        onClick={() => onClick(node)}
        onDoubleClick={() => onDoubleClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`h-full w-full bg-[#0D1017] border-2 ${verdictStyle.border} ${verdictStyle.glow} rounded-xl p-3.5 flex flex-col justify-between transition-all hover:brightness-110 ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-800">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/40 text-[#E2C15C] font-mono font-bold text-xs">
                {node.label}
              </span>
              {node.category && (
                <span className="text-[9px] font-mono text-[#94A3B8] uppercase">
                  {node.category}
                </span>
              )}
            </div>

            {node.verdict && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${verdictStyle.badgeBg}`}>
                {node.verdict}
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-[#F8F9FA] line-clamp-2 leading-snug">
            {node.title}
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-1">
            <span className="text-[#E2C15C] truncate">
              {node.confidence ? `${node.confidence} Conf` : "Atomic Unit"}
            </span>
            <span className="text-[9px] text-[#64748B]">Click to filter</span>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Render Evidence Node
  if (isEvidence) {
    const stanceStyle = STANCE_BADGES[node.stance || "UNCERTAIN"] || STANCE_BADGES.UNCERTAIN;
    const StanceIcon = stanceStyle.icon;

    return (
      <foreignObject
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        className={`overflow-visible transition-all duration-300 cursor-pointer ${opacity}`}
        onClick={() => onClick(node)}
        onDoubleClick={() => onDoubleClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`h-full w-full bg-[#08090C] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 rounded-xl p-3 flex flex-col justify-between transition-all shadow-md hover:shadow-lg hover:shadow-black/60 group ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-stone-800">
            <span className="text-[10px] font-mono text-[#E2C15C] font-semibold flex items-center gap-1 truncate">
              <Globe className="h-3 w-3 text-[#D4AF37]/80 shrink-0" />
              <span className="truncate max-w-[120px]">{node.domain || "Web Source"}</span>
            </span>

            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 shrink-0 ${stanceStyle.bg} ${stanceStyle.text} ${stanceStyle.border}`}
            >
              <StanceIcon className="h-2.5 w-2.5" />
              {node.stance}
            </span>
          </div>

          <p className="text-[11px] font-medium text-[#F8F9FA] group-hover:text-[#E2C15C] transition-colors line-clamp-2 leading-snug">
            {node.title}
          </p>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] pt-0.5">
            <span>{node.label}</span>
            <span className="flex items-center gap-1 text-[#94A3B8] group-hover:text-[#D4AF37]">
              <span>Double-click open</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </foreignObject>
    );
  }

  return null;
};
