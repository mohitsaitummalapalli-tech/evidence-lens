"use client";

import React, { useMemo } from "react";
import {
  InvestigationHistoryRecord,
  InvestigationComparisonMetrics,
} from "@/types";
import { calculateInvestigationComparison } from "@/lib/history/storage";
import {
  X,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Database,
  Globe,
  ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface InvestigationComparisonProps {
  investigationA: InvestigationHistoryRecord;
  investigationB: InvestigationHistoryRecord;
  onClose: () => void;
  onSwap: () => void;
  onOpenInvestigation: (record: InvestigationHistoryRecord) => void;
}

const VERDICT_THEMES = {
  VERIFIED: {
    label: "VERIFIED",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
    icon: ShieldCheck,
    barColor: "bg-emerald-500",
  },
  FALSE: {
    label: "FALSE",
    badgeBg: "bg-rose-950/80 text-rose-300 border-rose-500/50",
    icon: ShieldX,
    barColor: "bg-rose-500",
  },
  MIXED: {
    label: "MIXED",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-500/50",
    icon: ShieldAlert,
    barColor: "bg-amber-500",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    badgeBg: "bg-stone-900 text-stone-300 border-stone-700",
    icon: HelpCircle,
    barColor: "bg-stone-500",
  },
};

export const InvestigationComparison: React.FC<InvestigationComparisonProps> = ({
  investigationA,
  investigationB,
  onClose,
  onSwap,
  onOpenInvestigation,
}) => {
  const metrics: InvestigationComparisonMetrics = useMemo(() => {
    return calculateInvestigationComparison(investigationA, investigationB);
  }, [investigationA, investigationB]);

  const themeA = VERDICT_THEMES[investigationA.overallVerdict] || VERDICT_THEMES.UNVERIFIED;
  const themeB = VERDICT_THEMES[investigationB.overallVerdict] || VERDICT_THEMES.UNVERIFIED;
  const IconA = themeA.icon;
  const IconB = themeB.icon;

  const renderDelta = (delta: number, suffix = "", invertSentiment = false) => {
    if (delta === 0) {
      return <span className="text-xs font-mono text-stone-500">SAME (0)</span>;
    }
    const isPositive = delta > 0;
    const isGood = invertSentiment ? !isPositive : isPositive;
    const colorClass = isGood ? "text-emerald-400" : "text-amber-400";
    const sign = delta > 0 ? "+" : "";

    return (
      <span className={`text-xs font-mono font-bold flex items-center gap-1 ${colorClass}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {sign}{delta}{suffix}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#0D1017] border border-[#D4AF37]/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/90 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Forensic Investigation Comparison"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-[#08090C]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F8F9FA] font-mono tracking-wide">
                FORENSIC INVESTIGATION COMPARISON
              </h2>
              <p className="text-xs text-[#94A3B8] font-sans">
                Side-by-side analytical delta between two verified investigation sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwap}
              className="px-3 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] border border-[#D4AF37]/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Swap Investigation A and B"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SWAP SIDES</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
              title="Close comparison"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[#F8F9FA]">
          {/* Target Claims Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investigation A Header */}
            <div className="p-4 rounded-xl bg-[#131720]/80 border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                  INVESTIGATION A
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${themeA.badgeBg}`}>
                  {themeA.label}
                </span>
              </div>
              <p className="text-xs text-stone-200 font-sans line-clamp-2 leading-relaxed">
                &ldquo;{investigationA.targetClaim}&rdquo;
              </p>
              <div className="text-[10px] font-mono text-stone-500">
                ID: {investigationA.id.substring(0, 16)} • {new Date(investigationA.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Investigation B Header */}
            <div className="p-4 rounded-xl bg-[#131720]/80 border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#E2C15C] uppercase tracking-wider">
                  INVESTIGATION B
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${themeB.badgeBg}`}>
                  {themeB.label}
                </span>
              </div>
              <p className="text-xs text-stone-200 font-sans line-clamp-2 leading-relaxed">
                &ldquo;{investigationB.targetClaim}&rdquo;
              </p>
              <div className="text-[10px] font-mono text-stone-500">
                ID: {investigationB.id.substring(0, 16)} • {new Date(investigationB.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Core Metrics Comparison Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
              Core Metric Delta Matrix
            </h3>

            <div className="border border-stone-800 rounded-xl overflow-hidden bg-[#08090C]">
              <div className="grid grid-cols-12 text-xs font-mono font-bold text-[#D4AF37] p-3 bg-[#131720] border-b border-stone-800">
                <div className="col-span-4 sm:col-span-5">METRIC</div>
                <div className="col-span-3 sm:col-span-2 text-center">INV A</div>
                <div className="col-span-2 text-center">DELTA</div>
                <div className="col-span-3 text-center">INV B</div>
              </div>

              {/* Row 1: Verdict */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                  <span>Overall Verdict</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 ${themeA.badgeBg}`}>
                    <IconA className="h-3 w-3" />
                    {themeA.label}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  {metrics.verdictMatches ? (
                    <span className="text-[10px] text-stone-500">MATCH</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold">DIFF</span>
                  )}
                </div>
                <div className="col-span-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 ${themeB.badgeBg}`}>
                    <IconB className="h-3 w-3" />
                    {themeB.label}
                  </span>
                </div>
              </div>

              {/* Row 2: Confidence */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <TrendingUp className="h-4 w-4 text-[#E2C15C]" />
                  <span>Confidence Score</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-stone-200">
                  {investigationA.confidenceScore}% ({investigationA.overallConfidence})
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.confidenceDelta, "%")}
                </div>
                <div className="col-span-3 text-center font-bold text-stone-200">
                  {investigationB.confidenceScore}% ({investigationB.overallConfidence})
                </div>
              </div>

              {/* Row 3: Atomic Claims */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <span>Atomic Claims Decomposed</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-stone-200">
                  {investigationA.atomicClaimCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.claimsDelta)}
                </div>
                <div className="col-span-3 text-center font-bold text-stone-200">
                  {investigationB.atomicClaimCount}
                </div>
              </div>

              {/* Row 4: Evidence Sources */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <Database className="h-4 w-4 text-amber-400" />
                  <span>Web Evidence Sources</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-stone-200">
                  {investigationA.evidenceCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.sourcesDelta)}
                </div>
                <div className="col-span-3 text-center font-bold text-stone-200">
                  {investigationB.evidenceCount}
                </div>
              </div>

              {/* Row 5: Unique Domains */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>Authoritative Domains</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-stone-200">
                  {investigationA.uniqueDomainCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.domainsDelta)}
                </div>
                <div className="col-span-3 text-center font-bold text-stone-200">
                  {investigationB.uniqueDomainCount}
                </div>
              </div>

              {/* Row 6: Image Provenance */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <ImageIcon className="h-4 w-4 text-cyan-400" />
                  <span>Provenance Candidates</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-stone-200">
                  {investigationA.imageCandidateCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.provenanceDelta)}
                </div>
                <div className="col-span-3 text-center font-bold text-stone-200">
                  {investigationB.imageCandidateCount}
                </div>
              </div>

              {/* Row 7: Supporting Evidence */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 border-b border-stone-900 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Supporting Citations</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-emerald-400">
                  {investigationA.supportsCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.supportsDelta)}
                </div>
                <div className="col-span-3 text-center font-bold text-emerald-400">
                  {investigationB.supportsCount}
                </div>
              </div>

              {/* Row 8: Contradicting Evidence */}
              <div className="grid grid-cols-12 text-xs font-mono p-3 items-center hover:bg-[#131720]/40">
                <div className="col-span-4 sm:col-span-5 flex items-center gap-2 text-stone-300">
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span>Contradicting Citations</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-rose-400">
                  {investigationA.contradictsCount}
                </div>
                <div className="col-span-2 text-center">
                  {renderDelta(metrics.contradictsDelta, "", true)}
                </div>
                <div className="col-span-3 text-center font-bold text-rose-400">
                  {investigationB.contradictsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison: Stance Distribution & Confidence Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Bar 1: Confidence Delta */}
            <div className="p-4 rounded-xl bg-[#131720] border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#D4AF37] font-bold">
                  CONFIDENCE CALIBRATION
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Δ {metrics.confidenceDelta > 0 ? `+${metrics.confidenceDelta}` : metrics.confidenceDelta}%
                </span>
              </div>

              {/* Dual Bar */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Investigation A</span>
                    <span className="text-[#D4AF37] font-bold">{investigationA.confidenceScore}%</span>
                  </div>
                  <div className="w-full bg-[#08090C] rounded-full h-2 overflow-hidden border border-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2C15C] rounded-full transition-all duration-500"
                      style={{ width: `${investigationA.confidenceScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Investigation B</span>
                    <span className="text-[#E2C15C] font-bold">{investigationB.confidenceScore}%</span>
                  </div>
                  <div className="w-full bg-[#08090C] rounded-full h-2 overflow-hidden border border-stone-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2C15C] rounded-full transition-all duration-500"
                      style={{ width: `${investigationB.confidenceScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar 2: Support vs Contradict Ratio */}
            <div className="p-4 rounded-xl bg-[#131720] border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#D4AF37] font-bold">
                  STANCE BALANCE COMPARISON
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  SUPPORT / CONTRADICT
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {/* Inv A Stance Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Inv A: {investigationA.supportsCount} Supp / {investigationA.contradictsCount} Ref</span>
                    <span className="text-emerald-400">
                      {investigationA.supportsCount + investigationA.contradictsCount > 0
                        ? `${Math.round(
                            (investigationA.supportsCount /
                              (investigationA.supportsCount + investigationA.contradictsCount)) *
                              100
                          )}% Supp`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-[#08090C] rounded-full h-2 overflow-hidden border border-stone-800 flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          investigationA.supportsCount + investigationA.contradictsCount > 0
                            ? (investigationA.supportsCount /
                                (investigationA.supportsCount + investigationA.contradictsCount)) *
                              100
                            : 50
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{
                        width: `${
                          investigationA.supportsCount + investigationA.contradictsCount > 0
                            ? (investigationA.contradictsCount /
                                (investigationA.supportsCount + investigationA.contradictsCount)) *
                              100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Inv B Stance Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span>Inv B: {investigationB.supportsCount} Supp / {investigationB.contradictsCount} Ref</span>
                    <span className="text-emerald-400">
                      {investigationB.supportsCount + investigationB.contradictsCount > 0
                        ? `${Math.round(
                            (investigationB.supportsCount /
                              (investigationB.supportsCount + investigationB.contradictsCount)) *
                              100
                          )}% Supp`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-[#08090C] rounded-full h-2 overflow-hidden border border-stone-800 flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          investigationB.supportsCount + investigationB.contradictsCount > 0
                            ? (investigationB.supportsCount /
                                (investigationB.supportsCount + investigationB.contradictsCount)) *
                              100
                            : 50
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{
                        width: `${
                          investigationB.supportsCount + investigationB.contradictsCount > 0
                            ? (investigationB.contradictsCount /
                                (investigationB.supportsCount + investigationB.contradictsCount)) *
                              100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-[#08090C] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-stone-500">
            Click to load either investigation directly into the active workstation
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onOpenInvestigation(investigationA);
                onClose();
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>LOAD INV A</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenInvestigation(investigationB);
                onClose();
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] border border-[#D4AF37]/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>LOAD INV B</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
