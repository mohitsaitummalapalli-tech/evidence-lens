"use client";

import React from "react";
import {
  InvestigationVerificationResult,
  OverallVerdictType,
  ClaimVerification,
} from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronRight,
} from "lucide-react";

interface VerificationResultPanelProps {
  verification: InvestigationVerificationResult;
  onInspectClaim?: (claimId: string) => void;
}

const VERDICT_CONFIGS: Record<
  OverallVerdictType,
  {
    label: string;
    description: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }
> = {
  VERIFIED: {
    label: "VERIFIED",
    description: "The core assertions are empirically supported by authoritative primary sources without material contradiction.",
    badgeBg: "bg-emerald-950/40",
    textColor: "text-emerald-300",
    borderColor: "border-emerald-700/50",
    icon: ShieldCheck,
    accentColor: "from-emerald-900/20",
  },
  FALSE: {
    label: "REFUTED / FALSE",
    description: "The core assertions directly contradict authoritative records or indexed factual sources.",
    badgeBg: "bg-rose-950/40",
    textColor: "text-rose-300",
    borderColor: "border-rose-700/50",
    icon: ShieldX,
    accentColor: "from-rose-900/20",
  },
  MIXED: {
    label: "MIXED ACCURACY",
    description: "The statement contains both factual elements and inaccurate, misleading, or unsubstantiated claims.",
    badgeBg: "bg-amber-950/40",
    textColor: "text-amber-300",
    borderColor: "border-amber-700/50",
    icon: ShieldAlert,
    accentColor: "from-amber-900/20",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    description: "Available indexed records provide insufficient evidentiary basis to confirm or refute the assertion.",
    badgeBg: "bg-[#131519]",
    textColor: "text-[#D7DADF]",
    borderColor: "border-[rgba(212,175,90,0.3)]",
    icon: HelpCircle,
    accentColor: "from-[#131519]/20",
  },
};

export const VerificationResultPanel: React.FC<VerificationResultPanelProps> = ({
  verification,
  onInspectClaim,
}) => {
  const currentVerdict = (verification.overallVerdict || "UNVERIFIED") as OverallVerdictType;
  const config = VERDICT_CONFIGS[currentVerdict] || VERDICT_CONFIGS.UNVERIFIED;
  const VerdictIcon = config.icon;

  const confidenceScore =
    verification.overallConfidence === "HIGH"
      ? 92
      : verification.overallConfidence === "MEDIUM"
      ? 68
      : 35;

  const claimBreakdown = verification.claimBreakdown || {
    total: 0,
    verifiedTrue: 0,
    refutedFalse: 0,
    mixed: 0,
    unverified: 0,
  };

  return (
    <div
      id="verification-result-panel"
      className="p-6 sm:p-7 space-y-6 font-mono relative overflow-hidden"
    >
      {/* Background radial accent */}
      <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${config.accentColor} to-transparent pointer-events-none rounded-full blur-3xl -z-10`} />

      {/* Top Banner: Stage Label & Verified Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[rgba(212,175,90,0.25)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D4AF5A]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF5A]">
            Executive Verification Finding
          </span>
        </div>

        <span className="text-[11px] text-[#8D949D]">
          Deterministic Pipeline Synthesis • {new Date(verification.verifiedAt || Date.now()).toLocaleTimeString()}
        </span>
      </div>

      {/* Primary Verdict Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left: Verdict Title & Semantic Badge */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border uppercase flex items-center gap-1.5 ${config.badgeBg} ${config.textColor} ${config.borderColor}`}
            >
              <VerdictIcon className="h-3.5 w-3.5" />
              {config.label}
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
              {verification.overallConfidence} CONFIDENCE
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F7FA] font-sans">
            {verification.overallSummary || config.description}
          </h2>

          <p className="text-xs text-[#D7DADF] font-sans leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Right: Calibrated Confidence Meter & Breakdown */}
        <div className="p-4 rounded-xl bg-[#050607] border border-[rgba(212,175,90,0.35)] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8D949D] uppercase tracking-wider font-semibold">
              Calibration Score
            </span>
            <span className="text-lg font-bold text-[#D4AF5A]">
              {confidenceScore}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#131519] rounded-full h-2 overflow-hidden border border-[rgba(212,175,90,0.2)]">
            <div
              className="bg-gradient-to-r from-[#C8A24A] via-[#D4AF5A] to-[#E1C16E] h-full transition-all duration-700"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[rgba(212,175,90,0.18)] text-center text-[10px]">
            <div className="p-1 rounded bg-[#0D0F12] border border-emerald-900/40">
              <span className="text-emerald-400 block font-bold">{claimBreakdown.verifiedTrue}</span>
              <span className="text-[#8D949D] text-[9px]">True</span>
            </div>
            <div className="p-1 rounded bg-[#0D0F12] border border-rose-900/40">
              <span className="text-rose-400 block font-bold">{claimBreakdown.refutedFalse}</span>
              <span className="text-[#8D949D] text-[9px]">False</span>
            </div>
            <div className="p-1 rounded bg-[#0D0F12] border border-amber-900/40">
              <span className="text-amber-400 block font-bold">{claimBreakdown.mixed}</span>
              <span className="text-[#8D949D] text-[9px]">Mixed</span>
            </div>
            <div className="p-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.2)]">
              <span className="text-[#D7DADF] block font-bold">{claimBreakdown.unverified}</span>
              <span className="text-[#8D949D] text-[9px]">Unver.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Breakdown Accordion / List */}
      {verification.claimVerifications && verification.claimVerifications.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[rgba(212,175,90,0.2)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Decomposed Claims Resolution ({verification.claimVerifications.length})</span>
            </h3>
            <span className="text-[11px] text-[#8D949D]">
              Click any proposition to inspect grounding citations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verification.claimVerifications.map((cv: ClaimVerification) => {
              const vTheme =
                cv.verdict === "TRUE"
                  ? "border-emerald-700/50 text-emerald-300 bg-emerald-950/30"
                  : cv.verdict === "FALSE"
                  ? "border-rose-700/50 text-rose-300 bg-rose-950/30"
                  : cv.verdict === "MIXED"
                  ? "border-amber-700/50 text-amber-300 bg-amber-950/30"
                  : "border-[rgba(212,175,90,0.25)] text-[#D7DADF] bg-[#050607]";

              return (
                <div
                  key={cv.claimId}
                  onClick={() => onInspectClaim?.(cv.claimId)}
                  className="p-3.5 rounded-lg bg-[#050607] hover:bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#D4AF5A] px-1.5 py-0.2 rounded bg-[#131519] border border-[rgba(212,175,90,0.3)]">
                      {cv.claimId}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${vTheme}`}>
                      {cv.verdict}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#F5F7FA] line-clamp-2 font-sans">
                    {cv.claimText}
                  </p>

                  <div className="pt-1.5 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between text-[10px] text-[#8D949D]">
                    <span>{cv.evidenceCount || (cv.supportingEvidenceIds?.length || 0) + (cv.contradictingEvidenceIds?.length || 0)} Sources</span>
                    <span className="text-[#D4AF5A] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Audit</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
