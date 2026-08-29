"use client";

import React, { useState } from "react";
import {
  MultiAIConsensusResult,
  MultiAIConsensusStatus,
  EvidenceItem,
  ClaimEvidenceBundle,
} from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
  Scale,
  ExternalLink,
  Globe,
  Play,
  GraduationCap,
  Layers,
} from "lucide-react";

interface MultiAIConsensusPanelProps {
  consensus?: MultiAIConsensusResult;
  evidence?: {
    bundles?: ClaimEvidenceBundle[];
    allSources?: EvidenceItem[];
  };
}

const STATUS_CONFIG: Record<
  MultiAIConsensusStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  UNANIMOUS: {
    label: "UNANIMOUS JURY CONSENSUS",
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
    icon: ShieldCheck,
  },
  MAJORITY: {
    label: "MAJORITY JURY VERDICT",
    bg: "bg-cyan-950/70",
    text: "text-cyan-300",
    border: "border-cyan-700/60",
    icon: ShieldCheck,
  },
  SPLIT: {
    label: "SPLIT JURY DECISION",
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
  NO_CONSENSUS: {
    label: "NO CONSENSUS REACHED",
    bg: "bg-stone-900/80",
    text: "text-[#94A3B8]",
    border: "border-stone-700/50",
    icon: HelpCircle,
  },
};

const VERDICT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VERIFIED: { bg: "bg-emerald-950/70", text: "text-emerald-400", border: "border-emerald-500/40" },
  TRUE: { bg: "bg-emerald-950/70", text: "text-emerald-400", border: "border-emerald-500/40" },
  FALSE: { bg: "bg-red-950/70", text: "text-red-400", border: "border-red-500/40" },
  MIXED: { bg: "bg-amber-950/70", text: "text-amber-400", border: "border-amber-500/40" },
  UNVERIFIED: { bg: "bg-stone-900", text: "text-[#94A3B8]", border: "border-stone-700/50" },
};

export const MultiAIConsensusPanel: React.FC<MultiAIConsensusPanelProps> = ({ consensus, evidence }) => {
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [showClaimBreakdown, setShowClaimBreakdown] = useState(false);

  if (!consensus || consensus.totalModelsParticipating === 0) {
    return null;
  }

  // Lookup map for shared evidence items by ID
  const evidenceMap = new Map<string, EvidenceItem>();
  if (evidence?.allSources) {
    for (const src of evidence.allSources) {
      evidenceMap.set(src.id, src);
    }
  }
  if (evidence?.bundles) {
    for (const b of evidence.bundles) {
      for (const src of b.sources) {
        if (!evidenceMap.has(src.id)) {
          evidenceMap.set(src.id, src);
        }
      }
    }
  }

  const overallStatus = STATUS_CONFIG[consensus.overallConsensusStatus] || STATUS_CONFIG.SINGLE_MODEL;
  const StatusIcon = overallStatus.icon;

  const sharedSummary = consensus.sharedEvidenceSummary || {
    totalSources: evidenceMap.size,
    webSourcesCount: Array.from(evidenceMap.values()).filter((s) => (s.sourceType || "web") === "web").length,
    youtubeSourcesCount: Array.from(evidenceMap.values()).filter((s) => s.sourceType === "youtube").length,
    academicSourcesCount: Array.from(evidenceMap.values()).filter((s) => s.sourceType === "academic").length,
    imageProvenanceCount: Array.from(evidenceMap.values()).filter((s) => (s.sourceType as string) === "image" || (s.sourceType as string) === "video").length,
    uniqueDomainsCount: new Set(Array.from(evidenceMap.values()).map((s) => s.domain).filter(Boolean)).size,
    uniqueDomains: [],
    sharedNotice: `All models evaluated the same ${evidenceMap.size} retrieved sources.`,
  };

  const modelVerdicts = consensus.modelVerdicts || [];
  const majorityVerdict = consensus.majorityVerdict || "UNVERIFIED";
  const majorityConfidence = consensus.majorityConfidence || "MEDIUM";
  const agreeCount = consensus.agreementCount ?? consensus.totalModelsParticipating;
  const totalModels = consensus.totalModelsParticipating;

  const toggleModelExpand = (modelId: string) => {
    setExpandedModelId((prev) => (prev === modelId ? null : modelId));
  };

  return (
    <div
      id="multi-ai-consensus-panel"
      className="bg-[#0D1017] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-stone-800 text-[#E2C15C] shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                AI Evidence Jury
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
              Independent evaluations across {totalModels} AI models acting as impartial judges on one shared evidence dataset.
            </p>
          </div>
        </div>

        {/* Final Jury Verdict Callout */}
        <div className="flex items-center gap-3 bg-[#08090C] border border-stone-800 px-3.5 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
              Jury Verdict
            </span>
            <span className="text-sm font-bold text-[#F8F9FA]">
              {majorityVerdict}
            </span>
          </div>
          <div className="h-6 w-px bg-stone-800" />
          <div className="text-left">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
              Confidence
            </span>
            <span className="text-sm font-semibold text-[#E2C15C]">
              {majorityConfidence}
            </span>
          </div>
        </div>
      </div>

      {/* Shared Evidence Grounding Notice */}
      <div className="bg-[#131720]/80 border border-stone-800/80 rounded-xl p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#E2C15C]" />
            <span className="text-xs font-semibold text-[#F8F9FA]">
              EVIDENCE USED BY ALL MODELS
            </span>
          </div>
          <span className="text-xs font-mono text-[#E2C15C]">
            {agreeCount} / {totalModels} MODELS AGREE ({consensus.overallAgreementRate}%)
          </span>
        </div>

        <p className="text-xs text-[#C2C9D6]">
          {sharedSummary.sharedNotice || `All models evaluated the exact same ${sharedSummary.totalSources} retrieved sources.`}
        </p>

        {/* Evidence Counts Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">Total Sources</span>
            <span className="text-sm font-bold text-[#F8F9FA]">{sharedSummary.totalSources}</span>
          </div>
          <div className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-2.5 text-center flex items-center justify-center gap-2">
            <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">Web</span>
              <span className="text-sm font-bold text-[#F8F9FA]">{sharedSummary.webSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-2.5 text-center flex items-center justify-center gap-2">
            <Play className="h-3.5 w-3.5 text-red-400 fill-current shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">YouTube</span>
              <span className="text-sm font-bold text-[#F8F9FA]">{sharedSummary.youtubeSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-2.5 text-center flex items-center justify-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">Academic</span>
              <span className="text-sm font-bold text-[#F8F9FA]">{sharedSummary.academicSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-mono text-[#94A3B8] block uppercase">Domains</span>
            <span className="text-sm font-bold text-[#F8F9FA]">{sharedSummary.uniqueDomainsCount}</span>
          </div>
        </div>
      </div>

      {/* Disagreement Callout (if any) */}
      {consensus.disagreementSummary && consensus.overallConsensusStatus !== "UNANIMOUS" && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-200">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{consensus.disagreementSummary}</span>
        </div>
      )}

      {/* Model Scoreboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#E2C15C] uppercase tracking-wider">
            Model Verdict Scoreboard
          </h4>
          <span className="text-[11px] text-[#94A3B8]">
            Click a model to inspect evidence citations
          </span>
        </div>

        <div className="border border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-800/80 bg-[#08090C]">
          {modelVerdicts.length > 0 ? (
            modelVerdicts.map((mv) => {
              const isExpanded = expandedModelId === mv.modelId;
              const vColor = VERDICT_COLORS[mv.overallVerdict] || VERDICT_COLORS.UNVERIFIED;

              return (
                <div key={mv.modelId} className="transition-colors hover:bg-[#131720]/40">
                  {/* Row Summary */}
                  <div
                    onClick={() => toggleModelExpand(mv.modelId)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#131720] border border-stone-800 text-[#E2C15C]">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F8F9FA]">
                            {mv.modelDisplayName}
                          </span>
                          <span className="text-[10px] font-mono text-[#94A3B8] bg-[#131720] px-2 py-0.5 rounded border border-stone-800">
                            {mv.modelId}
                          </span>
                        </div>
                        <span className="text-xs text-[#94A3B8] block mt-0.5">
                          {mv.validEvidenceReferencesCount} grounded citations evaluated
                        </span>
                      </div>
                    </div>

                    {/* Right Metrics */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${vColor.bg} ${vColor.text} ${vColor.border}`}
                      >
                        {mv.overallVerdict}
                      </span>
                      <span className="text-xs font-medium text-[#C2C9D6] bg-[#131720] px-2.5 py-1 rounded-lg border border-stone-800">
                        {mv.overallConfidence} ({mv.quantitativeScore}%)
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#94A3B8]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="p-4 bg-[#0D1017] border-t border-stone-800 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      {/* Claim Evaluations by this model */}
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-[#E2C15C] uppercase block">
                          Claim Evaluations & Grounded Citations
                        </span>

                        {mv.claimVerdicts.map((cv) => {
                          const cvColor = VERDICT_COLORS[cv.verdict] || VERDICT_COLORS.UNVERIFIED;

                          const supportingSources = cv.supportingEvidenceIds
                            .map((id) => evidenceMap.get(id))
                            .filter((s): s is EvidenceItem => Boolean(s));

                          const contradictingSources = cv.contradictingEvidenceIds
                            .map((id) => evidenceMap.get(id))
                            .filter((s): s is EvidenceItem => Boolean(s));

                          return (
                            <div
                              key={cv.claimId}
                              className="p-3.5 bg-[#08090C] border border-stone-800 rounded-xl space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-[#94A3B8]">
                                  Claim ID: {cv.claimId}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${cvColor.bg} ${cvColor.text} ${cvColor.border}`}
                                >
                                  {cv.verdict} • {cv.confidence}
                                </span>
                              </div>

                              <p className="text-xs text-[#C2C9D6] leading-relaxed">
                                {cv.reasoning}
                              </p>

                              {/* Supporting Evidence Citations */}
                              {supportingSources.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-medium text-emerald-400 block">
                                    Supporting Evidence Citations ({supportingSources.length}):
                                  </span>
                                  <div className="space-y-1">
                                    {supportingSources.map((src) => (
                                      <a
                                        key={src.id}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded-lg bg-[#131720] border border-stone-800/80 hover:border-emerald-500/40 text-xs text-[#F8F9FA] group transition-all"
                                      >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          {src.sourceType === "youtube" ? (
                                            <Play className="h-3.5 w-3.5 text-red-400 fill-current shrink-0" />
                                          ) : (
                                            <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                          )}
                                          <span className="truncate group-hover:text-[#E2C15C]">
                                            {src.title}
                                          </span>
                                          <span className="text-[10px] text-[#94A3B8] font-mono">
                                            ({src.domain})
                                          </span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-[#94A3B8] shrink-0 group-hover:text-[#E2C15C]" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Contradicting Evidence Citations */}
                              {contradictingSources.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-medium text-red-400 block">
                                    Contradicting Evidence Citations ({contradictingSources.length}):
                                  </span>
                                  <div className="space-y-1">
                                    {contradictingSources.map((src) => (
                                      <a
                                        key={src.id}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded-lg bg-[#131720] border border-stone-800/80 hover:border-red-500/40 text-xs text-[#F8F9FA] group transition-all"
                                      >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          <Globe className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                          <span className="truncate group-hover:text-red-300">
                                            {src.title}
                                          </span>
                                          <span className="text-[10px] text-[#94A3B8] font-mono">
                                            ({src.domain})
                                          </span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-[#94A3B8] shrink-0 group-hover:text-red-300" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Fallback for participating models without synthesized jury array
            consensus.participatingModels.map((pm) => (
              <div
                key={pm.modelId}
                className="p-3.5 flex items-center justify-between text-xs text-[#F8F9FA]"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#E2C15C]" />
                  <span>{pm.displayName}</span>
                </div>
                <span className="font-mono text-emerald-400">PARTICIPATING</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Claim-by-Claim Forensic Details Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowClaimBreakdown(!showClaimBreakdown)}
          className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8F9FA] flex items-center gap-1.5 transition-colors"
        >
          {showClaimBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{showClaimBreakdown ? "Hide" : "Show"} Claim-by-Claim Consensus Breakdown ({consensus.claimsConsensus.length} Claims)</span>
        </button>

        {showClaimBreakdown && (
          <div className="mt-3 space-y-3 animate-in fade-in duration-200">
            {consensus.claimsConsensus.map((claimDetail) => {
              const cStatus = STATUS_CONFIG[claimDetail.status] || STATUS_CONFIG.SINGLE_MODEL;
              const vColor = VERDICT_COLORS[claimDetail.consensusVerdict] || VERDICT_COLORS.UNVERIFIED;

              return (
                <div
                  key={claimDetail.claimId}
                  className="bg-[#08090C] border border-stone-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#E2C15C] font-semibold">
                      Claim {claimDetail.claimId}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${vColor.bg} ${vColor.text} ${vColor.border}`}>
                        {claimDetail.consensusVerdict}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cStatus.bg} ${cStatus.text} ${cStatus.border}`}>
                        {claimDetail.agreementCount}/{claimDetail.totalEvaluations} Agree
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#F8F9FA] font-medium leading-snug">
                    &quot;{claimDetail.claimText}&quot;
                  </p>

                  {/* Individual Model Cards for this claim */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {claimDetail.evaluations.map((ev) => {
                      const evColor = VERDICT_COLORS[ev.verdict] || VERDICT_COLORS.UNVERIFIED;

                      return (
                        <div
                          key={`${claimDetail.claimId}-${ev.modelId}`}
                          className="bg-[#0D1017] border border-stone-800/80 rounded-lg p-3 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#F8F9FA]">
                              {ev.modelDisplayName}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${evColor.bg} ${evColor.text} ${evColor.border}`}>
                              {ev.verdict} • {ev.confidence}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                            {ev.reasoning}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
