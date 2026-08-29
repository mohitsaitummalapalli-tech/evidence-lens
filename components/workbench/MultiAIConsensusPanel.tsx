"use client";

import React, { useState } from "react";
import {
  MultiAIConsensusResult,
  EvidenceRetrievalResult,
  ModelJuryVerdict,
} from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  Cpu,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileCheck2,
  Lock,
} from "lucide-react";

interface MultiAIConsensusPanelProps {
  consensus: MultiAIConsensusResult;
  evidence?: EvidenceRetrievalResult | null;
}

const PROVIDER_METADATA: Record<
  string,
  { name: string; org: string; modelName: string }
> = {
  google: {
    name: "Gemini 2.5 Flash",
    org: "Google DeepMind",
    modelName: "gemini-2.5-flash",
  },
  openai: {
    name: "GPT-4o Reasoning",
    org: "OpenAI",
    modelName: "gpt-4o",
  },
  anthropic: {
    name: "Claude 3.7 Sonnet",
    org: "Anthropic",
    modelName: "claude-3-7-sonnet",
  },
  groq: {
    name: "Llama 3.3 70B",
    org: "Groq",
    modelName: "llama-3.3-70b-versatile",
  },
  local: {
    name: "EvidenceLens Engine",
    org: "On-Premises / Deterministic",
    modelName: "deterministic-synthesis",
  },
};

const VERDICT_THEMES: Record<
  string,
  {
    label: string;
    badgeBg: string;
    icon: React.ComponentType<{ className?: string }>;
    barColor: string;
  }
> = {
  VERIFIED: {
    label: "VERIFIED TRUE",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
    icon: ShieldCheck,
    barColor: "bg-emerald-500",
  },
  TRUE: {
    label: "VERIFIED TRUE",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
    icon: ShieldCheck,
    barColor: "bg-emerald-500",
  },
  FALSE: {
    label: "REFUTED FALSE",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-700/50",
    icon: ShieldX,
    barColor: "bg-rose-500",
  },
  MIXED: {
    label: "MIXED EVIDENCE",
    badgeBg: "bg-amber-950/40 text-amber-300 border-amber-700/50",
    icon: ShieldAlert,
    barColor: "bg-amber-500",
  },
  UNVERIFIED: {
    label: "UNVERIFIED / INSUFFICIENT",
    badgeBg: "bg-[#131519] text-[#D7DADF] border-[rgba(212,175,90,0.3)]",
    icon: HelpCircle,
    barColor: "bg-[#8D949D]",
  },
};

export const MultiAIConsensusPanel: React.FC<MultiAIConsensusPanelProps> = ({
  consensus,
  evidence,
}) => {
  const [showSharedEvidence, setShowSharedEvidence] = useState(false);

  const majorityVerdictKey = consensus.majorityVerdict || "UNVERIFIED";
  const juryVerdictTheme =
    VERDICT_THEMES[majorityVerdictKey] || VERDICT_THEMES.UNVERIFIED;
  const JuryIcon = juryVerdictTheme.icon;

  const totalModels = consensus.totalModelsParticipating || consensus.participatingModels?.length || 0;
  const agreementRate = consensus.overallAgreementRate || 0;
  const evidenceList = evidence?.allSources || [];
  const modelVerdicts = consensus.modelVerdicts || [];

  return (
    <div
      id="multi-ai-consensus-panel"
      className="p-5 sm:p-6 space-y-6 font-mono border-t border-[rgba(212,175,90,0.35)]"
    >
      {/* Header & Shared Evidence Grounding Protocol Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                AI Evidence Jury & Consensus
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                SHARED EVIDENCE PROTOCOL
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Independent evaluation across multiple frontier models grounded on the exact same retrieved evidence
            </p>
          </div>
        </div>

        {/* Action to Inspect Shared Evidence Bundle */}
        <button
          type="button"
          onClick={() => setShowSharedEvidence(!showSharedEvidence)}
          className="px-3 py-1.5 rounded-lg bg-[#050607] hover:bg-[#131519] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] text-xs flex items-center gap-1.5 transition-all self-start md:self-auto font-semibold"
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Shared Evidence ({evidenceList.length})</span>
          {showSharedEvidence ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Shared Evidence Inspection Dossier */}
      {showSharedEvidence && (
        <div className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.3)] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(212,175,90,0.2)] text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span className="font-bold text-[#F5F7FA]">GROUNDED JURY EVIDENCE DOSSIER</span>
            </div>
            <span className="text-[#8D949D] text-[10px]">
              Every juror evaluated identical data: {evidenceList.length} sources
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {evidenceList.map((src) => (
              <div
                key={src.id}
                className="p-2.5 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.2)] text-xs flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5 truncate">
                  <span className="font-bold text-[#F5F7FA] block truncate">{src.domain}</span>
                  <p className="text-[11px] text-[#D7DADF] truncate font-sans">{src.title}</p>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#D4AF5A] hover:text-white shrink-0"
                    title="Open Source"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Central Jury Verdict & Consensus Scoreboard */}
      <div className="p-5 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.35)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <JuryIcon className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#D4AF5A] uppercase tracking-wider font-bold">
                Jury Verdict
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${juryVerdictTheme.badgeBg}`}>
                {majorityVerdictKey}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
              {majorityVerdictKey === "VERIFIED"
                ? "Grounded Evidence Validated"
                : majorityVerdictKey === "FALSE"
                ? "Assertion Contradicted by Evidence"
                : majorityVerdictKey === "MIXED"
                ? "Conflicting Evidence Identified"
                : "Insufficient Evidence"}
            </h3>

            <p className="text-xs text-[#D7DADF] font-sans">
              Agreement status: <strong className="text-[#D4AF5A] uppercase">{consensus.overallConsensusStatus}</strong> ({consensus.agreementCount ?? totalModels} of {totalModels} models agree)
            </p>
          </div>
        </div>

        {/* Agreement Rate Meter */}
        <div className="p-3.5 rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] space-y-2 min-w-[200px] shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8D949D]">Consensus Rate:</span>
            <span className="font-bold text-[#F5F7FA]">{agreementRate}%</span>
          </div>

          <div className="w-full bg-[#131519] rounded-full h-2 overflow-hidden border border-[rgba(212,175,90,0.2)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C8A24A] via-[#E1C16E] to-[#D4AF5A]"
              style={{ width: `${agreementRate}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-[#8D949D]">
            <span>Split (0%)</span>
            <span>Unanimous (100%)</span>
          </div>
        </div>
      </div>

      {/* Model Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelVerdicts.length > 0
          ? modelVerdicts.map((mv: ModelJuryVerdict) => {
              const meta = PROVIDER_METADATA[mv.provider] || {
                name: mv.modelDisplayName || mv.provider,
                org: "AI Provider",
                modelName: mv.modelId,
              };

              const eTheme = VERDICT_THEMES[mv.overallVerdict] || VERDICT_THEMES.UNVERIFIED;
              const EIcon = eTheme.icon;

              return (
                <div
                  key={mv.provider}
                  className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Model Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(212,175,90,0.18)]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Cpu className="h-3.5 w-3.5 text-[#D4AF5A]" />
                          <h4 className="font-bold text-xs text-[#F5F7FA]">
                            {meta.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#8D949D] font-sans">
                          {meta.org}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${eTheme.badgeBg}`}
                      >
                        <EIcon className="h-3 w-3" />
                        {mv.overallVerdict}
                      </span>
                    </div>

                    {/* Quantitative Score */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8D949D]">Confidence Level:</span>
                      <strong className="text-[#D4AF5A]">{mv.overallConfidence} ({mv.quantitativeScore}%)</strong>
                    </div>

                    {/* Claims Evaluated Breakdown */}
                    {mv.claimVerdicts && mv.claimVerdicts.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-[#8D949D] uppercase block">
                          Claims Evaluated ({mv.claimVerdicts.length}):
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {mv.claimVerdicts.map((cv) => (
                            <div key={cv.claimId} className="p-2 rounded bg-[#0D0F12] text-[11px] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#D4AF5A]">{cv.claimId}</span>
                                <span className="text-[10px] text-[#F5F7FA] font-semibold">{cv.verdict}</span>
                              </div>
                              {cv.reasoning && (
                                <p className="text-[#D7DADF] font-sans text-[10px] line-clamp-2">
                                  {cv.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valid Evidence References Count */}
                  <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between text-[10px] text-[#8D949D]">
                    <span>Valid Citations: {mv.validEvidenceReferencesCount}</span>
                    <span className="text-[#D4AF5A]">Grounded</span>
                  </div>
                </div>
              );
            })
          : consensus.participatingModels?.map((pm) => (
              <div
                key={pm.modelId}
                className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#D4AF5A]" />
                  <h4 className="font-bold text-xs text-[#F5F7FA]">{pm.displayName}</h4>
                </div>
                <span className="text-[10px] text-emerald-400">Juror Active</span>
              </div>
            ))}
      </div>
    </div>
  );
};
