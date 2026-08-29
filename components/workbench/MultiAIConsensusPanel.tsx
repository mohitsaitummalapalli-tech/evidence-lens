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
    label: "UNANIMOUS CONSENSUS",
    bg: "bg-emerald-950/30",
    text: "text-emerald-300",
    border: "border-emerald-700/40",
    icon: ShieldCheck,
  },
  MAJORITY: {
    label: "MAJORITY VERDICT",
    bg: "bg-[#161B21]",
    text: "text-[#D9DEE5]",
    border: "border-[#343B45]",
    icon: ShieldCheck,
  },
  SPLIT: {
    label: "SPLIT DECISION",
    bg: "bg-amber-950/30",
    text: "text-amber-300",
    border: "border-amber-700/40",
    icon: ShieldAlert,
  },
  SINGLE_MODEL: {
    label: "SINGLE MODEL",
    bg: "bg-[#161B21]",
    text: "text-[#A7AFB8]",
    border: "border-[#2A3038]",
    icon: Cpu,
  },
  INSUFFICIENT: {
    label: "INSUFFICIENT DATA",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
  NO_CONSENSUS: {
    label: "NO CONSENSUS",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
};

const VERDICT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VERIFIED: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-800/50" },
  TRUE: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-800/50" },
  FALSE: { bg: "bg-rose-950/40", text: "text-rose-400", border: "border-rose-800/50" },
  MIXED: { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-800/50" },
  UNVERIFIED: { bg: "bg-[#161B21]", text: "text-[#707984]", border: "border-[#2A3038]" },
};

export const MultiAIConsensusPanel: React.FC<MultiAIConsensusPanelProps> = ({ consensus, evidence }) => {
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);

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
      className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2A3038] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
                AI Evidence Jury
              </h3>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase border flex items-center gap-1 ${overallStatus.bg} ${overallStatus.text} ${overallStatus.border}`}
              >
                <StatusIcon className="h-3 w-3" />
                {overallStatus.label}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] mt-0.5 font-sans">
              {agreeCount} of {totalModels} models agree • All models evaluate the exact same shared evidence dataset.
            </p>
          </div>
        </div>

        {/* Final Jury Verdict Callout */}
        <div className="flex items-center gap-3 bg-[#080A0D] border border-[#2A3038] px-3.5 py-2 rounded-lg font-mono">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#707984] block">
              Majority Verdict
            </span>
            <span className="text-xs font-bold text-[#F3F5F7]">
              {majorityVerdict}
            </span>
          </div>
          <div className="h-5 w-px bg-[#2A3038]" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-semibold text-[#707984] block">
              Confidence
            </span>
            <span className="text-xs font-semibold text-[#D9DEE5]">
              {majorityConfidence}
            </span>
          </div>
        </div>
      </div>

      {/* Shared Evidence Grounding Notice */}
      <div className="bg-[#080A0D] border border-[#2A3038] rounded-lg p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#D9DEE5]" />
            <span className="text-xs font-mono font-semibold text-[#F3F5F7] tracking-wide uppercase">
              Shared Evidence Bundle
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-[#A7AFB8]">
            {agreeCount} / {totalModels} models agree ({consensus.overallAgreementRate}% consensus)
          </span>
        </div>

        <p className="text-xs text-[#A7AFB8] font-sans">
          {sharedSummary.sharedNotice || `All models evaluated the exact same ${sharedSummary.totalSources} retrieved sources.`}
        </p>

        {/* Evidence Counts Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono">
          <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 text-center">
            <span className="text-[10px] text-[#707984] block uppercase">Total Sources</span>
            <span className="text-xs font-bold text-[#F3F5F7]">{sharedSummary.totalSources}</span>
          </div>
          <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 text-center flex items-center justify-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
            <div>
              <span className="text-[10px] text-[#707984] block uppercase">Web</span>
              <span className="text-xs font-bold text-[#F3F5F7]">{sharedSummary.webSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 text-center flex items-center justify-center gap-2">
            <Play className="h-3.5 w-3.5 text-rose-400 fill-current shrink-0" />
            <div>
              <span className="text-[10px] text-[#707984] block uppercase">YouTube</span>
              <span className="text-xs font-bold text-[#F3F5F7]">{sharedSummary.youtubeSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 text-center flex items-center justify-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 text-[#5DADE2] shrink-0" />
            <div>
              <span className="text-[10px] text-[#707984] block uppercase">Academic</span>
              <span className="text-xs font-bold text-[#F3F5F7]">{sharedSummary.academicSourcesCount}</span>
            </div>
          </div>
          <div className="bg-[#11151A] border border-[#2A3038] rounded p-2.5 text-center">
            <span className="text-[10px] text-[#707984] block uppercase">Domains</span>
            <span className="text-xs font-bold text-[#F3F5F7]">{sharedSummary.uniqueDomainsCount}</span>
          </div>
        </div>
      </div>

      {/* Disagreement Callout (if any) */}
      {consensus.disagreementSummary && consensus.overallConsensusStatus !== "UNANIMOUS" && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3.5 flex items-center gap-3 text-xs text-amber-200 font-mono">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{consensus.disagreementSummary}</span>
        </div>
      )}

      {/* Model Scoreboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#2A3038]">
          <h4 className="text-xs font-mono font-bold text-[#F3F5F7] uppercase tracking-wider">
            Model Verdict Scoreboard
          </h4>
          <span className="text-[11px] font-mono text-[#707984]">
            Click a model to inspect evidence citations
          </span>
        </div>

        <div className="border border-[#2A3038] rounded-lg overflow-hidden divide-y divide-[#2A3038] bg-[#080A0D]">
          {modelVerdicts.length > 0 ? (
            modelVerdicts.map((mv) => {
              const isExpanded = expandedModelId === mv.modelId;
              const vColor = VERDICT_COLORS[mv.overallVerdict] || VERDICT_COLORS.UNVERIFIED;

              return (
                <div key={mv.modelId} className="transition-colors hover:bg-[#161B21]/50">
                  {/* Row Summary */}
                  <div
                    onClick={() => toggleModelExpand(mv.modelId)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#F3F5F7]">
                            {mv.modelDisplayName}
                          </span>
                          <span className="text-[10px] font-mono text-[#707984] bg-[#161B21] px-2 py-0.5 rounded border border-[#2A3038]">
                            {mv.modelId}
                          </span>
                        </div>
                        <span className="text-xs text-[#707984] font-mono block mt-0.5">
                          {mv.validEvidenceReferencesCount} grounded citations evaluated
                        </span>
                      </div>
                    </div>

                    {/* Right Metrics */}
                    <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded border ${vColor.bg} ${vColor.text} ${vColor.border}`}
                      >
                        {mv.overallVerdict}
                      </span>
                      <span className="text-xs font-medium text-[#A7AFB8] bg-[#161B21] px-2.5 py-1 rounded border border-[#2A3038]">
                        {mv.overallConfidence} ({mv.quantitativeScore}%)
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#707984]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#707984]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="p-4 bg-[#11151A] border-t border-[#2A3038] space-y-4">
                      {/* Claim Evaluations by this model */}
                      <div className="space-y-3">
                        <span className="text-xs font-mono font-semibold text-[#D9DEE5] uppercase block">
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
                              className="p-3.5 bg-[#080A0D] border border-[#2A3038] rounded-lg space-y-3 font-sans"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-[#707984]">
                                  Claim ID: {cv.claimId}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${cvColor.bg} ${cvColor.text} ${cvColor.border}`}
                                >
                                  {cv.verdict} • {cv.confidence}
                                </span>
                              </div>

                              <p className="text-xs text-[#A7AFB8] leading-relaxed">
                                {cv.reasoning}
                              </p>

                              {/* Supporting Evidence Citations */}
                              {supportingSources.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-mono font-semibold text-emerald-400 block">
                                    Supporting Evidence Citations ({supportingSources.length}):
                                  </span>
                                  <div className="space-y-1">
                                    {supportingSources.map((src) => (
                                      <a
                                        key={src.id}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded bg-[#161B21] border border-[#2A3038] hover:border-[#D9DEE5] text-xs text-[#F3F5F7] group transition-all"
                                      >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          {src.sourceType === "youtube" ? (
                                            <Play className="h-3.5 w-3.5 text-rose-400 fill-current shrink-0" />
                                          ) : (
                                            <Globe className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                                          )}
                                          <span className="truncate group-hover:text-white">
                                            {src.title}
                                          </span>
                                          <span className="text-[10px] text-[#707984] font-mono">
                                            ({src.domain})
                                          </span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-[#707984] shrink-0 group-hover:text-white" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Contradicting Evidence Citations */}
                              {contradictingSources.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[11px] font-mono font-semibold text-rose-400 block">
                                    Contradicting Evidence Citations ({contradictingSources.length}):
                                  </span>
                                  <div className="space-y-1">
                                    {contradictingSources.map((src) => (
                                      <a
                                        key={src.id}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded bg-[#161B21] border border-[#2A3038] hover:border-rose-500/40 text-xs text-[#F3F5F7] group transition-all"
                                      >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                          {src.sourceType === "youtube" ? (
                                            <Play className="h-3.5 w-3.5 text-rose-400 fill-current shrink-0" />
                                          ) : (
                                            <Globe className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                                          )}
                                          <span className="truncate group-hover:text-white">
                                            {src.title}
                                          </span>
                                          <span className="text-[10px] text-[#707984] font-mono">
                                            ({src.domain})
                                          </span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-[#707984] shrink-0 group-hover:text-white" />
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
            <div className="p-4 text-center text-xs text-[#707984] font-mono">
              No participating model evaluations recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
