"use client";

import React, { useState } from "react";
import { EvidenceItem } from "@/types";
import { SourceQualityService } from "@/lib/evidence/sourceQuality";
import { SourceProvenanceBadge } from "./SourceProvenanceBadge";
import {
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle,
  Video,
  BookOpen,
  Info,
  X,
  ShieldCheck,
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
  const [isInspecting, setIsInspecting] = useState(false);

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
    <div className="p-4 rounded-lg bg-[#050607] hover:bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 font-mono relative">
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

      {/* Structured Source Provenance (Retrieved via Tavily • Analyzed by Gemini) */}
      <SourceProvenanceBadge
        provenance={{
          url: item.url,
          domain: item.domain,
          sourceType: item.sourceType,
          retrievalProvider: "Tavily",
          analysisProviders: ["Gemini"],
          modelName: "Gemini 2.5 Flash",
        }}
      />

      {/* Footer Metrics, Inspection Trigger & Direct URL Action */}
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

        <div className="flex items-center gap-2">
          {/* Inspect Source Button */}
          <button
            type="button"
            onClick={() => setIsInspecting(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] text-[10px] transition-colors"
            title="Inspect source forensic record"
          >
            <Info className="h-3 w-3 text-[#D4AF5A]" />
            <span>Inspect</span>
          </button>

          {/* External Link Action */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] transition-all font-semibold text-[11px]"
            >
              <span>Open source</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Detailed Forensic Source Inspection Modal/Drawer */}
      {isInspecting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0D0F12] border border-[rgba(212,175,90,0.45)] p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(212,175,90,0.25)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#D4AF5A]" />
                <span className="font-bold text-[#F5F7FA] uppercase tracking-wider">
                  Source Provenance Dossier
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInspecting(false)}
                className="p-1 rounded bg-[#050607] hover:bg-[#131519] text-[#8D949D] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.2)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#8D949D] uppercase tracking-wider font-bold">Citation Title</span>
              <h4 className="text-sm font-bold text-[#F5F7FA] font-sans leading-snug">
                {item.title}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
                <span className="text-[9px] text-[#8D949D] uppercase font-bold block">Domain</span>
                <span className="font-bold text-[#D4AF5A]">{item.domain}</span>
              </div>
              <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
                <span className="text-[9px] text-[#8D949D] uppercase font-bold block">Source Stance</span>
                <span className={`font-bold ${stanceTheme.text}`}>{stanceTheme.label}</span>
              </div>
              <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
                <span className="text-[9px] text-[#8D949D] uppercase font-bold block">Relevance Calibrated</span>
                <span className="font-bold text-[#D7DADF]">{relevancePct}%</span>
              </div>
              <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
                <span className="text-[9px] text-[#8D949D] uppercase font-bold block">Authority Tier</span>
                <span className="font-bold text-[#D4AF5A]">{quality.tier} ({quality.category || "web"})</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8D949D] uppercase tracking-wider font-bold">Extracted Context Excerpt</span>
              <p className="text-xs text-[#D7DADF] font-sans leading-relaxed bg-[#050607] p-3 rounded-lg border border-[rgba(212,175,90,0.18)]">
                &ldquo;{item.snippet}&rdquo;
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#8D949D] uppercase tracking-wider font-bold">Canonical URL</span>
              <p className="text-[11px] text-[#8D949D] font-mono break-all bg-[#050607] p-2 rounded border border-[rgba(212,175,90,0.15)]">
                {item.url}
              </p>
            </div>

            <SourceProvenanceBadge
              provenance={{
                url: item.url,
                domain: item.domain,
                sourceType: item.sourceType,
                retrievalProvider: "Tavily",
                analysisProviders: ["Gemini"],
                modelName: "Gemini 2.5 Flash",
              }}
            />

            <div className="pt-3 border-t border-[rgba(212,175,90,0.25)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsInspecting(false)}
                className="px-3 py-1.5 rounded bg-[#050607] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] text-xs"
              >
                Close Dossier
              </button>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] text-xs font-semibold"
                >
                  <span>Open Primary Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
