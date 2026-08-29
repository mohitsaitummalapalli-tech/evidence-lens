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
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
    icon: ShieldCheck,
    barColor: "bg-emerald-500",
  },
  FALSE: {
    label: "FALSE",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-700/50",
    icon: ShieldX,
    barColor: "bg-rose-500",
  },
  MIXED: {
    label: "MIXED",
    badgeBg: "bg-amber-950/40 text-amber-300 border-amber-700/50",
    icon: ShieldAlert,
    barColor: "bg-amber-500",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    badgeBg: "bg-[#161B21] text-[#707984] border-[#2A3038]",
    icon: HelpCircle,
    barColor: "bg-[#707984]",
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
      return <span className="text-xs font-mono text-[#707984]">SAME (0)</span>;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#0B0E12] border border-[#2A3038] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Investigation Comparison"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3038] bg-[#11151A]/90 font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#F3F5F7] tracking-wider uppercase">
                Investigation Comparison
              </h2>
              <p className="text-[11px] text-[#707984] font-sans">
                Side-by-side analytical comparison between two verification sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwap}
              className="px-3 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#D9DEE5] border border-[#343B45] text-xs flex items-center gap-1.5 transition-colors"
              title="Swap Investigation A and B"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">Swap</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#707984] hover:text-white border border-[#2A3038] transition-colors"
              title="Close comparison"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Comparison Grid */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Side-by-side session overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session A */}
            <div className="p-4 rounded-lg bg-[#11151A] border border-[#2A3038] space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#2A3038] font-mono">
                <span className="text-[10px] text-[#707984] uppercase">
                  INVESTIGATION A
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${themeA.badgeBg}`}
                >
                  <IconA className="h-3 w-3" />
                  {investigationA.overallVerdict}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#F3F5F7] line-clamp-3 leading-snug font-sans">
                &ldquo;{investigationA.targetClaim}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#707984] pt-1">
                <span>{new Date(investigationA.timestamp).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenInvestigation(investigationA);
                    onClose();
                  }}
                  className="text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Load into workbench</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Session B */}
            <div className="p-4 rounded-lg bg-[#11151A] border border-[#2A3038] space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#2A3038] font-mono">
                <span className="text-[10px] text-[#707984] uppercase">
                  INVESTIGATION B
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${themeB.badgeBg}`}
                >
                  <IconB className="h-3 w-3" />
                  {investigationB.overallVerdict}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#F3F5F7] line-clamp-3 leading-snug font-sans">
                &ldquo;{investigationB.targetClaim}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#707984] pt-1">
                <span>{new Date(investigationB.timestamp).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenInvestigation(investigationB);
                    onClose();
                  }}
                  className="text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Load into workbench</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Analytical Metrics Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-[#F3F5F7] uppercase tracking-wider">
              Forensic Metrics Comparison
            </h4>

            <div className="border border-[#2A3038] rounded-lg overflow-hidden divide-y divide-[#2A3038] bg-[#11151A] font-mono text-xs">
              {/* Row 1: Overall Verdict */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Overall Verdict</span>
                <span className="text-[#F3F5F7] font-semibold">{investigationA.overallVerdict}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7] font-semibold">{investigationB.overallVerdict}</span>
                  <span className="text-[10px] text-[#707984]">
                    {!metrics.verdictMatches ? (
                      <span className="text-amber-400">CHANGED</span>
                    ) : (
                      <span className="text-emerald-400">SAME</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Row 2: Confidence Score */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Confidence Level</span>
                <span className="text-[#F3F5F7]">{investigationA.confidenceScore}%</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7]">{investigationB.confidenceScore}%</span>
                  {renderDelta(metrics.confidenceDelta, "%")}
                </div>
              </div>

              {/* Row 3: Claims Count */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Claims Evaluated</span>
                <span className="text-[#F3F5F7]">{investigationA.atomicClaimCount}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7]">{investigationB.atomicClaimCount}</span>
                  {renderDelta(metrics.claimsDelta)}
                </div>
              </div>

              {/* Row 4: Evidence Count */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Retrieved Sources</span>
                <span className="text-[#F3F5F7]">{investigationA.evidenceCount}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7]">{investigationB.evidenceCount}</span>
                  {renderDelta(metrics.sourcesDelta)}
                </div>
              </div>

              {/* Row 5: Domains */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Unique Domains</span>
                <span className="text-[#F3F5F7]">{investigationA.uniqueDomainCount}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7]">{investigationB.uniqueDomainCount}</span>
                  {renderDelta(metrics.domainsDelta)}
                </div>
              </div>

              {/* Row 6: Multimodal Payload */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-[#707984]">Multimodal Media</span>
                <span className="text-[#F3F5F7]">{investigationA.hasMedia ? "Attached" : "None"}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F5F7]">{investigationB.hasMedia ? "Attached" : "None"}</span>
                  <span className="text-[10px] text-[#707984]">
                    {investigationA.hasMedia === investigationB.hasMedia ? "SAME" : "DIFFERENT"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A3038] bg-[#11151A]/90 flex items-center justify-between text-xs font-mono">
          <span className="text-[#707984]">
            Investigation Comparison Engine
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#F3F5F7] hover:text-white border border-[#343B45] transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
