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
  ChevronRight,
  ChevronDown,
  Layers,
} from "lucide-react";

export interface GraphNodeData {
  id: string;
  type: "root" | "claim" | "evidence" | "media";
  label: string;
  sublabel?: string;
  url?: string;
  domain?: string;
  snippet?: string;
  stance?: "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT";
  verdict?: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED" | "VERIFIED";
  confidence?: string;
  sourceType?: string;
  qualityLevel?: "HIGH" | "MEDIUM" | "LOW";
  isInspected?: boolean;
  claimId?: string; // Parent claim ID if this is an evidence node
  evidenceCount?: number;
  isExpanded?: boolean;
}

interface EvidenceGraphNodeProps {
  node: GraphNodeData;
  x: number;
  y: number;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onSelect?: (node: GraphNodeData) => void;
  onToggleExpand?: (claimId: string) => void;
}

export const EvidenceGraphNode: React.FC<EvidenceGraphNodeProps> = ({
  node,
  x,
  y,
  isSelected = false,
  isHighlighted = false,
  isDimmed = false,
  onSelect,
  onToggleExpand,
}) => {
  const isRoot = node.type === "root";
  const isClaim = node.type === "claim";
  const isMedia = node.type === "media";

  // Border & Accent determination
  let borderColor = "border-[rgba(212,175,90,0.3)]";
  const badgeBg = "bg-[#0D0F12]";
  let badgeText = "text-[#D7DADF]";

  if (isRoot) {
    borderColor = "border-[#D4AF5A] shadow-[0_0_16px_rgba(212,175,90,0.22)]";
    badgeText = "text-[#D4AF5A]";
  } else if (isClaim) {
    borderColor = isSelected || isHighlighted
      ? "border-[#D4AF5A] shadow-[0_0_12px_rgba(212,175,90,0.18)]"
      : "border-[rgba(212,175,90,0.35)]";
    badgeText = "text-[#D4AF5A]";
  } else if (isMedia) {
    borderColor = isSelected || isHighlighted
      ? "border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)]"
      : "border-[#38BDF8]/60";
    badgeText = "text-[#38BDF8]";
  } else {
    // Evidence node semantic border
    if (node.stance === "SUPPORTS") {
      borderColor = isSelected || isHighlighted
        ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        : "border-emerald-700/60";
      badgeText = "text-emerald-400";
    } else if (node.stance === "CONTRADICTS") {
      borderColor = isSelected || isHighlighted
        ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
        : "border-rose-700/60";
      badgeText = "text-rose-400";
    } else {
      borderColor = isSelected || isHighlighted
        ? "border-[#D4AF5A]"
        : "border-[rgba(212,175,90,0.25)]";
      badgeText = "text-[#8D949D]";
    }
  }

  const StanceIcon =
    node.stance === "SUPPORTS"
      ? CheckCircle2
      : node.stance === "CONTRADICTS"
      ? XCircle
      : node.stance === "NEUTRAL"
      ? MinusCircle
      : HelpCircle;

  const nodeWidth = isRoot ? "w-72" : isClaim ? "w-68 sm:w-72" : "w-64";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node);
      }}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        position: "absolute",
      }}
      className={`${nodeWidth} rounded-lg bg-[#0D0F12] border ${borderColor} p-3 select-none cursor-pointer transition-all duration-300 font-mono shadow-lg ${
        isDimmed ? "opacity-25 blur-[0.3px]" : "opacity-100"
      } ${
        isSelected
          ? "ring-2 ring-[#D4AF5A] z-30 scale-[1.02]"
          : isHighlighted
          ? "z-20 scale-[1.01]"
          : "hover:border-[#D4AF5A] z-10"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-[rgba(212,175,90,0.15)] gap-2">
        <div className="flex items-center gap-1.5 truncate">
          {isRoot ? (
            <span className="flex items-center gap-1 text-[#D4AF5A] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Target Assertion
            </span>
          ) : isClaim ? (
            <div className="flex items-center gap-1.5">
              <span className="h-4 px-1.5 rounded bg-[#131519] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A] font-bold text-[9px] flex items-center justify-center">
                {node.id}
              </span>
              <span className="text-[#D7DADF] font-bold text-[10px] uppercase">
                {node.sublabel || "ATOMIC UNIT"}
              </span>
            </div>
          ) : isMedia ? (
            <span className="text-[#38BDF8] font-bold flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Media Provenance
            </span>
          ) : (
            <span className="text-[#8D949D] flex items-center gap-1 truncate font-sans">
              {node.sourceType === "youtube" ? (
                <Video className="h-3 w-3 text-rose-400 shrink-0" />
              ) : node.sourceType === "academic" ? (
                <BookOpen className="h-3 w-3 text-[#D4AF5A] shrink-0" />
              ) : (
                <Globe className="h-3 w-3 text-[#D4AF5A] shrink-0" />
              )}
              <strong className="text-[#D7DADF] truncate">{node.domain || "SOURCE"}</strong>
            </span>
          )}
        </div>

        {/* Right Header Action / Badge */}
        <div className="flex items-center gap-1 shrink-0">
          {isClaim && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.(node.id);
              }}
              className="px-1.5 py-0.5 rounded bg-[#050607] hover:bg-[#131519] text-[#D4AF5A] hover:text-white border border-[rgba(212,175,90,0.3)] flex items-center gap-1 text-[9px] font-bold transition-colors"
              title={node.isExpanded ? "Collapse attached evidence" : "Expand attached evidence"}
            >
              <Layers className="h-2.5 w-2.5" />
              <span>{node.evidenceCount ?? 0}</span>
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3 text-[#D4AF5A]" />
              ) : (
                <ChevronRight className="h-3 w-3 text-[#D4AF5A]" />
              )}
            </button>
          )}

          {node.stance && (
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex items-center gap-0.5 ${badgeBg} ${badgeText} border border-current/20`}
            >
              <StanceIcon className="h-2.5 w-2.5" />
              {node.stance}
            </span>
          )}

          {node.verdict && (
            <span className="text-[9px] font-bold text-[#D4AF5A] px-1.5 py-0.2 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)]">
              {node.verdict}
            </span>
          )}
        </div>
      </div>

      {/* Node Body / Text */}
      <p className={`text-xs text-[#F5F7FA] font-sans mt-1.5 leading-snug ${isClaim && !node.isExpanded ? "line-clamp-2" : "line-clamp-3"}`}>
        &ldquo;{node.label}&rdquo;
      </p>

      {/* Node Footer for Evidence / Media */}
      {node.url && (
        <div className="mt-2 pt-1 border-t border-[rgba(212,175,90,0.12)] flex items-center justify-between text-[10px] text-[#D4AF5A]">
          <span className="truncate max-w-[150px] font-sans text-[#8D949D]">{node.domain}</span>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 hover:underline font-semibold"
          >
            <span>Open</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </div>
  );
};
