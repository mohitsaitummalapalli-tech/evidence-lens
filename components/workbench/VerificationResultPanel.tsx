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
    label: "SUPPORTED / VERIFIED",
    bg: "bg-emerald-950/15",
    border: "border-emerald-700/40",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    icon: ShieldCheck,
    description: "Most available evidence supports this statement.",
  },
  FALSE: {
    label: "REFUTED / FALSE",
    bg: "bg-rose-950/15",
    border: "border-rose-700/40",
    text: "text-rose-400",
    badgeBg: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    icon: ShieldX,
    description: "Available external evidence contradicts or refutes this statement.",
  },
  MIXED: {
    label: "MIXED FINDINGS",
    bg: "bg-amber-950/15",
    border: "border-amber-700/40",
    text: "text-amber-400",
    badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    icon: ShieldAlert,
    description: "This statement contains a mix of verified facts and unverified or contradictory assertions.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED / INSUFFICIENT",
    bg: "bg-[#161B21]",
    border: "border-[#2A3038]",
    text: "text-[#A7AFB8]",
    badgeBg: "bg-[#1B2027] text-[#D9DEE5] border border-[#343B45]",
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
    bg: "bg-emerald-950/30",
    border: "border-emerald-800/50",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-rose-950/30",
    border: "border-rose-800/50",
    text: "text-rose-400",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/30",
    border: "border-amber-800/50",
    text: "text-amber-400",
    icon: MinusCircle,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-[#161B21]",
    border: "border-[#2A3038]",
    text: "text-[#707984]",
    icon: HelpCircle,
  },
};

const CONFIDENCE_BADGES: Record<VerificationConfidence, { label: string; color: string }> = {
  HIGH: { label: "High Confidence (90%+)", color: "text-emerald-300 border-emerald-700/40 bg-emerald-950/30" },
  MEDIUM: { label: "Medium Confidence", color: "text-[#D9DEE5] border-[#343B45] bg-[#161B21]" },
  LOW: { label: "Low Confidence", color: "text-amber-300 border-amber-700/40 bg-amber-950/30" },
};

export const VerificationResultPanel: React.FC<VerificationResultPanelProps> = ({
  verification,
  onInspectClaim,
}) => {
  const overallConfig = OVERALL_CONFIG[verification.overallVerdict] || OVERALL_CONFIG.UNVERIFIED;
  const OverallIcon = overallConfig.icon;
  const confBadge = CONFIDENCE_BADGES[verification.overallConfidence] || CONFIDENCE_BADGES.LOW;

  return (
    <div id="verification-result-panel" className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6">
      {/* 1. Primary Verdict Banner */}
      <div className={`p-5 rounded-lg border ${overallConfig.bg} ${overallConfig.border} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A3038]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#080A0D] border border-[#2A3038] text-white shadow-sm">
              <OverallIcon className="h-7 w-7 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase text-[#707984]">
                  Verification Synthesis
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${overallConfig.badgeBg}`}>
                  {overallConfig.label}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#F3F5F7] mt-1 tracking-tight">
                {overallConfig.description}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className={`px-3 py-1 rounded border font-semibold ${confBadge.color}`}>
              {confBadge.label}
            </span>
            <span className="px-2.5 py-1 rounded bg-[#080A0D] border border-[#2A3038] text-[#A7AFB8] flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#B8C0C9]" />
              {new Date(verification.verifiedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Synthesis Reasoning & Metrics Scoreboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-1.5">
            <span className="text-xs font-mono font-semibold text-[#D9DEE5] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-[#B8C0C9]" />
              Executive Summary
            </span>
            <p className="text-sm text-[#F3F5F7] leading-relaxed font-sans">
              {verification.overallSummary}
            </p>
          </div>

          {/* Breakdown Scoreboard */}
          <div className="p-3.5 rounded-lg bg-[#080A0D] border border-[#2A3038] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[#A7AFB8]">
              <span className="font-medium">Claims Evaluated</span>
              <span className="text-[#F3F5F7] font-bold">{verification.claimBreakdown.total} Total</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                <span className="block font-bold">{verification.claimBreakdown.verifiedTrue}</span>
                <span className="text-[9px]">TRUE</span>
              </div>
              <div className="p-1.5 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300">
                <span className="block font-bold">{verification.claimBreakdown.refutedFalse}</span>
                <span className="text-[9px]">FALSE</span>
              </div>
              <div className="p-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
                <span className="block font-bold">{verification.claimBreakdown.mixed}</span>
                <span className="text-[9px]">MIXED</span>
              </div>
              <div className="p-1.5 rounded bg-[#161B21] border border-[#2A3038] text-[#707984]">
                <span className="block font-bold">{verification.claimBreakdown.unverified}</span>
                <span className="text-[9px]">UNVERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Individual Claims Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3038]">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#D9DEE5]" />
            <h3 className="text-xs font-mono font-bold text-[#F3F5F7] uppercase tracking-wider">
              Individual Claims Breakdown ({verification.claimVerifications.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#707984]">
            Evaluated against retrieved evidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {verification.claimVerifications.map((claimVer) => {
            const claimStyle = CLAIM_VERDICT_CONFIG[claimVer.verdict] || CLAIM_VERDICT_CONFIG.UNVERIFIED;
            const ClaimIcon = claimStyle.icon;
            const claimConf = CONFIDENCE_BADGES[claimVer.confidence] || CONFIDENCE_BADGES.LOW;

            return (
              <div
                key={claimVer.claimId}
                className="bg-[#080A0D] border border-[#2A3038] hover:border-[#343B45] rounded-lg p-4 space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Header: Claim ID + Verdict Pill */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#2A3038]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#161B21] border border-[#2A3038] text-[#F3F5F7] font-mono font-bold text-xs">
                        {claimVer.claimId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${claimStyle.bg} ${claimStyle.border} ${claimStyle.text}`}>
                        <ClaimIcon className="h-3 w-3" />
                        {claimVer.verdict}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${claimConf.color}`}>
                      {claimVer.confidence}
                    </span>
                  </div>

                  {/* Claim Text */}
                  <p className="text-xs sm:text-sm font-medium text-[#F3F5F7] leading-snug">
                    {claimVer.claimText}
                  </p>

                  {/* Verification Reasoning */}
                  <div className="p-2.5 rounded bg-[#11151A] border border-[#2A3038] text-xs text-[#A7AFB8] leading-relaxed space-y-1 font-sans">
                    <span className="text-[10px] font-mono text-[#D9DEE5] font-bold block uppercase tracking-wider">
                      Evidence Grounding:
                    </span>
                    <p>{claimVer.reasoning}</p>
                  </div>
                </div>

                {/* Evidence Link Count Footer & Inspector Trigger */}
                <div className="pt-2 border-t border-[#2A3038] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#707984]">
                  <span>{claimVer.evidenceCount} Sources</span>

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
                        className="px-2.5 py-1 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#F3F5F7] hover:text-white border border-[#343B45] text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors ml-1"
                        title={`Inspect evidence citations for ${claimVer.claimId}`}
                      >
                        <Scale className="h-3 w-3 text-[#B8C0C9]" />
                        <span>Audit</span>
                        <ArrowRight className="h-2.5 w-2.5 text-[#A7AFB8]" />
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
      <div className="p-3.5 rounded-lg bg-[#080A0D] border border-[#2A3038] text-xs text-[#A7AFB8] flex items-start gap-2.5 font-mono">
        <Info className="h-4 w-4 text-[#D9DEE5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F3F5F7]">Transparency Note:</strong> Verdicts are synthesized exclusively from the retrieved evidence items shown below.
        </p>
      </div>
    </div>
  );
};
