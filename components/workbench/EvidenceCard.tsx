import React from "react";
import { EvidenceItem, EvidenceStance } from "@/types";
import { 
  Globe, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle,
  Quote,
  Sparkles,
  Target
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
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    label: "CONTRADICTS",
    bg: "bg-rose-950/60",
    text: "text-rose-300",
    border: "border-rose-700/50",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED EVIDENCE",
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-700/50",
    icon: MinusCircle,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT",
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-700/50",
    icon: HelpCircle,
  },
  NEUTRAL: {
    label: "NEUTRAL / TOPICAL",
    bg: "bg-stone-900/80",
    text: "text-[#C2C9D6]",
    border: "border-stone-700/50",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    label: "UNCERTAIN / UNVERIFIED",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/40",
    icon: HelpCircle,
  },
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const stanceInfo = STANCE_CONFIG[evidence.stance] || STANCE_CONFIG.UNCERTAIN;
  const StanceIcon = stanceInfo.icon;

  const relevancePercentage =
    typeof evidence.relevanceScore === "number"
      ? Math.round(evidence.relevanceScore * 100)
      : null;

  return (
    <div className="bg-[#08090C] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header: Linked Claim Badge + Stance Pill (AI Interpretation) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/40 text-[#E2C15C] font-mono font-bold text-[11px] flex items-center gap-1 shadow-sm">
              Linked: {evidence.claimId}
            </span>
            {relevancePercentage !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#131720] text-[#94A3B8] border border-stone-800 flex items-center gap-1">
                <Target className="h-3 w-3 text-[#D4AF37]" />
                {relevancePercentage}% rel
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${stanceInfo.bg} ${stanceInfo.text} ${stanceInfo.border}`}
              title="AI Stance Grounding Interpretation"
            >
              <StanceIcon className="h-3 w-3 shrink-0" />
              {stanceInfo.label}
            </span>
            <span className="text-[9px] font-mono text-[#E2C15C] bg-[#131720] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 flex items-center gap-0.5" title="Classified by Gemini AI">
              <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
              AI
            </span>
          </div>
        </div>

        {/* Source Title & Domain */}
        <div>
          <h4 className="text-sm font-semibold text-[#F8F9FA] group-hover:text-[#E2C15C] transition-colors line-clamp-2 leading-snug">
            {evidence.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] mt-1">
            <span className="flex items-center gap-1 text-[#94A3B8]">
              <Globe className="h-3 w-3 text-[#D4AF37]/70" />
              {evidence.domain}
            </span>
            {evidence.publishedDate && (
              <>
                <span className="text-stone-700">•</span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Calendar className="h-3 w-3 text-[#D4AF37]/70" />
                  {evidence.publishedDate}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Retrieved Raw Snippet */}
        <div className="bg-[#050608] border border-stone-800 rounded-lg p-3 space-y-1 relative shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pb-1 border-b border-stone-900">
            <span className="flex items-center gap-1 text-[#94A3B8] font-semibold">
              <Quote className="h-3 w-3 text-[#D4AF37]" />
              RETRIEVED CITATION EXCERPT
            </span>
            <span>Web Source</span>
          </div>
          <p className="text-xs text-[#C2C9D6] font-sans leading-relaxed line-clamp-4 pt-1">
            {evidence.snippet || "No textual excerpt available from provider."}
          </p>
        </div>

        {/* Stance Explanation (AI interpretation) */}
        {evidence.stanceExplanation && (
          <div className="text-[11px] text-[#94A3B8] font-mono italic px-2 bg-[#131720] p-2 rounded-lg border border-stone-800 flex items-start gap-1.5">
            <Sparkles className="h-3 w-3 text-[#D4AF37] shrink-0 mt-0.5" />
            <span>AI Interpretation: {evidence.stanceExplanation}</span>
          </div>
        )}
      </div>

      {/* Footer: Open External Source */}
      <div className="pt-3 border-t border-stone-900 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-[#64748B]">
          Source ID: {evidence.id}
        </span>

        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] hover:text-white font-mono text-xs border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all shadow-sm"
        >
          <span>Open Source</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};
