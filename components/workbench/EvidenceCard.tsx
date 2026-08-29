import React from "react";
import { EvidenceItem, EvidenceStance, SourceQualityTier } from "@/types";
import {
  Globe,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle,
  Quote,
  Target,
  Video,
  Play,
  ShieldCheck,
  ShieldAlert,
  Shield,
  BookOpen,
  Info
} from "lucide-react";

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

const STANCE_CONFIG: Record<
  EvidenceStance,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  SUPPORTS: {
    label: "SUPPORTS CLAIM",
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    label: "CONTRADICTS",
    bg: "bg-red-950/70",
    text: "text-red-300",
    border: "border-red-700/60",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED EVIDENCE",
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-700/60",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT",
    bg: "bg-stone-900/90",
    text: "text-[#94A3B8]",
    border: "border-stone-700/60",
    icon: HelpCircle,
  },
  NEUTRAL: {
    label: "NEUTRAL / TOPICAL",
    bg: "bg-stone-900/90",
    text: "text-[#C2C9D6]",
    border: "border-stone-700/60",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    label: "UNCERTAIN",
    bg: "bg-stone-900/90",
    text: "text-[#94A3B8]",
    border: "border-stone-700/50",
    icon: HelpCircle,
  },
};

const QUALITY_CONFIG: Record<
  SourceQualityTier,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  HIGH: {
    label: "HIGH TRUST SOURCE",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-800/40",
    icon: ShieldCheck,
  },
  MEDIUM: {
    label: "STANDARD SOURCE",
    bg: "bg-stone-900/80",
    text: "text-[#CBD5E1]",
    border: "border-stone-700/50",
    icon: Shield,
  },
  LOW: {
    label: "COMMUNITY / SOCIAL POST",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-800/40",
    icon: ShieldAlert,
  },
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const stanceInfo = STANCE_CONFIG[evidence.stance] || STANCE_CONFIG.UNCERTAIN;
  const StanceIcon = stanceInfo.icon;

  const qualityTier = evidence.sourceQuality || "MEDIUM";
  const qualityInfo = QUALITY_CONFIG[qualityTier] || QUALITY_CONFIG.MEDIUM;
  const QualityIcon = qualityInfo.icon;

  const isYouTube =
    evidence.sourceType === "youtube" ||
    evidence.domain.toLowerCase().includes("youtube.com") ||
    evidence.domain.toLowerCase().includes("youtu.be") ||
    evidence.url.toLowerCase().includes("youtube.com") ||
    evidence.url.toLowerCase().includes("youtu.be");

  const isAcademic =
    evidence.sourceType === "academic" ||
    evidence.domain.toLowerCase().includes("arxiv.org") ||
    evidence.domain.toLowerCase().includes("nature.com") ||
    evidence.domain.toLowerCase().includes("sciencedirect.com") ||
    evidence.domain.toLowerCase().endsWith(".edu");

  const isVideoPortal =
    evidence.sourceType === "video_portal" ||
    evidence.domain.toLowerCase().includes("vimeo.com") ||
    evidence.domain.toLowerCase().includes("dailymotion.com");

  const relevancePercentage =
    typeof evidence.relevanceScore === "number"
      ? Math.round(evidence.relevanceScore * 100)
      : null;

  return (
    <div className="bg-[#11141A] border border-stone-800 hover:border-stone-700 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Header: Linked Claim ID + Source Type Badge + Stance Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#CBD5E1] font-mono font-bold text-[11px] flex items-center gap-1 shadow-sm">
              Claim {evidence.claimId}
            </span>

            {/* Source Type Tag */}
            {isYouTube ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 font-semibold flex items-center gap-1">
                <Video className="h-3 w-3 text-red-400" />
                YOUTUBE
              </span>
            ) : isAcademic ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-semibold flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-blue-400" />
                ACADEMIC
              </span>
            ) : isVideoPortal ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold flex items-center gap-1">
                <Video className="h-3 w-3 text-purple-400" />
                VIDEO
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B24] text-[#CBD5E1] border border-stone-800 font-semibold flex items-center gap-1">
                <Globe className="h-3 w-3 text-red-400" />
                WEB
              </span>
            )}

            {/* Evidence Relevance */}
            {relevancePercentage !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161B24] text-[#94A3B8] border border-stone-800 flex items-center gap-1" title="Search relevance score">
                <Target className="h-3 w-3 text-red-400" />
                {relevancePercentage}% rel
              </span>
            )}
          </div>

          {/* Stance Pill */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${stanceInfo.bg} ${stanceInfo.text} ${stanceInfo.border}`}
              title="Stance: Relation between evidence and claim"
            >
              <StanceIcon className="h-3 w-3 shrink-0" />
              {stanceInfo.label}
            </span>
          </div>
        </div>

        {/* Source Title & Domain */}
        <div>
          <h4 className="text-sm font-semibold text-[#F8F9FA] group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {evidence.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] mt-1">
            <span className="flex items-center gap-1 text-[#94A3B8]">
              {isYouTube || isVideoPortal ? (
                <Video className="h-3 w-3 text-red-400" />
              ) : (
                <Globe className="h-3 w-3 text-[#94A3B8]" />
              )}
              {evidence.domain}
            </span>
            {evidence.publishedDate && (
              <>
                <span className="text-stone-700">•</span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Calendar className="h-3 w-3 text-[#94A3B8]" />
                  {evidence.publishedDate}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Source Quality & Trust Bar */}
        <div className="bg-[#0B0D11] border border-stone-800 rounded-lg p-2.5 flex items-start gap-2 text-[11px]">
          <QualityIcon className={`h-4 w-4 shrink-0 mt-0.5 ${qualityInfo.text}`} />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-bold ${qualityInfo.text}`}>
                {qualityInfo.label}
              </span>
              <span className="text-[9px] text-stone-500 uppercase font-mono">Trust Signal</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-sans leading-tight">
              {evidence.qualityReason || "Indexed web source."}
            </p>
          </div>
        </div>

        {/* Retrieved Raw Snippet */}
        <div className="bg-[#0B0D11] border border-stone-800/80 rounded-lg p-3 space-y-1 relative shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pb-1 border-b border-stone-800/60">
            <span className="flex items-center gap-1 text-[#94A3B8] font-semibold">
              <Quote className="h-3 w-3 text-red-400" />
              {isYouTube ? "VIDEO EXCERPT / DESCRIPTION" : "CITATION EXCERPT"}
            </span>
            <span>{isYouTube ? "YouTube Video" : "Web Citation"}</span>
          </div>
          <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed line-clamp-4 pt-1">
            {evidence.snippet || "No textual excerpt available from provider."}
          </p>
        </div>

        {/* Stance Explanation */}
        {evidence.stanceExplanation && (
          <div className="text-[11px] text-[#94A3B8] font-sans px-2.5 py-1.5 bg-[#161B24] rounded-lg border border-stone-800 flex items-start gap-1.5 leading-relaxed">
            <Info className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <span>Reasoning: {evidence.stanceExplanation}</span>
          </div>
        )}
      </div>

      {/* Footer: Open External Source / Watch Video */}
      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-[#64748B]">
          ID: {evidence.id}
        </span>

        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold border transition-all shadow-sm ${
            isYouTube
              ? "bg-red-950/60 hover:bg-red-900/70 text-red-200 border-red-700/50 hover:border-red-500"
              : "bg-[#161B24] hover:bg-[#1E2430] text-[#F8F9FA] hover:text-white border-stone-700 hover:border-stone-500"
          }`}
        >
          {isYouTube ? (
            <>
              <Play className="h-3 w-3 fill-red-400 text-red-400" />
              <span>Watch on YouTube ↗</span>
            </>
          ) : (
            <>
              <span>Open source ↗</span>
              <ExternalLink className="h-3 w-3" />
            </>
          )}
        </a>
      </div>
    </div>
  );
};
