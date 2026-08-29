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

export interface GraphNodeData {
  id: string;
  type: "root" | "claim" | "evidence" | "media";
  label: string;
  sublabel?: string;
  url?: string;
  domain?: string;
  stance?: "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT";
  verdict?: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED" | "VERIFIED";
  confidence?: string;
  sourceType?: string;
  qualityLevel?: "HIGH" | "MEDIUM" | "LOW";
  isInspected?: boolean;
}

interface EvidenceGraphNodeProps {
  node: GraphNodeData;
  x: number;
  y: number;
  isSelected?: boolean;
  onSelect?: (node: GraphNodeData) => void;
}

export const EvidenceGraphNode: React.FC<EvidenceGraphNodeProps> = ({
  node,
  x,
  y,
  isSelected = false,
  onSelect,
}) => {
  const isRoot = node.type === "root";
  const isClaim = node.type === "claim";
  const isMedia = node.type === "media";

  // Border & Accent determination
  let borderColor = "border-[rgba(212,175,90,0.3)]";
  const badgeBg = "bg-[#0D0F12]";
  let badgeText = "text-[#D7DADF]";

  if (isRoot) {
    borderColor = "border-[#D4AF5A] shadow-[0_0_15px_rgba(200,162,74,0.18)]";
    badgeText = "text-[#D4AF5A]";
  } else if (isClaim) {
    borderColor = isSelected ? "border-[#D4AF5A]" : "border-[rgba(212,175,90,0.4)]";
    badgeText = "text-[#D7DADF]";
  } else if (isMedia) {
    borderColor = "border-[#38BDF8]/60";
    badgeText = "text-[#38BDF8]";
  } else {
    // Evidence node semantic border
    if (node.stance === "SUPPORTS") {
      borderColor = "border-emerald-700/60";
      badgeText = "text-emerald-400";
    } else if (node.stance === "CONTRADICTS") {
      borderColor = "border-rose-700/60";
      badgeText = "text-rose-400";
    } else {
      borderColor = "border-[rgba(212,175,90,0.25)]";
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

  return (
    <div
      onClick={() => onSelect?.(node)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        position: "absolute",
      }}
      className={`w-64 rounded-lg bg-[#0D0F12] border ${borderColor} p-3 select-none cursor-pointer transition-all shadow-md font-mono ${
        isSelected ? "ring-2 ring-[#D4AF5A] scale-105 z-20" : "hover:border-[#D4AF5A] z-10"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-[rgba(212,175,90,0.15)]">
        <div className="flex items-center gap-1.5">
          {isRoot ? (
            <span className="flex items-center gap-1 text-[#D4AF5A] font-bold uppercase">
              <Sparkles className="h-3 w-3" /> Target Assertion
            </span>
          ) : isClaim ? (
            <span className="text-[#D4AF5A] font-bold">
              {node.id} • ATOMIC CLAIM
            </span>
          ) : isMedia ? (
            <span className="text-[#38BDF8] font-bold flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Media Provenance
            </span>
          ) : (
            <span className="text-[#8D949D] flex items-center gap-1">
              {node.sourceType === "youtube" ? (
                <Video className="h-3 w-3 text-rose-400" />
              ) : node.sourceType === "academic" ? (
                <BookOpen className="h-3 w-3 text-[#D4AF5A]" />
              ) : (
                <Globe className="h-3 w-3 text-[#D4AF5A]" />
              )}
              {node.domain || "SOURCE"}
            </span>
          )}
        </div>

        {/* Node status / Stance pill */}
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

      {/* Node Label / Text */}
      <p className="text-xs text-[#F5F7FA] font-sans line-clamp-2 mt-1.5 leading-snug">
        {node.label}
      </p>

      {/* Node Sublabel / URL Action */}
      {node.url && (
        <div className="mt-2 pt-1 border-t border-[rgba(212,175,90,0.12)] flex items-center justify-between text-[10px] text-[#D4AF5A]">
          <span className="truncate max-w-[170px] font-sans text-[#8D949D]">{node.domain}</span>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 hover:underline"
          >
            <span>Open</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </div>
  );
};
