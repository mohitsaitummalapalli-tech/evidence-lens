"use client";

import React from "react";
import {
  InvestigationVerificationResult,
  ClaimVerdictType,
  OverallVerdictType,
  VerificationConfidence,
} from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Info,
  Scale,
} from "lucide-react";

interface VerificationResultPanelProps {
  verification: InvestigationVerificationResult;
  onInspectClaim?: (claimId: string) => void;
}

const OVERALL_CONFIG: Record<
  OverallVerdictType,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  VERIFIED: {
    label: "VERIFIED FACTUAL",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    badgeBg: "bg-emerald-500 text-[#08090C]",
    icon: ShieldCheck,
    description: "All core atomic claims are corroborated by credible retrieved web evidence with zero unresolved contradictions.",
  },
  FALSE: {
    label: "REFUTED / UNTRUE",
    bg: "bg-rose-950/40",
    border: "border-rose-500/40",
    text: "text-rose-300",
    badgeBg: "bg-rose-500 text-white",
    icon: ShieldX,
    description: "Key atomic claims are contradicted or refuted by primary retrieved web sources.",
  },
  MIXED: {
    label: "MIXED VERACITY",
    bg: "bg-amber-950/40",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badgeBg: "bg-amber-500 text-[#08090C]",
    icon: ShieldAlert,
    description: "The assertion contains a mixture of verified true facts and refuted, contradictory, or unverified claims.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED / INSUFFICIENT",
    bg: "bg-stone-900/60",
    border: "border-stone-700/50",
    text: "text-stone-300",
    badgeBg: "bg-stone-700 text-stone-200",
    icon: HelpCircle,
    description: "Available external evidence is insufficient or inconclusive to establish verification.",
  },
};

const CLAIM_VERDICT_CONFIG: Record<
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
    bg: "bg-emerald-950/60",
    border: "border-emerald-700/50",
    text: "text-emerald-300",
    icon: CheckCircle2,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-rose-950/60",
    border: "border-rose-700/50",
    text: "text-rose-300",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/60",
    border: "border-amber-700/50",
    text: "text-amber-300",
    icon: MinusCircle,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-stone-900/80",
    border: "border-stone-700/50",
    text: "text-[#94A3B8]",
    icon: HelpCircle,
  },
};

const CONFIDENCE_BADGES: Record<VerificationConfidence, { label: string; color: string }> = {
  HIGH: { label: "High Confidence", color: "text-emerald-300 border-emerald-500/30 bg-emerald-950/50" },
  MEDIUM: { label: "Medium Confidence", color: "text-[#E2C15C] border-[#D4AF37]/30 bg-[#D4AF37]/10" },
  LOW: { label: "Low Confidence", color: "text-amber-300 border-amber-500/30 bg-amber-950/50" },
};

export const VerificationResultPanel: React.FC<VerificationResultPanelProps> = ({
  verification,
  onInspectClaim,
}) => {
  const overallConfig = OVERALL_CONFIG[verification.overallVerdict] || OVERALL_CONFIG.UNVERIFIED;
  const OverallIcon = overallConfig.icon;
  const confBadge = CONFIDENCE_BADGES[verification.overallConfidence] || CONFIDENCE_BADGES.LOW;

  return (
    <div id="verification-result-panel" className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-xl p-6 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300">
      {/* 1. Overall Verdict Banner */}
      <div className={`p-6 rounded-xl border ${overallConfig.bg} ${overallConfig.border} space-y-4 shadow-inner`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#08090C] border border-[#D4AF37]/30 text-[#E2C15C] shadow-md">
              <OverallIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans tracking-normal uppercase text-[#94A3B8] font-bold">
                  Verification Verdict
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-bold uppercase ${overallConfig.badgeBg}`}>
                  {overallConfig.label}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#F8F9FA] mt-1">
                {overallConfig.description}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-3 py-1 rounded-full border font-semibold ${confBadge.color}`}>
              {confBadge.label}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#08090C] border border-stone-800 text-[#94A3B8] flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5 text-[#E2C15C]" />
              {new Date(verification.verifiedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Synthesis Reasoning Summary & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-1.5">
            <span className="text-xs font-sans uppercase text-[#E2C15C] font-semibold flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-[#E2C15C]" />
              Summary Explanation
            </span>
            <p className="text-sm text-[#F8F9FA] leading-relaxed">
              {verification.overallSummary}
            </p>
          </div>

          {/* Breakdown Scoreboard */}
          <div className="p-3.5 rounded-xl bg-[#08090C] border border-stone-800 space-y-2 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#94A3B8] text-xs">
              <span className="font-medium">Claims Overview</span>
              <span className="text-[#E2C15C] font-bold">{verification.claimBreakdown.total} Total</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                <span className="block font-bold">{verification.claimBreakdown.verifiedTrue}</span>
                <span className="text-[10px]">TRUE</span>
              </div>
              <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300">
                <span className="block font-bold">{verification.claimBreakdown.refutedFalse}</span>
                <span className="text-[10px]">FALSE</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300">
                <span className="block font-bold">{verification.claimBreakdown.mixed}</span>
                <span className="text-[10px]">MIXED</span>
              </div>
              <div className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[#94A3B8]">
                <span className="block font-bold">{verification.claimBreakdown.unverified}</span>
                <span className="text-[10px]">UNVERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Atomic Claim Verification Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#E2C15C]" />
            <h3 className="text-sm font-bold text-[#E2C15C] font-sans">
              Individual Claims Breakdown ({verification.claimVerifications.length})
            </h3>
          </div>
          <span className="text-xs text-[#64748B]">
            Grounded Verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verification.claimVerifications.map((claimVer) => {
            const claimStyle = CLAIM_VERDICT_CONFIG[claimVer.verdict] || CLAIM_VERDICT_CONFIG.UNVERIFIED;
            const ClaimIcon = claimStyle.icon;
            const claimConf = CONFIDENCE_BADGES[claimVer.confidence] || CONFIDENCE_BADGES.LOW;

            return (
              <div
                key={claimVer.claimId}
                className="bg-[#08090C] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 rounded-xl p-4.5 space-y-3 transition-all flex flex-col justify-between shadow-md"
              >
                <div className="space-y-2.5">
                  {/* Header: Claim ID + Verdict Pill */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/40 text-[#E2C15C] font-mono font-bold text-xs">
                        {claimVer.claimId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${claimStyle.bg} ${claimStyle.border} ${claimStyle.text}`}>
                        <ClaimIcon className="h-3 w-3" />
                        {claimVer.verdict}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${claimConf.color}`}>
                      {claimVer.confidence}
                    </span>
                  </div>

                  {/* Claim Text */}
                  <p className="text-xs sm:text-sm font-semibold text-[#F8F9FA] leading-snug">
                    {claimVer.claimText}
                  </p>

                  {/* Verification Reasoning */}
                  <div className="p-3 rounded-lg bg-[#050608] border border-stone-800 text-xs text-[#C2C9D6] font-mono leading-relaxed space-y-1 shadow-inner">
                    <span className="text-[10px] text-[#E2C15C] font-bold block uppercase">
                      Evidence Grounding:
                    </span>
                    <p>{claimVer.reasoning}</p>
                  </div>
                </div>

                {/* Evidence Link Count Footer & Inspector Trigger */}
                <div className="pt-2.5 border-t border-stone-900 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#94A3B8]">
                  <span>{claimVer.evidenceCount} Sources Evaluated</span>

                  <div className="flex items-center gap-2">
                    {claimVer.supportingEvidenceIds.length > 0 && (
                      <span className="text-emerald-400">
                        +{claimVer.supportingEvidenceIds.length} Supports
                      </span>
                    )}
                    {claimVer.contradictingEvidenceIds.length > 0 && (
                      <span className="text-rose-400">
                        -{claimVer.contradictingEvidenceIds.length} Refutes
                      </span>
                    )}

                    {onInspectClaim && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectClaim(claimVer.claimId);
                        }}
                        className="px-2 py-1 rounded bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] hover:text-[#F3E5B8] border border-[#D4AF37]/30 text-[10px] font-semibold flex items-center gap-1 transition-colors ml-1 shadow-sm"
                        title={`Inspect why ${claimVer.claimId} was evaluated as ${claimVer.verdict}`}
                      >
                        <Scale className="h-3 w-3 text-[#D4AF37]" />
                        <span>WHY THIS VERDICT?</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Transparency Note */}
      <div className="p-3.5 rounded-xl bg-[#08090C] border border-stone-800 text-xs text-[#94A3B8] flex items-start gap-2.5 shadow-inner">
        <Info className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          <strong className="text-[#F8F9FA]">Forensic Transparency Note:</strong> Verdicts are generated from the retrieved evidence shown below. EvidenceLens does not treat AI knowledge alone as evidence.
        </p>
      </div>
    </div>
  );
};
