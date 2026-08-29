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
  HelpCircle,
  Image as ImageIcon,
  Video,
  BookOpen,
} from "lucide-react";
import { AtomicClaim, EvidenceItem, EvidenceStance, ClaimVerdictType, ImageProvenanceCandidate } from "@/types";

export interface GraphNodeData {
  id: string;
  type: "root" | "claim" | "evidence" | "provenance";
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
  sourceType?: string;
  category?: string;
  matchType?: string;
  relevanceScore?: number;
  rawClaim?: AtomicClaim;
  rawEvidence?: EvidenceItem;
  rawProvenance?: ImageProvenanceCandidate;
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
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    badgeBg: "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
    text: "text-emerald-400",
  },
  FALSE: {
    border: "border-red-500/60",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    badgeBg: "bg-red-950/70 text-red-300 border-red-700/50",
    text: "text-red-400",
  },
  MIXED: {
    border: "border-amber-500/60",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    badgeBg: "bg-amber-950/70 text-amber-300 border-amber-700/50",
    text: "text-amber-400",
  },
  UNVERIFIED: {
    border: "border-stone-700",
    glow: "shadow-none",
    badgeBg: "bg-stone-900 text-[#CBD5E1] border-stone-700",
    text: "text-[#CBD5E1]",
  },
};

const STANCE_BADGES: Record<EvidenceStance, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  SUPPORTS: {
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    bg: "bg-red-950/80",
    text: "text-red-300",
    border: "border-red-700/50",
    icon: XCircle,
  },
  MIXED: {
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-700/50",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    bg: "bg-stone-900/80",
    text: "text-stone-300",
    border: "border-stone-700",
    icon: HelpCircle,
  },
  NEUTRAL: {
    bg: "bg-slate-900/80",
    text: "text-slate-300",
    border: "border-slate-700",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    bg: "bg-[#161B24]",
    text: "text-[#CBD5E1]",
    border: "border-stone-700",
    icon: HelpCircle,
  },
};

export const EvidenceGraphNode: React.FC<EvidenceGraphNodeProps> = ({
  node,
  isSelected = false,
  isHighlighted = false,
  isDimmed = false,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isRoot = node.type === "root";
  const isClaim = node.type === "claim";
  const isEvidence = node.type === "evidence";
  const isProvenance = node.type === "provenance";

  // Dimming / Highlighting visual style
  const opacity = isDimmed ? "opacity-20 pointer-events-none scale-95" : isHighlighted ? "opacity-100 scale-102" : "opacity-95";
  const selectRing = isSelected ? "ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "";

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
          className={`h-full w-full bg-[#11141A] border-2 border-red-500/50 rounded-xl p-4 flex flex-col justify-between shadow-2xl shadow-black/80 transition-all hover:border-red-500 ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <Shield className="h-3.5 w-3.5" />
              <span>{node.label}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#CBD5E1] uppercase">
              Target Statement
            </span>
          </div>

          <p className="text-xs font-semibold text-[#F8F9FA] line-clamp-2 leading-snug">
            {node.title}
          </p>

          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1">
            <span className="text-red-400 font-medium">Root Claim</span>
            <span className="text-[9px] text-stone-500">Click to center</span>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Render Individual Claim Node
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
          className={`h-full w-full bg-[#11141A] border-2 ${verdictStyle.border} ${verdictStyle.glow} rounded-xl p-3.5 flex flex-col justify-between transition-all hover:brightness-110 ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-800">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#F8F9FA] font-mono font-bold text-xs">
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
            <span className="text-[#CBD5E1] truncate">
              {node.confidence ? `${node.confidence} Conf` : "Individual Claim"}
            </span>
            <span className="text-[9px] text-stone-500">Click to filter</span>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Render Provenance Node
  if (isProvenance) {
    const isPossibleMatch = node.matchType === "POSSIBLE_MATCH" || node.matchType === "EXACT";
    const badgeClass = isPossibleMatch
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
      : "bg-amber-950/80 text-amber-300 border-amber-700/60";

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
          className={`h-full w-full bg-[#11141A] border border-stone-800 hover:border-red-500/50 rounded-xl p-3 flex flex-col justify-between transition-all shadow-md group ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-stone-800">
            <span className="text-[10px] font-mono text-red-400 font-semibold flex items-center gap-1 truncate">
              <ImageIcon className="h-3 w-3 text-red-400 shrink-0" />
              <span className="truncate max-w-[120px]">{node.domain || "Media Match"}</span>
            </span>

            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 shrink-0 ${badgeClass}`}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {node.matchType === "POSSIBLE_MATCH" ? "MATCH FOUND" : "RELATED SOURCE"}
            </span>
          </div>

          <p className="text-[11px] font-medium text-[#F8F9FA] group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {node.title}
          </p>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] pt-0.5">
            <span className="text-red-400/80">
              Rel: {node.relevanceScore ? `${Math.round(node.relevanceScore * 100)}%` : "N/A"}
            </span>
            <span className="flex items-center gap-1 text-[#94A3B8] group-hover:text-red-400">
              <span>Open ↗</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </foreignObject>
    );
  }

  // Render Evidence Node (Web / YouTube / Academic)
  if (isEvidence) {
    const stanceStyle = STANCE_BADGES[node.stance || "UNCERTAIN"] || STANCE_BADGES.UNCERTAIN;
    const StanceIcon = stanceStyle.icon;

    const isYouTube = node.sourceType === "youtube" || (node.domain && (node.domain.includes("youtube.com") || node.domain.includes("youtu.be")));
    const isAcademic = node.sourceType === "academic" || (node.domain && (node.domain.includes("arxiv.org") || node.domain.includes("nature.com") || node.domain.endsWith(".edu")));

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
          className={`h-full w-full bg-[#11141A] border border-stone-800 hover:border-stone-700 rounded-xl p-3 flex flex-col justify-between transition-all shadow-md group ${selectRing}`}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-stone-800">
            <span className="text-[10px] font-mono text-[#CBD5E1] font-semibold flex items-center gap-1 truncate">
              {isYouTube ? (
                <Video className="h-3 w-3 text-red-400 shrink-0" />
              ) : isAcademic ? (
                <BookOpen className="h-3 w-3 text-blue-400 shrink-0" />
              ) : (
                <Globe className="h-3 w-3 text-red-400/80 shrink-0" />
              )}
              <span className="truncate max-w-[120px]">{node.domain || "Web Source"}</span>
            </span>

            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 shrink-0 ${stanceStyle.bg} ${stanceStyle.text} ${stanceStyle.border}`}
            >
              <StanceIcon className="h-2.5 w-2.5" />
              {node.stance}
            </span>
          </div>

          <p className="text-[11px] font-medium text-[#F8F9FA] group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {node.title}
          </p>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] pt-0.5">
            <span>{node.label}</span>
            <span className="flex items-center gap-1 text-[#94A3B8] group-hover:text-white">
              <span>Open ↗</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </foreignObject>
    );
  }

  return null;
};
