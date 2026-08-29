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
      TIMELINE_STAGES.forEach((s, idx) => {
        if (s.id === "image_provenance" && !hasProvenance) {
          statuses[s.id] = "SKIPPED";
        } else if (idx < replayStep) {
          statuses[s.id] = "COMPLETED";
        } else if (idx === replayStep) {
          statuses[s.id] = "ACTIVE";
        } else {
          statuses[s.id] = "PENDING";
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
        image_provenance: hasProvenance ? "ACTIVE" : "SKIPPED",
        stance_analysis: "PENDING",
        verdict_synthesis: "PENDING",
        investigation_complete: "PENDING",
      };
    }

    if (isComplete) {
      return {
        input_received: "COMPLETED",
        claims_decomposed: "COMPLETED",
        evidence_retrieved: "COMPLETED",
        evidence_linked: "COMPLETED",
        image_provenance: hasProvenance ? "COMPLETED" : "SKIPPED",
        stance_analysis: "COMPLETED",
        verdict_synthesis: "COMPLETED",
        investigation_complete: "COMPLETED",
      };
    }

    return {
      input_received: "PENDING",
      claims_decomposed: "PENDING",
      evidence_retrieved: "PENDING",
      evidence_linked: "PENDING",
      image_provenance: "PENDING",
      stance_analysis: "PENDING",
      verdict_synthesis: "PENDING",
      investigation_complete: "PENDING",
    };
  }, [isSubmitting, isComplete, isReplaying, replayStep, hasMedia, apiResponse?.imageProvenance]);

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
      className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300 relative overflow-hidden"
    >
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-red-950/10 to-transparent pointer-events-none blur-2xl" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-800 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-[#F8F9FA] tracking-wide">
                Investigation Timeline
              </h3>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold tracking-wider uppercase ${
                  isSubmitting
                    ? "bg-red-950/40 text-red-300 border-red-500/40 animate-pulse"
                    : isComplete
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                    : "bg-[#161B24] text-[#94A3B8] border-stone-800"
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
              className="px-3 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-red-400 border border-stone-700 text-xs font-sans flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              title="Replay sequential lifecycle animation"
            >
              <RotateCcw className={`h-3 w-3 ${isReplaying ? "animate-spin" : ""}`} />
              <span>{isReplaying ? "Replaying..." : "Replay Timeline"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 text-xs font-sans flex items-center gap-1 transition-colors"
            title="Expand all stage details"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Expand</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 text-xs font-sans flex items-center gap-1 transition-colors"
            title="Collapse all stage details"
          >
            <Minimize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Collapse</span>
          </button>
        </div>
      </div>

      {/* Main Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-red-600/40 before:via-red-500/20 before:to-emerald-500/40">
        {/* Traveling Comet Particle along active timeline */}
        {isSubmitting && (
          <div
            className="absolute left-2 sm:left-4 w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_#EF4444] pointer-events-none animate-bounce"
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
                    ? "bg-[#0B0D11] border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                    : isNodeActive
                    ? "bg-[#0B0D11] border-red-500 text-red-400 shadow-[0_0_14px_rgba(239,68,68,0.45)] animate-pulse"
                    : isNodeSkipped
                    ? "bg-[#0B0D11] border-stone-800 text-stone-600"
                    : "bg-[#0B0D11] border-stone-800 text-stone-600"
                }`}
              >
                {isNodeCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : isNodeActive ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-red-400" />
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
                    ? "bg-[#11141A] hover:bg-[#161B24] border-stone-800 hover:border-stone-700 shadow-md"
                    : isNodeActive
                    ? "bg-[#161B24] border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    : isNodeSkipped
                    ? "bg-[#0B0D11]/50 border-stone-900 opacity-60"
                    : "bg-[#0B0D11]/70 hover:bg-[#11141A] border-stone-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      isNodeCompleted
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                        : isNodeActive
                        ? "bg-[#161B24] border-red-500/40 text-red-400"
                        : "bg-[#161B24] border-stone-800 text-stone-500"
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
                            ? "text-red-400"
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
                            ? "bg-red-950/40 text-red-300 border border-red-500/40 animate-pulse"
                            : isNodeSkipped
                            ? "bg-stone-900 text-stone-500 border border-stone-800"
                            : "bg-[#161B24] text-stone-500 border border-stone-800"
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

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded text-[#94A3B8] hover:text-white">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Stage Expanded Details Body */}
              {isExpanded && (
                <div className="mt-2 p-4 rounded-xl bg-[#0B0D11] border border-stone-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Stage 1: Input Received */}
                  {stage.id === "input_received" && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-lg bg-[#11141A] border border-stone-800 space-y-1">
                        <span className="text-[10px] text-stone-500 uppercase font-mono block">
                          Ingested Assertion
                        </span>
                        <p className="text-[#F8F9FA] italic">
                          &ldquo;{claimText || apiResponse?.input?.claim || "Target assertion under verification"}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
                        <span>CHAR LENGTH: {(claimText || apiResponse?.input?.claim || "").length}</span>
                        {hasMedia && (
                          <span className="text-red-400">
                            • MULTIMODAL ATTACHMENT PRESENT
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Claims Decomposed */}
                  {stage.id === "claims_decomposed" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.extraction?.claims && apiResponse.extraction.claims.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono text-stone-400 block">
                            EXTRACTED {apiResponse.extraction.claims.length} ATOMIC UNITS:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {apiResponse.extraction.claims.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => onInspectClaim?.(c.id)}
                                className="p-2.5 rounded-lg bg-[#11141A] border border-stone-800 hover:border-stone-700 space-y-1 text-xs cursor-pointer transition-colors"
                                title="Click to inspect this claim"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-red-400 font-bold">{c.id}</span>
                                  <span className="text-stone-500 uppercase">{c.category}</span>
                                </div>
                                <p className="text-[#F8F9FA] text-[11px] line-clamp-2">
                                  {c.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Deconstructing compound statement into atomic claims..." : "Claims pending extraction."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 3: Web Evidence Retrieved */}
                  {stage.id === "evidence_retrieved" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.evidence ? (
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">TOTAL SOURCES</span>
                              <span className="text-[#F8F9FA] font-bold text-sm">
                                {apiResponse.evidence.totalSourcesFound}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">UNIQUE DOMAINS</span>
                              <span className="text-emerald-400 font-bold text-sm">
                                {new Set(apiResponse.evidence.allSources?.map((s) => s.domain) || []).size}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">WEB RETRIEVALS</span>
                              <span className="text-red-400 font-bold text-sm">
                                {apiResponse.evidence.allSources?.filter((s) => s.sourceType === "web").length || 0}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">VIDEO / YOUTUBE</span>
                              <span className="text-red-400 font-bold text-sm">
                                {apiResponse.evidence.allSources?.filter((s) => s.sourceType === "youtube").length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Executing multi-source web search..." : "Evidence retrieval pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 4: Evidence Linked */}
                  {stage.id === "evidence_linked" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.evidence?.allSources ? (
                        <div className="space-y-2">
                          <p className="text-[#CBD5E1] text-[11px]">
                            {apiResponse.evidence.allSources.length} primary sources linked across {apiResponse.extraction?.claims?.length || 0} claims.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {apiResponse.evidence.allSources.slice(0, 6).map((src) => (
                              <span
                                key={src.id}
                                className="px-2 py-0.5 rounded bg-[#11141A] border border-stone-800 text-[10px] font-mono text-[#CBD5E1]"
                              >
                                {src.domain}
                              </span>
                            ))}
                            {apiResponse.evidence.allSources.length > 6 && (
                              <span className="px-2 py-0.5 rounded bg-[#11141A] border border-stone-800 text-[10px] font-mono text-stone-500">
                                +{apiResponse.evidence.allSources.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Linking evidence to atomic assertions..." : "Relational linking pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 5: Image Provenance Search */}
                  {stage.id === "image_provenance" && (
                    <div className="space-y-2 text-xs">
                      {status === "SKIPPED" ? (
                        <p className="text-stone-500 text-xs italic">
                          Stage skipped — no image or multimodal attachment was provided for this investigation.
                        </p>
                      ) : apiResponse?.imageProvenance ? (
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">MATCH STATUS</span>
                              <span className="text-emerald-400 font-bold text-xs">
                                {apiResponse.imageProvenance.candidates.length > 0 ? "MATCH LOCATED" : "NO DIRECT MATCH"}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">CANDIDATES</span>
                              <span className="text-[#F8F9FA] font-bold text-sm">
                                {apiResponse.imageProvenance.totalCandidatesFound}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                              <span className="text-stone-500 block text-[9px]">SOURCE DOMAINS</span>
                              <span className="text-red-400 font-bold text-sm">
                                {apiResponse.imageProvenance.uniqueDomains?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Querying visual match and provenance candidates..." : "Provenance pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 6: Stance Analysis */}
                  {stage.id === "stance_analysis" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.verification ? (
                        <div className="grid grid-cols-3 gap-2 font-mono text-center">
                          <div className="p-2 rounded bg-[#11141A] border border-emerald-800/40">
                            <span className="text-[9px] text-stone-400 block">SUPPORTS</span>
                            <span className="text-emerald-400 font-bold text-sm">
                              {stanceTallies.supports}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-[#11141A] border border-red-800/40">
                            <span className="text-[9px] text-stone-400 block">CONTRADICTS</span>
                            <span className="text-red-400 font-bold text-sm">
                              {stanceTallies.contradicts}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-[#11141A] border border-stone-800">
                            <span className="text-[9px] text-stone-400 block">NEUTRAL/OTHER</span>
                            <span className="text-amber-400 font-bold text-sm">
                              {stanceTallies.other}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Classifying supporting and contradicting stance per claim..." : "Stance analysis pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 7: Verdict Synthesis */}
                  {stage.id === "verdict_synthesis" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.verification ? (
                        <div className="p-3 rounded-lg bg-[#11141A] border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-stone-400">
                              OVERALL SYNTHESIS VERDICT:
                            </span>
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/40">
                              {apiResponse.verification.overallVerdict}
                            </span>
                          </div>
                          <p className="text-[#CBD5E1] font-sans text-xs">
                            {apiResponse.verification.overallSummary}
                          </p>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Synthesizing deterministic verdict from evidence stances..." : "Synthesis pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 8: Investigation Complete */}
                  {stage.id === "investigation_complete" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.verification ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-lg bg-[#11141A] border border-emerald-800/40">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-[#F8F9FA] font-medium">
                              Full evidence dossier ready for inspection.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => scrollToAnchor(stage.targetAnchorId)}
                            className="px-3 py-1 rounded bg-[#161B24] hover:bg-[#1E2430] text-red-400 border border-stone-700 text-[11px] font-sans transition-colors"
                          >
                            Explore in Evidence Map ↗
                          </button>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-xs italic">
                          {isSubmitting ? "Finalizing investigation report..." : "Awaiting investigation completion."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick Anchor Link */}
                  {stage.targetAnchorId && isComplete && (
                    <div className="pt-2 border-t border-stone-900 flex justify-end">
                      <button
                        type="button"
                        onClick={() => scrollToAnchor(stage.targetAnchorId)}
                        className="text-[10px] font-sans text-red-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Jump to section</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
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
