"use client";

import React from "react";
import { EvidenceItem } from "@/types";
import { SourceQualityService } from "@/lib/evidence/sourceQuality";
import {
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle,
  Video,
  BookOpen,
} from "lucide-react";

interface EvidenceCardProps {
  item: EvidenceItem;
  targetClaimText?: string;
}

const sourceQualityService = new SourceQualityService();

const STANCE_BADGES: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  SUPPORTS: {
    label: "SUPPORTS",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    label: "CONTRADICTS",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-700/50",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
    icon: MinusCircle,
  },
  NEUTRAL: {
    label: "NEUTRAL / MENTIONS",
    bg: "bg-[#131519]",
    text: "text-[#D7DADF]",
    border: "border-[rgba(212,175,90,0.3)]",
    icon: HelpCircle,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT",
    bg: "bg-[#131519]",
    text: "text-[#8D949D]",
    border: "border-[rgba(212,175,90,0.2)]",
    icon: HelpCircle,
  },
};

const QUALITY_BADGES: Record<
  "HIGH" | "MEDIUM" | "LOW",
  { label: string; bg: string; text: string; border: string }
> = {
  HIGH: {
    label: "AUTHORITATIVE",
    bg: "bg-[#0D0F12]",
    text: "text-[#D4AF5A]",
    border: "border-[rgba(212,175,90,0.4)]",
  },
  MEDIUM: {
    label: "STANDARD QUALITY",
    bg: "bg-[#0D0F12]",
    text: "text-[#D7DADF]",
    border: "border-[rgba(212,175,90,0.25)]",
  },
  LOW: {
    label: "LOW / UNINDEXED",
    bg: "bg-[#0D0F12]",
    text: "text-[#8D949D]",
    border: "border-[rgba(212,175,90,0.2)]",
  },
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item }) => {
  const quality = sourceQualityService.evaluateSourceQuality(
    item.url,
    item.domain,
    item.sourceType
  );
  const stanceKey = String(item.stance || "NEUTRAL").toUpperCase();
  const stanceTheme = STANCE_BADGES[stanceKey] || STANCE_BADGES.NEUTRAL;
  const qualityTheme = QUALITY_BADGES[quality.tier] || QUALITY_BADGES.MEDIUM;
  const StanceIcon = stanceTheme.icon;

  const isVideo = item.sourceType === "youtube" || item.domain.includes("youtube.com");
  const isAcademic = item.sourceType === "academic" || quality.category === "academic";

  const relevancePct = Math.round((item.relevanceScore ?? 0.8) * 100);

  return (
    <div className="p-4 rounded-lg bg-[#050607] hover:bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 font-mono">
      {/* Top Header: Source Type + Domain + Quality + Stance */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[rgba(212,175,90,0.18)]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Type Icon */}
          <div className="p-1 rounded bg-[#131519] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A]">
            {isVideo ? (
              <Video className="h-3.5 w-3.5" />
            ) : isAcademic ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
          </div>

          <span className="font-bold text-xs text-[#F5F7FA]">
            {item.domain}
          </span>

          <span className="text-[9px] px-1.5 py-0.2 rounded uppercase bg-[#131519] border border-[rgba(212,175,90,0.25)] text-[#D4AF5A]">
            {item.sourceType || "web"}
          </span>

          {/* Quality Tier Pill */}
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-semibold ${qualityTheme.bg} ${qualityTheme.text} ${qualityTheme.border}`}
          >
            {quality.tier}
          </span>
        </div>

        {/* Evidence Stance Pill */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${stanceTheme.bg} ${stanceTheme.text} ${stanceTheme.border}`}
        >
          <StanceIcon className="h-3 w-3" />
          {stanceTheme.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-semibold text-[#F5F7FA] font-sans leading-snug line-clamp-2">
        {item.title}
      </h3>

      {/* Snippet / Citation Excerpt */}
      {item.snippet && (
        <p className="text-xs text-[#D7DADF] font-sans leading-relaxed line-clamp-3 bg-[#0D0F12] p-2.5 rounded border border-[rgba(212,175,90,0.15)]">
          &ldquo;{item.snippet}&rdquo;
        </p>
      )}

      {/* Footer Metrics & Direct URL Action */}
      <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-[11px] text-[#8D949D]">
          <span>
            Relevance: <strong className="text-[#D4AF5A]">{relevancePct}%</strong>
          </span>

          {quality.category && (
            <span>
              Category: <strong className="text-[#D7DADF] uppercase">{quality.category}</strong>
            </span>
          )}
        </div>

        {/* External Link Action */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] transition-all font-semibold"
          >
            <span>Open source</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};
