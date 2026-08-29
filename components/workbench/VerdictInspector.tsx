"use client";

import React, { useEffect } from "react";
import {
  InvestigationVerificationResult,
  EvidenceRetrievalResult,
  ClaimVerdictType,
  VerificationConfidence,
  EvidenceItem,
} from "@/types";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
  X,
  Network,
  Scale,
  Sparkles,
  Layers,
  Globe,
  Info,
} from "lucide-react";

export interface VerdictInspectorProps {
  claimId: string | null;
  verification?: InvestigationVerificationResult;
  evidence?: EvidenceRetrievalResult;
  onClose: () => void;
  onViewInGraph?: (claimId: string) => void;
}

export function getDeterministicResolutionDescription(
  verdict: ClaimVerdictType
): string {
  switch (verdict) {
    case "TRUE":
      return "Supporting evidence was found and no material contradiction was recorded.";
    case "FALSE":
      return "Contradicting evidence was found and supporting evidence was insufficient to overturn the contradiction.";
    case "MIXED":
      return "Both supporting and contradicting evidence were recorded.";
    case "UNVERIFIED":
    default:
      return "No sufficient evidence was available to resolve the claim.";
  }
}

const VERDICT_STYLES: Record<
  ClaimVerdictType,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  TRUE: {
    label: "TRUE",
    bg: "bg-emerald-950/80",
    border: "border-emerald-700/60",
    text: "text-emerald-300",
    icon: CheckCircle2,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-red-950/80",
    border: "border-red-700/60",
    text: "text-red-300",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/80",
    border: "border-amber-700/60",
    text: "text-amber-300",
    icon: MinusCircle,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-stone-900/80",
    border: "border-stone-700",
    text: "text-[#94A3B8]",
    icon: HelpCircle,
  },
};

const CONFIDENCE_STYLES: Record<
  VerificationConfidence,
  { label: string; text: string; bg: string; border: string }
> = {
  HIGH: {
    label: "HIGH CONFIDENCE",
    text: "text-emerald-400",
    bg: "bg-emerald-950/50",
    border: "border-emerald-700/40",
  },
  MEDIUM: {
    label: "MEDIUM CONFIDENCE",
    text: "text-[#CBD5E1]",
    bg: "bg-[#161B24]",
    border: "border-stone-700",
  },
  LOW: {
    label: "LOW CONFIDENCE",
    text: "text-amber-400",
    bg: "bg-amber-950/50",
    border: "border-amber-700/40",
  },
};

export const VerdictInspector: React.FC<VerdictInspectorProps> = ({
  claimId,
  verification,
  evidence,
  onClose,
  onViewInGraph,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!claimId || !verification) {
    return null;
  }

  const claimVer = verification.claimVerifications.find((c) => c.claimId === claimId);

  if (!claimVer) {
    return null;
  }

  const verdictStyle = VERDICT_STYLES[claimVer.verdict] || VERDICT_STYLES.UNVERIFIED;
  const VerdictIcon = verdictStyle.icon;
  const confidenceStyle = CONFIDENCE_STYLES[claimVer.confidence] || CONFIDENCE_STYLES.LOW;

  // Retrieve evidence items for this specific claim
  const claimSources: EvidenceItem[] = (evidence?.allSources || []).filter(
    (src) => src.claimId === claimId
  );

  const supportingSources = claimSources.filter((src) => src.stance === "SUPPORTS");
  const contradictingSources = claimSources.filter((src) => src.stance === "CONTRADICTS");
  const otherSources = claimSources.filter(
    (src) => src.stance !== "SUPPORTS" && src.stance !== "CONTRADICTS"
  );

  const deterministicDescription = getDeterministicResolutionDescription(
    claimVer.verdict
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to dismiss backdrop */}
      <div className="flex-1 hidden md:block cursor-pointer" onClick={onClose} />

      {/* Verdict Inspector Console Drawer */}
      <aside
        aria-label="Verdict Analysis Inspector"
        className="w-full md:max-w-xl h-full bg-[#0B0D11] border-l border-stone-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 relative z-10 font-sans will-change-transform"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-800 bg-[#11141A]/95 sticky top-0 z-20 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#161B24] border border-stone-800 text-red-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F8F9FA] tracking-wide">
                  WHY THIS RESULT?
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B24] text-[#F8F9FA] border border-stone-800 font-semibold">
                  {claimVer.claimId}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
                Deterministic claim synthesis and source evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewInGraph && (
              <button
                type="button"
                onClick={() => {
                  onViewInGraph(claimVer.claimId);
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-700 text-xs font-sans flex items-center gap-1.5 transition-colors shadow-sm"
                title="View claim in Evidence Map"
              >
                <Network className="h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">View in Map</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 transition-colors"
              title="Close Inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-6 flex-1 text-xs">
          {/* 1. Claim & Status Hero Card */}
          <div className="p-4 rounded-xl bg-[#11141A] border border-stone-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
              <span className="text-[11px] font-mono font-bold text-[#F8F9FA]">
                CLAIM {claimVer.claimId}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${verdictStyle.bg} ${verdictStyle.border} ${verdictStyle.text}`}
                >
                  <VerdictIcon className="h-3 w-3" />
                  {claimVer.verdict}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${confidenceStyle.bg} ${confidenceStyle.border} ${confidenceStyle.text}`}
                >
                  {confidenceStyle.label}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-[#F8F9FA] leading-relaxed">
              &ldquo;{claimVer.claimText}&rdquo;
            </p>
          </div>

          {/* 2. Evidence Resolution Metrics */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#F8F9FA] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-red-400" />
              EVIDENCE RESOLUTION
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-xl bg-[#11141A] border border-emerald-800/40">
                <span className="text-[10px] text-[#94A3B8] block">SUPPORTING</span>
                <span className="text-lg font-bold text-emerald-400">
                  {supportingSources.length}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11141A] border border-red-800/40">
                <span className="text-[10px] text-[#94A3B8] block">CONTRADICTING</span>
                <span className="text-lg font-bold text-red-400">
                  {contradictingSources.length}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11141A] border border-stone-800">
                <span className="text-[10px] text-[#94A3B8] block">INSUFFICIENT/MIXED</span>
                <span className="text-lg font-bold text-amber-400">
                  {otherSources.length}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Supporting Sources */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              SUPPORTING SOURCES ({supportingSources.length})
            </h4>

            {supportingSources.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#11141A] border border-stone-800/80 text-stone-500 font-mono text-[11px]">
                No supporting evidence sources linked to this claim.
              </div>
            ) : (
              <div className="space-y-2">
                {supportingSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl bg-[#11141A] border border-emerald-800/40 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-mono font-bold text-[9px] uppercase">
                        SUPPORTS
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {src.domain}
                      </span>
                    </div>

                    <h5 className="font-bold text-[#F8F9FA] text-xs leading-snug">
                      {src.title}
                    </h5>

                    {src.snippet && (
                      <p className="text-[11px] text-[#CBD5E1] font-sans leading-relaxed">
                        &ldquo;{src.snippet}&rdquo;
                      </p>
                    )}

                    {src.stanceExplanation && (
                      <p className="text-[10px] text-[#CBD5E1] font-mono italic">
                        Reasoning: {src.stanceExplanation}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-800 flex justify-end">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Open source ↗</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Contradicting Sources */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              CONTRADICTING SOURCES ({contradictingSources.length})
            </h4>

            {contradictingSources.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#11141A] border border-stone-800/80 text-stone-500 font-mono text-[11px]">
                No contradicting evidence sources recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {contradictingSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl bg-[#11141A] border border-red-800/40 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-700/60 font-mono font-bold text-[9px] uppercase">
                        CONTRADICTS
                      </span>
                      <span className="text-[10px] font-mono text-red-400/90 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {src.domain}
                      </span>
                    </div>

                    <h5 className="font-bold text-[#F8F9FA] text-xs leading-snug">
                      {src.title}
                    </h5>

                    {src.snippet && (
                      <p className="text-[11px] text-[#CBD5E1] font-sans leading-relaxed">
                        &ldquo;{src.snippet}&rdquo;
                      </p>
                    )}

                    {src.stanceExplanation && (
                      <p className="text-[10px] text-red-300 font-mono italic">
                        Reasoning: {src.stanceExplanation}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-800 flex justify-end">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Open source ↗</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Verdict Reasoning */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-red-400" />
              VERDICT REASONING
            </h4>

            <div className="p-3.5 rounded-xl bg-[#11141A] border border-stone-800 text-[#CBD5E1] leading-relaxed space-y-1 font-sans text-[11px]">
              <p>{claimVer.reasoning || "Verdict synthesized from evaluated evidence stances."}</p>
            </div>
          </div>

          {/* 6. Deterministic Resolution */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#F8F9FA] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-red-400" />
              DETERMINISTIC RESOLUTION
            </h4>

            <div className="p-3.5 rounded-xl bg-[#11141A] border border-stone-800 text-[#F8F9FA] leading-relaxed font-sans text-xs">
              <p>{deterministicDescription}</p>
            </div>
          </div>

          {/* 7. Forensic Transparency */}
          <div className="p-4 rounded-xl bg-[#11141A] border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-[#F8F9FA] font-bold text-xs pb-1.5 border-b border-stone-800">
              <Info className="h-4 w-4 text-red-400" />
              <span>FORENSIC TRANSPARENCY</span>
            </div>

            <p className="text-[#CBD5E1] font-sans leading-relaxed text-[11px]">
              &ldquo;EvidenceLens does not treat AI knowledge alone as evidence.&rdquo;
            </p>

            <div className="space-y-2 font-mono text-[10px] pt-1">
              <div className="flex items-center justify-between p-2 rounded bg-[#161B24] border border-stone-800">
                <span className="text-[#F8F9FA] font-bold">AI ROLE</span>
                <span className="text-[#CBD5E1]">→ Evidence stance interpretation</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161B24] border border-stone-800">
                <span className="text-[#F8F9FA] font-bold">EVIDENCE ROLE</span>
                <span className="text-[#CBD5E1]">→ External retrieved sources</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161B24] border border-stone-800">
                <span className="text-[#F8F9FA] font-bold">VERDICT ROLE</span>
                <span className="text-[#CBD5E1]">→ Deterministic claim-level synthesis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-stone-800 bg-[#11141A]/95 flex items-center justify-between gap-3 text-xs font-sans sticky bottom-0 z-20 backdrop-blur-md">
          <span className="text-[#94A3B8] text-[10px]">
            EvidenceLens Explainability Drawer
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#F8F9FA] hover:text-white border border-stone-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
