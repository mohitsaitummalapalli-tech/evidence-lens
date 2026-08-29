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
    label: "SUPPORTS",
    bg: "bg-emerald-950/30",
    text: "text-emerald-400",
    border: "border-emerald-800/50",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    label: "CONTRADICTS",
    bg: "bg-rose-950/30",
    text: "text-rose-400",
    border: "border-rose-800/50",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/30",
    text: "text-amber-400",
    border: "border-amber-800/50",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
  NEUTRAL: {
    label: "NEUTRAL",
    bg: "bg-[#161B21]",
    text: "text-[#A7AFB8]",
    border: "border-[#2A3038]",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    label: "UNCERTAIN",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
};

const QUALITY_CONFIG: Record<
  SourceQualityTier,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  HIGH: {
    label: "HIGH TRUST",
    bg: "bg-emerald-950/20",
    text: "text-emerald-400",
    border: "border-emerald-800/30",
    icon: ShieldCheck,
  },
  MEDIUM: {
    label: "STANDARD WEB",
    bg: "bg-[#161B21]",
    text: "text-[#D9DEE5]",
    border: "border-[#2A3038]",
    icon: Shield,
  },
  LOW: {
    label: "COMMUNITY / FORUM",
    bg: "bg-amber-950/20",
    text: "text-amber-400",
    border: "border-amber-800/30",
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
    <div className="bg-[#080A0D] border border-[#2A3038] hover:border-[#343B45] rounded-lg p-4 space-y-3 transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Header: Linked Claim ID + Source Type Badge + Stance Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2A3038]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#161B21] border border-[#2A3038] text-[#F3F5F7] font-mono font-bold text-[10px]">
              Claim {evidence.claimId}
            </span>

            {/* Source Type Tag */}
            {isYouTube ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#38BDF8] border border-[#2A3038] font-semibold flex items-center gap-1">
                <Video className="h-3 w-3 text-[#38BDF8]" />
                YOUTUBE
              </span>
            ) : isAcademic ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#5DADE2] border border-[#2A3038] font-semibold flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-[#5DADE2]" />
                ACADEMIC
              </span>
            ) : isVideoPortal ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#38BDF8] border border-[#2A3038] font-semibold flex items-center gap-1">
                <Video className="h-3 w-3 text-[#38BDF8]" />
                VIDEO
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#D9DEE5] border border-[#2A3038] font-semibold flex items-center gap-1">
                <Globe className="h-3 w-3 text-[#B8C0C9]" />
                WEB
              </span>
            )}

            {/* Evidence Relevance */}
            {relevancePercentage !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161B21] text-[#707984] border border-[#2A3038] flex items-center gap-1" title="Search relevance score">
                <Target className="h-3 w-3 text-[#B8C0C9]" />
                {relevancePercentage}% rel
              </span>
            )}
          </div>

          {/* Stance Pill */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 border ${stanceInfo.bg} ${stanceInfo.text} ${stanceInfo.border}`}
              title="Stance: Relation between evidence and claim"
            >
              <StanceIcon className="h-3 w-3 shrink-0" />
              {stanceInfo.label}
            </span>
          </div>
        </div>

        {/* Source Title & Domain */}
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-[#F3F5F7] group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {evidence.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#707984] mt-1">
            <span className="flex items-center gap-1 text-[#A7AFB8]">
              {isYouTube || isVideoPortal ? (
                <Video className="h-3 w-3 text-[#38BDF8]" />
              ) : (
                <Globe className="h-3 w-3 text-[#707984]" />
              )}
              {evidence.domain}
            </span>
            {evidence.publishedDate && (
              <>
                <span className="text-[#2A3038]">•</span>
                <span className="flex items-center gap-1 text-[#707984]">
                  <Calendar className="h-3 w-3 text-[#707984]" />
                  {evidence.publishedDate}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Source Quality & Trust Bar */}
        <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 flex items-start gap-2 text-[11px]">
          <QualityIcon className={`h-4 w-4 shrink-0 mt-0.5 ${qualityInfo.text}`} />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-mono font-bold ${qualityInfo.text}`}>
                {qualityInfo.label}
              </span>
              <span className="text-[9px] text-[#707984] uppercase font-mono">Trust Signal</span>
            </div>
            <p className="text-[11px] text-[#A7AFB8] font-sans leading-tight">
              {evidence.qualityReason || "Indexed web source."}
            </p>
          </div>
        </div>

        {/* Retrieved Raw Snippet */}
        <div className="bg-[#11151A] border border-[#2A3038] rounded p-3 space-y-1 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#707984] pb-1 border-b border-[#2A3038]">
            <span className="flex items-center gap-1 text-[#D9DEE5] font-semibold">
              <Quote className="h-3 w-3 text-[#B8C0C9]" />
              {isYouTube ? "VIDEO EXCERPT / DESCRIPTION" : "CITATION EXCERPT"}
            </span>
            <span>{isYouTube ? "YouTube Video" : "Web Citation"}</span>
          </div>
          <p className="text-xs text-[#A7AFB8] font-sans leading-relaxed line-clamp-4 pt-1">
            {evidence.snippet || "No textual excerpt available from provider."}
          </p>
        </div>

        {/* Stance Explanation */}
        {evidence.stanceExplanation && (
          <div className="text-[11px] text-[#A7AFB8] font-sans px-2.5 py-1.5 bg-[#161B21] rounded border border-[#2A3038] flex items-start gap-1.5 leading-relaxed">
            <Info className="h-3.5 w-3.5 text-[#B8C0C9] shrink-0 mt-0.5" />
            <span>Reasoning: {evidence.stanceExplanation}</span>
          </div>
        )}
      </div>

      {/* Footer: Open External Source / Watch Video */}
      <div className="pt-2.5 border-t border-[#2A3038] flex items-center justify-between text-xs font-mono">
        <span className="text-[10px] text-[#707984]">
          ID: {evidence.id}
        </span>

        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#161B21] hover:bg-[#1B2027] text-[#F3F5F7] hover:text-white border border-[#343B45] transition-all"
        >
          {isYouTube ? (
            <>
              <Play className="h-3 w-3 fill-[#38BDF8] text-[#38BDF8]" />
              <span>Watch Video ↗</span>
            </>
          ) : (
            <>
              <span>Open source ↗</span>
              <ExternalLink className="h-3 w-3 text-[#A7AFB8]" />
            </>
          )}
        </a>
      </div>
    </div>
  );
};
