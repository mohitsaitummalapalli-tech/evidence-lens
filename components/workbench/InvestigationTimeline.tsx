"use client";

import React, { useState, useMemo } from "react";
import {
  InvestigationInputResponse,
  InvestigationUIState,
} from "@/types";
import {
  CheckCircle2,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Split,
  Globe,
  Link2,
  Image as ImageIcon,
  Scale,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Ban,
} from "lucide-react";

interface InvestigationTimelineProps {
  uiState: InvestigationUIState;
  apiResponse: InvestigationInputResponse | null;
  claimText?: string;
  hasMedia?: boolean;
  onInspectClaim?: (claimId: string) => void;
  onViewInGraph?: (claimId: string) => void;
}

export type TimelineStageStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "SKIPPED";

interface TimelineStageDef {
  id: string;
  number: number;
  label: string;
  subtitle: string;
  targetAnchorId?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_STAGES: TimelineStageDef[] = [
  {
    id: "input_received",
    number: 1,
    label: "INPUT RECEIVED",
    subtitle: "Ingestion and validation of target assertion & multimodal payload",
    targetAnchorId: "claim-input-section",
    icon: FileText,
  },
  {
    id: "claims_decomposed",
    number: 2,
    label: "CLAIMS DECOMPOSED",
    subtitle: "AI semantic deconstruction into verifiable atomic claim units",
    targetAnchorId: "claim-extraction-panel",
    icon: Split,
  },
  {
    id: "evidence_retrieved",
    number: 3,
    label: "WEB EVIDENCE RETRIEVED",
    subtitle: "Multi-source web search & authoritative source extraction",
    targetAnchorId: "evidence-panel",
    icon: Globe,
  },
  {
    id: "evidence_linked",
    number: 4,
    label: "EVIDENCE LINKED",
    subtitle: "Relational mapping between atomic claims and primary citations",
    targetAnchorId: "evidence-panel",
    icon: Link2,
  },
  {
    id: "image_provenance",
    number: 5,
    label: "IMAGE PROVENANCE SEARCH",
    subtitle: "Reverse multimodal candidate discovery & web provenance verification",
    targetAnchorId: "image-provenance-panel",
    icon: ImageIcon,
  },
  {
    id: "stance_analysis",
    number: 6,
    label: "STANCE ANALYSIS",
    subtitle: "Per-claim evidence stance classification (SUPPORTS / CONTRADICTS)",
    targetAnchorId: "verification-result-panel",
    icon: Scale,
  },
  {
    id: "verdict_synthesis",
    number: 7,
    label: "VERDICT SYNTHESIS",
    subtitle: "Deterministic synthesis & calibrated confidence assessment",
    targetAnchorId: "verification-result-panel",
    icon: ShieldCheck,
  },
  {
    id: "investigation_complete",
    number: 8,
    label: "INVESTIGATION COMPLETE",
    subtitle: "Full forensic dossier synthesized and ready for inspector audit",
    targetAnchorId: "evidence-graph-panel",
    icon: Sparkles,
  },
];

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  uiState,
  apiResponse,
  claimText,
  hasMedia,
  onInspectClaim,
}) => {
  const [userExpandedOverrides, setUserExpandedOverrides] = useState<Record<string, boolean>>({});
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState<number | null>(null);

  const isSubmitting = uiState === "SUBMITTING";
  const isComplete = uiState === "INPUT_RECEIVED" && Boolean(apiResponse);

  const startReplay = () => {
    setIsReplaying(true);
    setReplayStep(0);

    const totalSteps = TIMELINE_STAGES.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < totalSteps) {
        setReplayStep(current);
      } else {
        setIsReplaying(false);
        setReplayStep(null);
        clearInterval(interval);
      }
    }, 450);
  };

  const toggleStage = (id: string) => {
    setUserExpandedOverrides((prev) => {
      const currentlyExpanded = prev[id] ?? (isComplete || id === "input_received" || id === "verdict_synthesis");
      return { ...prev, [id]: !currentlyExpanded };
    });
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    TIMELINE_STAGES.forEach((s) => (allExpanded[s.id] = true));
    setUserExpandedOverrides(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    TIMELINE_STAGES.forEach((s) => (allCollapsed[s.id] = false));
    setUserExpandedOverrides(allCollapsed);
  };

  const scrollToAnchor = (anchorId?: string) => {
    if (!anchorId) return;
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Compute stage statuses based on grounded data
  const stageStatuses: Record<string, TimelineStageStatus> = useMemo(() => {
    const hasProvenance = Boolean(hasMedia || apiResponse?.imageProvenance);

    if (isReplaying && replayStep !== null) {
      const statuses: Record<string, TimelineStageStatus> = {};
      TIMELINE_STAGES.forEach((stage, idx) => {
        if (stage.id === "image_provenance" && !hasProvenance) {
          statuses[stage.id] = "SKIPPED";
        } else if (idx < replayStep) {
          statuses[stage.id] = "COMPLETED";
        } else if (idx === replayStep) {
          statuses[stage.id] = "ACTIVE";
        } else {
          statuses[stage.id] = "PENDING";
        }
      });
      return statuses;
    }

    if (isSubmitting) {
      return {
        input_received: "COMPLETED",
        claims_decomposed: "ACTIVE",
        evidence_retrieved: "ACTIVE",
        evidence_linked: "PENDING",
        image_provenance: hasProvenance ? "PENDING" : "SKIPPED",
        stance_analysis: "PENDING",
        verdict_synthesis: "PENDING",
        investigation_complete: "PENDING",
      };
    }

    if (isComplete && apiResponse) {
      return {
        input_received: "COMPLETED",
        claims_decomposed: apiResponse.extraction ? "COMPLETED" : "SKIPPED",
        evidence_retrieved: apiResponse.evidence ? "COMPLETED" : "SKIPPED",
        evidence_linked: apiResponse.evidence ? "COMPLETED" : "SKIPPED",
        image_provenance: apiResponse.imageProvenance
          ? "COMPLETED"
          : hasProvenance
          ? "COMPLETED"
          : "SKIPPED",
        stance_analysis: apiResponse.verification ? "COMPLETED" : "SKIPPED",
        verdict_synthesis: apiResponse.verification ? "COMPLETED" : "SKIPPED",
        investigation_complete: "COMPLETED",
      };
    }

    // IDLE or READY
    return {
      input_received: claimText && claimText.trim().length >= 5 ? "COMPLETED" : "PENDING",
      claims_decomposed: "PENDING",
      evidence_retrieved: "PENDING",
      evidence_linked: "PENDING",
      image_provenance: hasProvenance ? "PENDING" : "SKIPPED",
      stance_analysis: "PENDING",
      verdict_synthesis: "PENDING",
      investigation_complete: "PENDING",
    };
  }, [isReplaying, replayStep, isSubmitting, isComplete, apiResponse, claimText, hasMedia]);

  // Derive unique domains from actual retrieved evidence
  const uniqueDomains = useMemo(() => {
    if (!apiResponse?.evidence?.allSources) return [];
    const domains = new Set<string>();
    apiResponse.evidence.allSources.forEach((s) => {
      if (s.domain) domains.add(s.domain);
    });
    return Array.from(domains);
  }, [apiResponse]);

  // Stance tallies from verification breakdown
  const stanceTallies = useMemo(() => {
    if (!apiResponse?.verification?.claimVerifications) {
      return { supports: 0, contradicts: 0, other: 0 };
    }
    let supports = 0;
    let contradicts = 0;
    let other = 0;

    apiResponse.verification.claimVerifications.forEach((c) => {
      supports += c.supportingEvidenceIds?.length || 0;
      contradicts += c.contradictingEvidenceIds?.length || 0;
    });

    const totalSources = apiResponse.evidence?.totalSourcesFound || 0;
    other = Math.max(0, totalSources - supports - contradicts);

    return { supports, contradicts, other };
  }, [apiResponse]);

  return (
    <div
      id="investigation-timeline-panel"
      className="bg-[#0D1017]/95 border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl shadow-black/80 space-y-6 animate-in fade-in duration-300 relative overflow-hidden"
    >
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#D4AF37]/05 to-transparent pointer-events-none blur-2xl" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#D4AF37]/20 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37] shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-[#F8F9FA] font-mono tracking-wide">
                FORENSIC INVESTIGATION TIMELINE
              </h3>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold tracking-wider uppercase ${
                  isSubmitting
                    ? "bg-[#D4AF37]/15 text-[#E2C15C] border-[#D4AF37]/40 animate-pulse"
                    : isComplete
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                    : "bg-[#131720] text-[#94A3B8] border-stone-800"
                }`}
              >
                {isSubmitting
                  ? "ACTIVE INVESTIGATION"
                  : isComplete
                  ? "LIFECYCLE RESOLVED"
                  : "DORMANT PIPELINE"}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Deterministic end-to-end audit trace from input ingestion to multi-source evidence grounding
            </p>
          </div>
        </div>

        {/* Timeline Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isComplete && (
            <button
              type="button"
              onClick={startReplay}
              disabled={isReplaying}
              className="px-3 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] border border-[#D4AF37]/30 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              title="Replay sequential lifecycle animation"
            >
              <RotateCcw className={`h-3 w-3 ${isReplaying ? "animate-spin" : ""}`} />
              <span>{isReplaying ? "REPLAYING..." : "REPLAY LIFECYCLE"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 text-xs font-mono flex items-center gap-1 transition-colors"
            title="Expand all stage details"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">EXPAND</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 text-xs font-mono flex items-center gap-1 transition-colors"
            title="Collapse all stage details"
          >
            <Minimize2 className="h-3 w-3" />
            <span className="hidden sm:inline">COLLAPSE</span>
          </button>
        </div>
      </div>

      {/* Main Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37]/40 before:via-[#E2C15C]/20 before:to-[#10B981]/40">
        {/* Traveling Comet Particle along active timeline */}
        {isSubmitting && (
          <div
            className="absolute left-2 sm:left-4 w-2.5 h-2.5 rounded-full bg-[#E2C15C] shadow-[0_0_10px_#D4AF37] pointer-events-none animate-bounce"
            style={{ top: "30%" }}
          />
        )}

        {TIMELINE_STAGES.map((stage) => {
          const status = stageStatuses[stage.id] || "PENDING";
          const isExpanded = userExpandedOverrides[stage.id] ?? (isComplete || stage.id === "input_received" || stage.id === "verdict_synthesis");
          const StageIcon = stage.icon;

          const isNodeActive = status === "ACTIVE";
          const isNodeCompleted = status === "COMPLETED";
          const isNodeSkipped = status === "SKIPPED";

          return (
            <div key={stage.id} className="relative group">
              {/* Node Indicator Icon on Spine */}
              <div
                className={`absolute -left-6 sm:-left-10 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                  isNodeCompleted
                    ? "bg-[#0D1017] border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                    : isNodeActive
                    ? "bg-[#0D1017] border-[#D4AF37] text-[#E2C15C] shadow-[0_0_14px_rgba(212,175,55,0.45)] animate-pulse"
                    : isNodeSkipped
                    ? "bg-[#08090C] border-stone-800 text-stone-600"
                    : "bg-[#08090C] border-stone-800 text-stone-600"
                }`}
              >
                {isNodeCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : isNodeActive ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-[#E2C15C]" />
                ) : isNodeSkipped ? (
                  <Ban className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-stone-600" />
                ) : (
                  <span className="text-[10px] font-mono text-stone-500 font-bold">
                    {stage.number}
                  </span>
                )}
              </div>

              {/* Stage Card Header */}
              <div
                onClick={() => toggleStage(stage.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  isNodeCompleted
                    ? "bg-[#0D1017]/80 hover:bg-[#131720] border-emerald-900/30 hover:border-[#D4AF37]/40 shadow-md"
                    : isNodeActive
                    ? "bg-[#131720] border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    : isNodeSkipped
                    ? "bg-[#08090C]/50 border-stone-900 opacity-60"
                    : "bg-[#08090C]/70 hover:bg-[#0D1017] border-stone-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      isNodeCompleted
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                        : isNodeActive
                        ? "bg-[#131720] border-[#D4AF37]/40 text-[#E2C15C]"
                        : "bg-[#131720] border-stone-800 text-stone-500"
                    }`}
                  >
                    <StageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs sm:text-sm font-bold font-mono tracking-wide ${
                          isNodeCompleted
                            ? "text-[#F8F9FA]"
                            : isNodeActive
                            ? "text-[#E2C15C]"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {stage.number}. {stage.label}
                      </h4>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isNodeCompleted
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            : isNodeActive
                            ? "bg-[#D4AF37]/20 text-[#E2C15C] border border-[#D4AF37]/40 animate-pulse"
                            : isNodeSkipped
                            ? "bg-stone-900 text-stone-500 border border-stone-800"
                            : "bg-[#131720] text-stone-500 border border-stone-800"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] font-sans mt-0.5 hidden sm:block">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {stage.targetAnchorId && isNodeCompleted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToAnchor(stage.targetAnchorId);
                      }}
                      className="p-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] border border-[#D4AF37]/30 text-[11px] font-mono hidden md:flex items-center gap-1 transition-colors"
                      title="Jump to corresponding workbench section"
                    >
                      <span>VIEW SECTION</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  <div className="p-1 text-stone-400 group-hover:text-stone-200 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Stage Collapsible Content Body */}
              {isExpanded && (
                <div className="mt-2 ml-2 sm:ml-4 p-4 rounded-xl bg-[#08090C] border border-[#D4AF37]/15 space-y-3 text-xs font-sans animate-in slide-in-from-top-2 duration-200 shadow-inner">
                  {/* STAGE 1: INPUT RECEIVED */}
                  {stage.id === "input_received" && (
                    <div className="space-y-2">
                      <div className="text-[#94A3B8]">
                        <span className="font-mono text-[#E2C15C] font-semibold">Target Claim: </span>
                        <span className="text-[#F8F9FA]">
                          {claimText?.trim() || apiResponse?.input.claim || "No claim provided yet"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-[#94A3B8] pt-1">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                          Media:{" "}
                          <strong className="text-[#E2C15C]">
                            {hasMedia || apiResponse?.input.mediaReceived
                              ? `Uploaded (${apiResponse?.input.media?.filename || "attached"})`
                              : "Text-only claim"}
                          </strong>
                        </span>
                        {apiResponse?.input.contextUrl && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                            Context: <span className="text-stone-300">{apiResponse.input.contextUrl}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STAGE 2: CLAIMS DECOMPOSED */}
                  {stage.id === "claims_decomposed" && (
                    <div className="space-y-2">
                      {apiResponse?.extraction ? (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#94A3B8]">
                              Deconstructed into{" "}
                              <strong className="text-[#E2C15C]">
                                {apiResponse.extraction.claims.length}
                              </strong>{" "}
                              atomic verifiable assertions:
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5 pt-1">
                            {apiResponse.extraction.claims.map((claim) => (
                              <div
                                key={claim.id}
                                className="flex items-start gap-2 p-2 rounded-lg bg-[#0D1017] border border-stone-800"
                              >
                                <span className="px-1.5 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/30 text-[10px] font-mono text-[#E2C15C] font-bold">
                                  {claim.id}
                                </span>
                                <span className="text-[#F8F9FA] text-xs flex-1">
                                  {claim.text}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 uppercase">
                                  {claim.category}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-stone-500 italic">
                          Awaiting claim deconstruction execution...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 3: WEB EVIDENCE RETRIEVED */}
                  {stage.id === "evidence_retrieved" && (
                    <div className="space-y-2">
                      {apiResponse?.evidence ? (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#94A3B8]">
                              Retrieved{" "}
                              <strong className="text-[#38BDF8]">
                                {apiResponse.evidence.totalSourcesFound}
                              </strong>{" "}
                              primary web citations across{" "}
                              <strong className="text-[#E2C15C]">{uniqueDomains.length}</strong> unique
                              domains
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {uniqueDomains.map((dom) => (
                              <span
                                key={dom}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#131720] border border-[#38BDF8]/30 text-[11px] font-mono text-[#38BDF8]"
                              >
                                <Globe className="h-2.5 w-2.5" />
                                {dom}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-stone-500 italic">
                          Awaiting web retrieval execution...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 4: EVIDENCE LINKED */}
                  {stage.id === "evidence_linked" && (
                    <div className="space-y-2">
                      {apiResponse?.evidence ? (
                        <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                            <div className="text-base font-bold">{stanceTallies.supports}</div>
                            <div className="text-[10px] text-emerald-400/80">SUPPORTS</div>
                          </div>
                          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
                            <div className="text-base font-bold">{stanceTallies.contradicts}</div>
                            <div className="text-[10px] text-rose-400/80">CONTRADICTS</div>
                          </div>
                          <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800 text-stone-300">
                            <div className="text-base font-bold">{stanceTallies.other}</div>
                            <div className="text-[10px] text-stone-400">INSUFFICIENT</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 italic">
                          Awaiting evidence linkage and stance evaluation...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 5: IMAGE PROVENANCE */}
                  {stage.id === "image_provenance" && (
                    <div className="space-y-2">
                      {apiResponse?.imageProvenance ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-mono text-[#94A3B8]">
                            Discovered{" "}
                            <strong className="text-[#22D3EE]">
                              {apiResponse.imageProvenance.totalCandidatesFound}
                            </strong>{" "}
                            reverse provenance candidates:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {apiResponse.imageProvenance.candidates.slice(0, 4).map((cand) => (
                              <div
                                key={cand.id}
                                className="p-2 rounded-lg bg-[#0D1017] border border-cyan-900/40 flex items-center justify-between gap-2"
                              >
                                <div className="truncate">
                                  <div className="font-semibold text-cyan-200 truncate">
                                    {cand.title}
                                  </div>
                                  <div className="text-[10px] font-mono text-cyan-400">
                                    {cand.domain}
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                                  {cand.matchType}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 italic">
                          {hasMedia
                            ? "Image uploaded. Awaiting reverse provenance search..."
                            : "No image uploaded for this session — stage bypassed."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 6: STANCE ANALYSIS */}
                  {stage.id === "stance_analysis" && (
                    <div className="space-y-2">
                      {apiResponse?.verification ? (
                        <div className="space-y-1.5 pt-1">
                          {apiResponse.verification.claimVerifications.map((c) => (
                            <div
                              key={c.claimId}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#0D1017] border border-stone-800 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#E2C15C]">
                                  {c.claimId}:
                                </span>
                                <span className="text-[#F8F9FA] truncate max-w-sm">
                                  {c.claimText}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    c.verdict === "TRUE"
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                                      : c.verdict === "FALSE"
                                      ? "bg-rose-950 text-rose-300 border border-rose-700"
                                      : c.verdict === "MIXED"
                                      ? "bg-amber-950 text-amber-300 border border-amber-700"
                                      : "bg-stone-900 text-stone-400 border border-stone-700"
                                  }`}
                                >
                                  {c.verdict}
                                </span>
                                {onInspectClaim && (
                                  <button
                                    type="button"
                                    onClick={() => onInspectClaim(c.claimId)}
                                    className="text-[10px] font-mono text-[#D4AF37] hover:underline"
                                  >
                                    WHY?
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-stone-500 italic">
                          Awaiting claim-level stance evaluations...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 7: VERDICT SYNTHESIS */}
                  {stage.id === "verdict_synthesis" && (
                    <div className="space-y-2">
                      {apiResponse?.verification ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1017] border border-[#D4AF37]/30">
                            <div>
                              <div className="text-[10px] font-mono text-[#94A3B8]">
                                SYNTHESIZED OVERALL VERDICT
                              </div>
                              <div
                                className={`text-sm sm:text-base font-extrabold font-mono tracking-wide ${
                                  apiResponse.verification.overallVerdict === "VERIFIED"
                                    ? "text-emerald-400"
                                    : apiResponse.verification.overallVerdict === "FALSE"
                                    ? "text-rose-400"
                                    : apiResponse.verification.overallVerdict === "MIXED"
                                    ? "text-amber-400"
                                    : "text-stone-300"
                                }`}
                              >
                                {apiResponse.verification.overallVerdict}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-[#94A3B8]">CONFIDENCE</div>
                              <div className="text-xs font-mono font-bold text-[#E2C15C]">
                                {apiResponse.verification.overallConfidence}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[#C2C9D6] leading-relaxed">
                            {apiResponse.verification.overallSummary}
                          </p>
                        </div>
                      ) : (
                        <p className="text-stone-500 italic">
                          Awaiting multi-claim aggregation and synthesis...
                        </p>
                      )}
                    </div>
                  )}

                  {/* STAGE 8: INVESTIGATION COMPLETE */}
                  {stage.id === "investigation_complete" && (
                    <div className="space-y-2 text-xs">
                      {isComplete ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span>Forensic audit session finalized successfully.</span>
                          </div>
                          <div className="text-[11px] text-[#94A3B8]">
                            Session ID: {apiResponse?.sessionId?.slice(0, 14)}...
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 italic">
                          Lifecycle terminates when all atomic assertions are verified and synthesized.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
