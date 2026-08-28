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
  Sparkles,
} from "lucide-react";

interface VerificationResultPanelProps {
  verification: InvestigationVerificationResult;
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
    badgeBg: "bg-emerald-500 text-slate-950",
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
    bg: "bg-purple-950/40",
    border: "border-purple-500/40",
    text: "text-purple-300",
    badgeBg: "bg-purple-500 text-white",
    icon: ShieldAlert,
    description: "The assertion contains a mixture of verified true facts and refuted, contradictory, or unverified claims.",
  },
  UNVERIFIED: {
    label: "UNVERIFIED / INSUFFICIENT",
    bg: "bg-slate-900/60",
    border: "border-slate-700/50",
    text: "text-slate-300",
    badgeBg: "bg-slate-700 text-slate-200",
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
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    icon: XCircle,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: MinusCircle,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-slate-800/40",
    border: "border-slate-700/50",
    text: "text-slate-400",
    icon: HelpCircle,
  },
};

const CONFIDENCE_BADGES: Record<VerificationConfidence, { label: string; color: string }> = {
  HIGH: { label: "High Confidence", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/50" },
  MEDIUM: { label: "Medium Confidence", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/50" },
  LOW: { label: "Low Confidence", color: "text-amber-400 border-amber-500/30 bg-amber-950/50" },
};

export const VerificationResultPanel: React.FC<VerificationResultPanelProps> = ({
  verification,
}) => {
  const overallConfig = OVERALL_CONFIG[verification.overallVerdict] || OVERALL_CONFIG.UNVERIFIED;
  const OverallIcon = overallConfig.icon;
  const confBadge = CONFIDENCE_BADGES[verification.overallConfidence] || CONFIDENCE_BADGES.LOW;

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-6 shadow-xl shadow-emerald-950/10 space-y-6 animate-in fade-in duration-300">
      {/* 1. Overall Verdict Banner */}
      <div className={`p-6 rounded-xl border ${overallConfig.bg} ${overallConfig.border} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200">
              <OverallIcon className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider uppercase text-slate-400 font-bold">
                  Investigation Synthesis Verdict
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${overallConfig.badgeBg}`}>
                  {overallConfig.label}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">
                {overallConfig.description}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded border font-semibold ${confBadge.color}`}>
              {confBadge.label}
            </span>
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3" />
              {new Date(verification.verifiedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Synthesis Reasoning Summary & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              Grounded Synthesis Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {verification.overallSummary}
            </p>
          </div>

          {/* Breakdown Scoreboard */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>CLAIM RESOLUTION MATRIX</span>
              <span>{verification.claimBreakdown.total} Total</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div className="p-1 rounded bg-emerald-950/50 border border-emerald-800/50 text-emerald-300">
                <span className="block font-bold">{verification.claimBreakdown.verifiedTrue}</span>
                <span className="text-[9px]">TRUE</span>
              </div>
              <div className="p-1 rounded bg-rose-950/50 border border-rose-800/50 text-rose-300">
                <span className="block font-bold">{verification.claimBreakdown.refutedFalse}</span>
                <span className="text-[9px]">FALSE</span>
              </div>
              <div className="p-1 rounded bg-purple-950/50 border border-purple-800/50 text-purple-300">
                <span className="block font-bold">{verification.claimBreakdown.mixed}</span>
                <span className="text-[9px]">MIXED</span>
              </div>
              <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                <span className="block font-bold">{verification.claimBreakdown.unverified}</span>
                <span className="text-[9px]">UNVERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Atomic Claim Verification Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              Atomic Claim Verifications ({verification.claimVerifications.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Phase 5 Deterministic Verification
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
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Header: Claim ID + Verdict Pill */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-700/50 text-cyan-300 font-mono font-bold text-xs">
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
                  <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    {claimVer.claimText}
                  </p>

                  {/* Verification Reasoning */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                      Evidence Grounding:
                    </span>
                    <p>{claimVer.reasoning}</p>
                  </div>
                </div>

                {/* Evidence Link Count Footer */}
                <div className="pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Transparency Note */}
      <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          <strong className="text-slate-300">Forensic Transparency Note:</strong> Verdicts are generated from the retrieved evidence shown below. EvidenceLens does not treat AI knowledge alone as evidence.
        </p>
      </div>
    </div>
  );
};
