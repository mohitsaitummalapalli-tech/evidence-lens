"use client";

import React from "react";
import {
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

const VERDICT_STYLES: Record<ClaimVerdictType, { border: string; badgeBg: string; text: string }> = {
  TRUE: {
    border: "border-emerald-700/50",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/40",
    text: "text-emerald-400",
  },
  FALSE: {
    border: "border-rose-700/50",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-700/40",
    text: "text-rose-400",
  },
  MIXED: {
    border: "border-amber-700/50",
    badgeBg: "bg-amber-950/40 text-amber-300 border-amber-700/40",
    text: "text-amber-400",
  },
  UNVERIFIED: {
    border: "border-[#2A3038]",
    badgeBg: "bg-[#161B21] text-[#A7AFB8] border-[#2A3038]",
    text: "text-[#707984]",
  },
};

const STANCE_BADGES: Record<EvidenceStance, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  SUPPORTS: {
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/40",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-700/40",
    icon: XCircle,
  },
  MIXED: {
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/40",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
  NEUTRAL: {
    bg: "bg-[#161B21]",
    text: "text-[#A7AFB8]",
    border: "border-[#2A3038]",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
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
  const selectRing = isSelected ? "ring-1 ring-[#D9DEE5] shadow-sm" : "";

  // Render Root Node
  if (isRoot) {
    return (
      <div
        id={`graph-node-${node.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        style={{
          position: "absolute",
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
        }}
        className={`bg-[#11151A] border-2 border-[#D9DEE5]/80 hover:border-white rounded-lg p-3 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${opacity} ${selectRing}`}
      >
        <div className="flex items-center justify-between pb-1 border-b border-[#2A3038]">
          <span className="text-[10px] font-mono font-bold text-[#F3F5F7] tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#D9DEE5]" />
            PRIMARY ASSERTION
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#161B21] text-[#A7AFB8] border border-[#2A3038]">
            ROOT
          </span>
        </div>
        <p className="text-xs font-semibold text-[#F3F5F7] line-clamp-3 leading-snug">
          {node.title}
        </p>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#707984] pt-1">
          <span>{node.subtitle || "Input Claim"}</span>
          <span className="text-[#D9DEE5]">Grounding Active</span>
        </div>
      </div>
    );
  }

  // Render Claim Node
  if (isClaim) {
    const verdictStyle = node.verdict ? VERDICT_STYLES[node.verdict] : VERDICT_STYLES.UNVERIFIED;

    return (
      <div
        id={`graph-node-${node.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onClick(node)}
        onDoubleClick={() => onDoubleClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        style={{
          position: "absolute",
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
        }}
        className={`bg-[#080A0D] border ${verdictStyle.border} hover:border-[#D9DEE5] rounded-lg p-2.5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${opacity} ${selectRing}`}
      >
        <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#2A3038]">
          <span className="text-[10px] font-mono font-bold text-[#F3F5F7] truncate">
            {node.label}
          </span>
          {node.verdict && (
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${verdictStyle.badgeBg}`}
            >
              {node.verdict}
            </span>
          )}
        </div>

        <p className="text-[11px] font-medium text-[#F3F5F7] line-clamp-2 leading-snug my-1">
          {node.title}
        </p>

        <div className="flex items-center justify-between text-[9px] font-mono text-[#707984] pt-1 border-t border-[#2A3038]/60">
          <span>{node.category || "Claim"}</span>
          {node.confidence && (
            <span className="text-[#A7AFB8]">{node.confidence} Conf</span>
          )}
        </div>
      </div>
    );
  }

  // Render Provenance Node (Media match)
  if (isProvenance) {
    return (
      <div
        id={`graph-node-${node.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onClick(node)}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        style={{
          position: "absolute",
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
        }}
        className={`bg-[#080A0D] border border-sky-800/40 hover:border-sky-400 rounded-lg p-2.5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${opacity} ${selectRing}`}
      >
        <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#2A3038]">
          <span className="text-[10px] font-mono font-bold text-sky-400 flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-sky-400" />
            {node.label}
          </span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40 uppercase">
            {node.matchType || "MATCH"}
          </span>
        </div>

        <p className="text-[11px] font-medium text-[#F3F5F7] line-clamp-2 leading-snug my-1">
          {node.title}
        </p>

        <div className="flex items-center justify-between text-[9px] font-mono text-[#707984] pt-1 border-t border-[#2A3038]/60">
          <span className="truncate max-w-[120px]">{node.domain || "Media Record"}</span>
          {node.url && (
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#38BDF8] hover:underline flex items-center gap-0.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Render Evidence Node (Default)
  const stanceBadge = node.stance ? STANCE_BADGES[node.stance] : STANCE_BADGES.UNCERTAIN;
  const StanceIcon = stanceBadge.icon;
  const isYouTube = node.sourceType === "youtube" || (node.domain && node.domain.includes("youtube.com"));
  const isAcademic = node.sourceType === "academic" || (node.domain && node.domain.endsWith(".edu"));

  return (
    <div
      id={`graph-node-${node.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(node)}
      onMouseEnter={(e) => onMouseEnter(node, e)}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
      }}
      className={`bg-[#080A0D] border border-[#2A3038] hover:border-[#D9DEE5] rounded-lg p-2.5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${opacity} ${selectRing}`}
    >
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#2A3038]">
        <div className="flex items-center gap-1 text-[9px] font-mono text-[#707984]">
          {isYouTube ? (
            <Video className="h-3 w-3 text-[#38BDF8]" />
          ) : isAcademic ? (
            <BookOpen className="h-3 w-3 text-[#5DADE2]" />
          ) : (
            <Globe className="h-3 w-3 text-[#707984]" />
          )}
          <span className="truncate max-w-[90px]">{node.domain || "Web"}</span>
        </div>

        {node.stance && (
          <span
            className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border flex items-center gap-0.5 ${stanceBadge.bg} ${stanceBadge.text} ${stanceBadge.border}`}
          >
            <StanceIcon className="h-2.5 w-2.5" />
            {node.stance}
          </span>
        )}
      </div>

      <p className="text-[10px] font-medium text-[#D9DEE5] line-clamp-2 leading-snug my-1">
        {node.title}
      </p>

      <div className="flex items-center justify-between text-[9px] font-mono text-[#707984] pt-1 border-t border-[#2A3038]/60">
        <span>{node.label}</span>
        {node.url && (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#D9DEE5] hover:text-white flex items-center gap-0.5"
            title="Open external source"
          >
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
    </div>
  );
};
