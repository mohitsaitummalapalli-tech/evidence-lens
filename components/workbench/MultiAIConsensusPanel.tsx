"use client";

import React, { useState } from "react";
import {
  MultiAIConsensusResult,
  EvidenceRetrievalResult,
  ModelJuryVerdict,
} from "@/types";
import { GeminiLogo, OpenAILogo, AnthropicLogo } from "./ProviderLogos";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileCheck2,
  Lock,
  Globe,
  Video,
  Play,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";

interface MultiAIConsensusPanelProps {
  consensus: MultiAIConsensusResult;
  evidence?: EvidenceRetrievalResult | null;
}

const PROVIDER_METADATA: Record<
  string,
  { name: string; org: string; icon: React.ComponentType<{ className?: string }> }
> = {
  google: {
    name: "Google Gemini",
    org: "Gemini 2.5 Flash",
    icon: GeminiLogo,
  },
  openai: {
    name: "OpenAI GPT",
    org: "GPT-4o Mini",
    icon: OpenAILogo,
  },
  anthropic: {
    name: "Anthropic Claude",
    org: "Claude 3.5 Haiku",
    icon: AnthropicLogo,
  },
  groq: {
    name: "Groq Llama",
    org: "Llama 3.3 70B",
    icon: Users,
  },
};

const VERDICT_THEMES: Record<
  string,
  {
    label: string;
    badgeBg: string;
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  }
> = {
  VERIFIED: {
    label: "VERIFIED TRUE",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
    icon: ShieldCheck,
    text: "text-emerald-400",
  },
  TRUE: {
    label: "VERIFIED TRUE",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
    icon: ShieldCheck,
    text: "text-emerald-400",
  },
  FALSE: {
    label: "REFUTED FALSE",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-700/50",
    icon: ShieldX,
    text: "text-rose-400",
  },
  MIXED: {
    label: "MIXED EVIDENCE",
    badgeBg: "bg-amber-950/40 text-amber-300 border-amber-700/50",
    icon: ShieldAlert,
    text: "text-amber-400",
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    badgeBg: "bg-[#131519] text-[#D7DADF] border-[rgba(212,175,90,0.3)]",
    icon: HelpCircle,
    text: "text-[#8D949D]",
  },
};

export const MultiAIConsensusPanel: React.FC<MultiAIConsensusPanelProps> = ({
  consensus,
  evidence,
}) => {
  const [showSharedEvidence, setShowSharedEvidence] = useState(false);
  const [expandedEvals, setExpandedEvals] = useState<Record<string, boolean>>({});

  const toggleEval = (key: string) => {
    setExpandedEvals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const majorityVerdictKey = consensus.majorityVerdict || "UNVERIFIED";
  const juryVerdictTheme =
    VERDICT_THEMES[majorityVerdictKey] || VERDICT_THEMES.UNVERIFIED;
  const JuryIcon = juryVerdictTheme.icon;

  const totalModels =
    consensus.totalModelsParticipating || consensus.participatingModels?.length || 0;
  const agreementRate = consensus.overallAgreementRate || 0;
  const evidenceList = evidence?.allSources || [];
  const modelVerdicts = consensus.modelVerdicts || [];
  const metrics = consensus.sharedEvidenceSummary;

  // Map sources for quick citation lookup
  const sourceById = new Map(evidenceList.map((s) => [s.id, s]));

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
                AI Evidence Jury
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                MULTI-MODEL BATTLE
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Independent evaluation across frontier AI models grounded on the exact same retrieved evidence
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

      {/* SHARED EVIDENCE BREAKDOWN BAR */}
      {metrics && (
        <div className="p-3.5 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#D4AF5A] font-bold">
            <Lock className="h-3.5 w-3.5 text-[#D4AF5A]" />
            <span className="uppercase text-[11px] tracking-wider">ALL MODELS RECEIVED THE SAME EVIDENCE:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#D7DADF]">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-[#D4AF5A]" /> Web: <strong className="text-[#F5F7FA]">{metrics.webSourcesCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3 text-rose-400" /> YouTube: <strong className="text-[#F5F7FA]">{metrics.youtubeSourcesCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-sky-400" /> Academic: <strong className="text-[#F5F7FA]">{metrics.academicSourcesCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-emerald-400" /> Media: <strong className="text-[#F5F7FA]">{metrics.imageProvenanceCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              Domains: <strong className="text-[#D4AF5A]">{metrics.uniqueDomainsCount}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Shared Evidence Inspection Dossier */}
      {showSharedEvidence && (
        <div className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.3)] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(212,175,90,0.2)] text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span className="font-bold text-[#F5F7FA]">GROUNDED JURY EVIDENCE DOSSIER</span>
            </div>
            <span className="text-[#8D949D] text-[10px]">
              Every juror evaluated identical data: {evidenceList.length} sources ({metrics?.webSourcesCount || 0} Web, {metrics?.youtubeSourcesCount || 0} YouTube)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {evidenceList.map((src) => {
              const isYt = src.sourceType === "youtube" || src.domain.includes("youtube.com");
              return (
                <div
                  key={src.id}
                  className="p-2.5 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.2)] text-xs flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)] text-[#D4AF5A] font-bold">
                        {src.id}
                      </span>
                      {isYt ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950/40 border border-rose-700/50 text-rose-300 font-bold flex items-center gap-0.5">
                          <Play className="h-2 w-2 fill-rose-400 text-rose-400" /> ▶ YouTube
                        </span>
                      ) : (
                        <span className="font-bold text-[#F5F7FA] truncate">{src.domain}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#D7DADF] truncate font-sans">{src.title}</p>
                  </div>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded shrink-0 border ${
                        isYt
                          ? "bg-rose-950/30 text-rose-300 hover:text-white border-rose-700/50"
                          : "bg-[#050607] text-[#D4AF5A] hover:text-white border-[rgba(212,175,90,0.25)]"
                      }`}
                      title={isYt ? "Watch Video" : "Open Source"}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
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
                Jury Result
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
              Agreement: <strong className="text-[#D4AF5A] uppercase">{consensus.overallConsensusStatus}</strong> ({consensus.agreementCount ?? totalModels} of {totalModels} models agree)
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

      {/* Disagreement Callout (if models split/disagreed) */}
      {consensus.disagreementSummary && consensus.overallConsensusStatus !== "UNANIMOUS" && (
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{consensus.disagreementSummary}</span>
        </div>
      )}

      {/* INDIVIDUAL MODEL CARDS (Gemini • OpenAI • Claude) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelVerdicts.length > 0
          ? modelVerdicts.map((mv: ModelJuryVerdict) => {
              const meta = PROVIDER_METADATA[mv.provider] || {
                name: mv.modelDisplayName || mv.provider,
                org: mv.modelId,
                icon: Users,
              };
              const ProviderIcon = meta.icon;

              const eTheme = VERDICT_THEMES[mv.overallVerdict] || VERDICT_THEMES.UNVERIFIED;
              const EIcon = eTheme.icon;

              // Calculate source type breakdown for citations in this model
              let citedWebCount = 0;
              let citedYtCount = 0;
              let citedAcadCount = 0;

              for (const cv of mv.claimVerdicts || []) {
                const allCited = [
                  ...(cv.supportingEvidenceIds || []),
                  ...(cv.contradictingEvidenceIds || []),
                ];
                for (const cid of allCited) {
                  const s = sourceById.get(cid);
                  if (s) {
                    if (s.sourceType === "youtube" || s.domain.includes("youtube.com")) {
                      citedYtCount++;
                    } else if (s.sourceType === "academic") {
                      citedAcadCount++;
                    } else {
                      citedWebCount++;
                    }
                  }
                }
              }

              return (
                <div
                  key={mv.provider}
                  className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Model Header with Brand Logo */}
                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(212,175,90,0.18)]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A]">
                          <ProviderIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#F5F7FA]">
                            {meta.name}
                          </h4>
                          <span className="text-[10px] text-[#8D949D] font-sans">
                            {meta.org}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${eTheme.badgeBg}`}
                      >
                        <EIcon className="h-3 w-3" />
                        {mv.overallVerdict}
                      </span>
                    </div>

                    {/* Quantitative Score & Confidence */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8D949D]">Confidence:</span>
                      <strong className="text-[#D4AF5A]">{mv.overallConfidence} ({mv.quantitativeScore}%)</strong>
                    </div>

                    {/* Citations Breakdown Badge */}
                    <div className="p-2 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.15)] flex items-center justify-between text-[10px] text-[#8D949D]">
                      <span className="font-bold text-[#D7DADF] uppercase">Citations:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-[#D4AF5A]">WEB {citedWebCount}</span>
                        <span className="text-rose-400">YOUTUBE {citedYtCount}</span>
                        {citedAcadCount > 0 && <span className="text-sky-400">ACADEMIC {citedAcadCount}</span>}
                      </div>
                    </div>

                    {/* Claims Evaluated & Reasoning */}
                    {mv.claimVerdicts && mv.claimVerdicts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] text-[#8D949D] uppercase block font-bold">
                          Claim Evaluations ({mv.claimVerdicts.length}):
                        </span>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {mv.claimVerdicts.map((cv) => {
                            const cvTheme = VERDICT_THEMES[cv.verdict] || VERDICT_THEMES.UNVERIFIED;
                            const evalKey = `${mv.provider}_${cv.claimId}`;
                            const isExpanded = Boolean(expandedEvals[evalKey]);

                            const supportingIds = cv.supportingEvidenceIds || [];
                            const contradictingIds = cv.contradictingEvidenceIds || [];

                            return (
                              <div key={cv.claimId} className="p-2.5 rounded bg-[#0D0F12] text-[11px] space-y-2 border border-[rgba(212,175,90,0.15)]">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#D4AF5A]">Claim {cv.claimId}</span>
                                  <span className={`text-[10px] font-bold ${cvTheme.text}`}>
                                    {cv.verdict} ({cv.confidence})
                                  </span>
                                </div>

                                {cv.reasoning && (
                                  <p className="text-[#D7DADF] font-sans text-[11px] leading-relaxed">
                                    {cv.reasoning}
                                  </p>
                                )}

                                {/* Citations Section with Expand/Collapse toggle */}
                                <div className="pt-1.5 border-t border-[rgba(212,175,90,0.1)] space-y-1.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleEval(evalKey)}
                                    className="w-full flex items-center justify-between text-[10px] text-[#8D949D] hover:text-[#D4AF5A] font-bold"
                                  >
                                    <span>
                                      CITATIONS ({supportingIds.length + contradictingIds.length})
                                    </span>
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>

                                  {isExpanded ? (
                                    <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                                      {/* SUPPORTING EVIDENCE */}
                                      {supportingIds.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-emerald-400 uppercase font-bold block">
                                            Supporting Evidence ({supportingIds.length}):
                                          </span>
                                          <div className="space-y-1">
                                            {supportingIds.map((cid) => {
                                              const src = sourceById.get(cid);
                                              const isYt = src?.sourceType === "youtube" || src?.domain?.includes("youtube.com");
                                              return (
                                                <div
                                                  key={cid}
                                                  className="p-1.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center justify-between gap-1.5 text-[10px]"
                                                >
                                                  <div className="truncate flex items-center gap-1.5">
                                                    {isYt ? (
                                                      <span className="text-rose-400 font-bold flex items-center gap-0.5 shrink-0">
                                                        <Play className="h-2.5 w-2.5 fill-rose-400" /> ▶ YouTube
                                                      </span>
                                                    ) : (
                                                      <span className="text-[#D4AF5A] font-bold shrink-0">🌐 Web</span>
                                                    )}
                                                    <span className="text-[#D7DADF] truncate font-sans">
                                                      {src?.title || cid}
                                                    </span>
                                                  </div>
                                                  {src?.url && (
                                                    <a
                                                      href={src.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 flex items-center gap-0.5 ${
                                                        isYt
                                                          ? "bg-rose-950/40 text-rose-300 hover:text-white border-rose-700/50"
                                                          : "bg-[#131519] text-[#D4AF5A] hover:text-white border-[rgba(212,175,90,0.3)]"
                                                      }`}
                                                    >
                                                      <span>{isYt ? "Watch Video" : "Open Source"}</span>
                                                      <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* CONTRADICTING EVIDENCE */}
                                      {contradictingIds.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-rose-400 uppercase font-bold block">
                                            Contradicting Evidence ({contradictingIds.length}):
                                          </span>
                                          <div className="space-y-1">
                                            {contradictingIds.map((cid) => {
                                              const src = sourceById.get(cid);
                                              const isYt = src?.sourceType === "youtube" || src?.domain?.includes("youtube.com");
                                              return (
                                                <div
                                                  key={cid}
                                                  className="p-1.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center justify-between gap-1.5 text-[10px]"
                                                >
                                                  <div className="truncate flex items-center gap-1.5">
                                                    {isYt ? (
                                                      <span className="text-rose-400 font-bold flex items-center gap-0.5 shrink-0">
                                                        <Play className="h-2.5 w-2.5 fill-rose-400" /> ▶ YouTube
                                                      </span>
                                                    ) : (
                                                      <span className="text-[#D4AF5A] font-bold shrink-0">🌐 Web</span>
                                                    )}
                                                    <span className="text-[#D7DADF] truncate font-sans">
                                                      {src?.title || cid}
                                                    </span>
                                                  </div>
                                                  {src?.url && (
                                                    <a
                                                      href={src.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 flex items-center gap-0.5 ${
                                                        isYt
                                                          ? "bg-rose-950/40 text-rose-300 hover:text-white border-rose-700/50"
                                                          : "bg-[#131519] text-[#D4AF5A] hover:text-white border-[rgba(212,175,90,0.3)]"
                                                      }`}
                                                    >
                                                      <span>{isYt ? "Watch Video" : "Open Source"}</span>
                                                      <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Collapsed Quick Badges */
                                    <div className="flex flex-wrap gap-1">
                                      {[...supportingIds, ...contradictingIds].map((cid) => {
                                        const src = sourceById.get(cid);
                                        const isYt = src?.sourceType === "youtube" || src?.domain?.includes("youtube.com");
                                        return (
                                          <a
                                            key={cid}
                                            href={src?.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`px-1.5 py-0.5 rounded border text-[10px] inline-flex items-center gap-1 ${
                                              isYt
                                                ? "bg-rose-950/30 text-rose-300 hover:text-white border-rose-700/50"
                                                : "bg-[#050607] hover:bg-[#131519] text-[#D4AF5A] hover:text-[#F5F7FA] border-[rgba(212,175,90,0.25)]"
                                            }`}
                                            title={src?.title || cid}
                                          >
                                            {isYt && <Play className="h-2 w-2 fill-rose-400 text-rose-400" />}
                                            <span>{cid}</span>
                                            {src?.domain && <span className="text-[#8D949D]">({src.domain})</span>}
                                            <ExternalLink className="h-2.5 w-2.5" />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valid Evidence References Count Footer */}
                  <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between text-[10px] text-[#8D949D]">
                    <span>Valid Citations: <strong className="text-[#F5F7FA]">{mv.validEvidenceReferencesCount}</strong></span>
                    <span className="text-[#D4AF5A] font-semibold">Grounded</span>
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
                  <Users className="h-4 w-4 text-[#D4AF5A]" />
                  <h4 className="font-bold text-xs text-[#F5F7FA]">{pm.displayName}</h4>
                </div>
                <span className="text-[10px] text-emerald-400">Juror Active</span>
              </div>
            ))}
      </div>
    </div>
  );
};
