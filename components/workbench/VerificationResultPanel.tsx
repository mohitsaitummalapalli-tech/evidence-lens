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
  ArrowRight,
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
    label: "VERIFIED",
    bg: "bg-emerald-950/30",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-500 text-[#0B0D11]",
    icon: ShieldCheck,
    description: "The available evidence supports this claim.",
  },
  FALSE: {
    label: "FALSE / REFUTED",
    bg: "bg-red-950/30",
    border: "border-red-500/40",
    text: "text-red-400",
    badgeBg: "bg-red-500 text-white",
    icon: ShieldX,
    description: "The available evidence contradicts or refutes this claim.",
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/30",
    border: "border-amber-500/40",
    text: "text-amber-400",
    badgeBg: "bg-amber-500 text-[#0B0D11]",
    icon: ShieldAlert,
    description: "This statement contains a combination of verified facts and unverified or false assertions.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-stone-900/60",
    border: "border-stone-700/50",
    text: "text-[#94A3B8]",
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
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-red-950/60",
    border: "border-red-700/50",
    text: "text-red-400",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/60",
    border: "border-amber-700/50",
    text: "text-amber-400",
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
  MEDIUM: { label: "Medium Confidence", color: "text-[#CBD5E1] border-stone-700 bg-[#161B24]" },
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
    <div id="verification-result-panel" className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* 1. Strong Primary Verdict Card */}
      <div className={`p-6 rounded-xl border ${overallConfig.bg} ${overallConfig.border} space-y-4 shadow-inner`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#0B0D11] border border-stone-800 text-white shadow-md">
              <OverallIcon className="h-8 w-8 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-[#94A3B8]">
                  Verification Result
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${overallConfig.badgeBg}`}>
                  {overallConfig.label}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#F8F9FA] mt-1 tracking-tight">
                {overallConfig.description}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-3 py-1 rounded-full border font-semibold ${confBadge.color}`}>
              {confBadge.label}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#0B0D11] border border-stone-800 text-[#94A3B8] flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-red-400" />
              {new Date(verification.verifiedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Synthesis Reasoning Summary & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-1.5">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Why this result
            </span>
            <p className="text-sm text-[#F8F9FA] leading-relaxed">
              {verification.overallSummary}
            </p>
          </div>

          {/* Breakdown Scoreboard */}
          <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-stone-800 space-y-2 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="font-medium">Claims Evaluated</span>
              <span className="text-white font-bold">{verification.claimBreakdown.total} Total</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                <span className="block font-bold">{verification.claimBreakdown.verifiedTrue}</span>
                <span className="text-[10px]">TRUE</span>
              </div>
              <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300">
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

      {/* 2. Individual Claims Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-[#F8F9FA] font-sans">
              Individual Claims Breakdown ({verification.claimVerifications.length})
            </h3>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Evaluated against retrieved sources
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
                className="bg-[#0B0D11] border border-stone-800 hover:border-stone-700 rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between shadow-md"
              >
                <div className="space-y-2.5">
                  {/* Header: Claim ID + Verdict Pill */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#F8F9FA] font-mono font-bold text-xs">
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
                  <div className="p-3 rounded-lg bg-[#11141A] border border-stone-800/80 text-xs text-[#C2C9D6] leading-relaxed space-y-1 shadow-inner">
                    <span className="text-[10px] text-red-400 font-bold block uppercase tracking-wider">
                      Evidence Grounding:
                    </span>
                    <p>{claimVer.reasoning}</p>
                  </div>
                </div>

                {/* Evidence Link Count Footer & Inspector Trigger */}
                <div className="pt-2.5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#94A3B8]">
                  <span>{claimVer.evidenceCount} Sources Evaluated</span>

                  <div className="flex items-center gap-2">
                    {claimVer.supportingEvidenceIds.length > 0 && (
                      <span className="text-emerald-400">
                        +{claimVer.supportingEvidenceIds.length} Supports
                      </span>
                    )}
                    {claimVer.contradictingEvidenceIds.length > 0 && (
                      <span className="text-red-400">
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
                        className="px-2.5 py-1 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#F8F9FA] hover:text-white border border-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors ml-1 shadow-sm"
                        title={`Inspect why ${claimVer.claimId} was evaluated as ${claimVer.verdict}`}
                      >
                        <Scale className="h-3 w-3 text-red-400" />
                        <span>Why this result?</span>
                        <ArrowRight className="h-2.5 w-2.5 text-[#94A3B8]" />
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
      <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-stone-800 text-xs text-[#94A3B8] flex items-start gap-2.5 shadow-inner">
        <Info className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          <strong className="text-[#F8F9FA]">Transparency Note:</strong> Verdicts are synthesized exclusively from the retrieved evidence items shown below.
        </p>
      </div>
    </div>
  );
};
