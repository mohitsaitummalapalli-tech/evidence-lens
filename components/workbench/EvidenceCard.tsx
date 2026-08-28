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
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  CONTRADICTS: {
    label: "CONTRADICTS",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  NEUTRAL: {
    label: "NEUTRAL / TOPICAL",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: MinusCircle,
  },
  UNCERTAIN: {
    label: "UNCERTAIN / INCONCLUSIVE",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
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
    <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 space-y-3.5 transition-all shadow-sm flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header: Linked Claim Badge + Stance Pill (AI Interpretation) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-700/50 text-cyan-300 font-mono font-bold text-[11px] flex items-center gap-1 shadow-sm">
              Linked: {evidence.claimId}
            </span>
            {relevancePercentage !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                <Target className="h-3 w-3 text-cyan-400" />
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
            <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800/40 flex items-center gap-0.5" title="Classified by Gemini AI">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          </div>
        </div>

        {/* Source Title & Domain */}
        <div>
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {evidence.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Globe className="h-3 w-3 text-slate-500" />
              {evidence.domain}
            </span>
            {evidence.publishedDate && (
              <>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {evidence.publishedDate}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Retrieved Raw Snippet */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-lg p-3 space-y-1 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-1 border-b border-slate-800/50">
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <Quote className="h-3 w-3 text-slate-500" />
              RETRIEVED CITATION EXCERPT
            </span>
            <span>Web Source</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-4 pt-1">
            {evidence.snippet || "No textual excerpt available from provider."}
          </p>
        </div>

        {/* Stance Explanation (AI interpretation) */}
        {evidence.stanceExplanation && (
          <div className="text-[11px] text-slate-400 font-mono italic px-1 bg-slate-900/40 p-2 rounded border border-slate-800/60 flex items-start gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
            <span>AI Interpretation: {evidence.stanceExplanation}</span>
          </div>
        )}
      </div>

      {/* Footer: Open External Source */}
      <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-slate-500">
          Source ID: {evidence.id}
        </span>

        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-mono text-xs border border-slate-800 transition-colors"
        >
          <span>Open Source</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

