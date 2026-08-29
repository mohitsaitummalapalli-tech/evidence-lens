"use client";

import React, { useState } from "react";
import { MultiAIConsensusResult, MultiAIConsensusStatus } from "@/types";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
  Scale
} from "lucide-react";

interface MultiAIConsensusPanelProps {
  consensus?: MultiAIConsensusResult;
}

const STATUS_CONFIG: Record<
  MultiAIConsensusStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  UNANIMOUS: {
    label: "UNANIMOUS CONSENSUS",
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
    icon: ShieldCheck,
  },
  MAJORITY: {
    label: "MAJORITY CONSENSUS",
    bg: "bg-cyan-950/70",
    text: "text-cyan-300",
    border: "border-cyan-700/60",
    icon: ShieldCheck,
  },
  SPLIT: {
    label: "SPLIT DECISION",
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-700/60",
    icon: ShieldAlert,
  },
  SINGLE_MODEL: {
    label: "SINGLE MODEL EVALUATION",
    bg: "bg-stone-900/90",
    text: "text-[#E2C15C]",
    border: "border-[#D4AF37]/35",
    icon: Cpu,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT DATA",
    bg: "bg-stone-900/80",
    text: "text-[#94A3B8]",
    border: "border-stone-700/50",
    icon: HelpCircle,
  },
};

export const MultiAIConsensusPanel: React.FC<MultiAIConsensusPanelProps> = ({ consensus }) => {
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  if (!consensus || consensus.totalModelsParticipating === 0 || consensus.claimsConsensus.length === 0) {
    return null;
  }

  const overallStatus = STATUS_CONFIG[consensus.overallConsensusStatus] || STATUS_CONFIG.SINGLE_MODEL;
  const StatusIcon = overallStatus.icon;

  const toggleClaimExpand = (claimId: string) => {
    setExpandedClaimId((prev) => (prev === claimId ? null : claimId));
  };

  return (
    <div id="multi-ai-consensus-panel" className="bg-[#0D1017]/95 border border-stone-800 rounded-xl p-6 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-stone-800 text-[#E2C15C] shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Multi-AI Evidence Consensus
              </h3>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border flex items-center gap-1 ${overallStatus.bg} ${overallStatus.text} ${overallStatus.border}`}
              >
                <StatusIcon className="h-3 w-3" />
                {overallStatus.label}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Independent evaluations across {consensus.totalModelsParticipating} distinct AI model architectures on identical retrieved evidence.
            </p>
          </div>
        </div>

        {/* Participating Model Badges */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {consensus.participatingModels.map((model) => (
            <span
              key={model.modelId}
              className="px-2.5 py-1 rounded-lg bg-[#131720] border border-stone-800 text-[#CBD5E1] flex items-center gap-1.5 shadow-sm"
            >
              <Cpu className="h-3 w-3 text-[#D4AF37]" />
              {model.displayName}
            </span>
          ))}
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#08090C] border border-stone-800 space-y-0.5 shadow-inner text-center">
          <span className="text-[10px] text-stone-400 block uppercase">Agreement Rate</span>
          <span className="text-lg font-bold text-emerald-300">{consensus.overallAgreementRate}%</span>
        </div>
        <div className="p-3 rounded-xl bg-[#08090C] border border-stone-800 space-y-0.5 shadow-inner text-center">
          <span className="text-[10px] text-stone-400 block uppercase">Participating Models</span>
          <span className="text-lg font-bold text-[#E2C15C]">{consensus.totalModelsParticipating} Active</span>
        </div>
        <div className="p-3 rounded-xl bg-[#08090C] border border-stone-800 space-y-0.5 shadow-inner text-center">
          <span className="text-[10px] text-stone-400 block uppercase">Consensus Status</span>
          <span className={`text-base font-bold ${overallStatus.text}`}>{consensus.overallConsensusStatus}</span>
        </div>
      </div>

      {/* Per-Claim Consensus Breakdown List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 text-xs font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1 font-semibold uppercase text-[#E2C15C]">
            <Scale className="h-3.5 w-3.5 text-[#D4AF37]" />
            Claim Consensus Breakdown ({consensus.claimsConsensus.length})
          </span>
          <span className="text-[11px]">Click a claim to inspect model rationales</span>
        </div>

        {consensus.claimsConsensus.map((claimDetail) => {
          const isExpanded = expandedClaimId === claimDetail.claimId;
          const claimStatus = STATUS_CONFIG[claimDetail.status] || STATUS_CONFIG.SINGLE_MODEL;

          return (
            <div
              key={claimDetail.claimId}
              className="bg-[#08090C] border border-stone-800 hover:border-[#D4AF37]/35 rounded-xl p-4 space-y-3 transition-all shadow-inner"
            >
              {/* Claim Header Row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
                onClick={() => toggleClaimExpand(claimDetail.claimId)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/35 text-[#E2C15C] font-mono font-bold text-[11px]">
                      {claimDetail.claimId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      claimDetail.consensusVerdict === "TRUE"
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/50"
                        : claimDetail.consensusVerdict === "FALSE"
                        ? "bg-rose-950/70 text-rose-300 border-rose-700/50"
                        : claimDetail.consensusVerdict === "MIXED"
                        ? "bg-amber-950/70 text-amber-300 border-amber-700/50"
                        : "bg-stone-900 text-stone-300 border-stone-700"
                    }`}>
                      Consensus: {claimDetail.consensusVerdict}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${claimStatus.bg} ${claimStatus.text} ${claimStatus.border}`}>
                      {claimDetail.agreementCount} / {claimDetail.totalEvaluations} Agree
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#F8F9FA] leading-snug">
                    {claimDetail.claimText}
                  </p>
                </div>

                <button
                  type="button"
                  className="self-end sm:self-center p-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] border border-stone-800 text-[#94A3B8] hover:text-[#F8F9FA] transition-colors"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Expanded Individual Model Votes & Rationales */}
              {isExpanded && (
                <div className="pt-3 border-t border-stone-800/80 space-y-2.5 animate-in fade-in duration-200">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
                    Independent AI Model Evaluations:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {claimDetail.evaluations.map((ev, idx) => (
                      <div
                        key={`${ev.modelId}_${idx}`}
                        className="p-3 rounded-lg bg-[#10141D] border border-stone-800 space-y-1.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                          <span className="text-[#E2C15C] font-semibold flex items-center gap-1">
                            <Cpu className="h-3 w-3 text-[#D4AF37]" />
                            {ev.modelDisplayName}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ev.verdict === "TRUE"
                              ? "text-emerald-300"
                              : ev.verdict === "FALSE"
                              ? "text-rose-300"
                              : "text-amber-300"
                          }`}>
                            {ev.verdict} ({ev.confidence})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#C2C9D6] font-sans leading-relaxed pt-0.5">
                          {ev.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
