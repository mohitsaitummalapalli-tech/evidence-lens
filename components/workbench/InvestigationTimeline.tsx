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
    label: "01 INPUT RECEIVED",
    subtitle: "Ingestion and validation of target assertion & multimodal payload",
    targetAnchorId: "claim-input-section",
    icon: FileText,
  },
  {
    id: "claims_decomposed",
    number: 2,
    label: "02 CLAIMS DECOMPOSED",
    subtitle: "AI semantic deconstruction into verifiable atomic claim units",
    targetAnchorId: "claim-extraction-panel",
    icon: Split,
  },
  {
    id: "evidence_retrieved",
    number: 3,
    label: "03 WEB EVIDENCE RETRIEVED",
    subtitle: "Multi-source web search & authoritative source extraction",
    targetAnchorId: "evidence-panel",
    icon: Globe,
  },
  {
    id: "evidence_linked",
    number: 4,
    label: "04 EVIDENCE LINKED",
    subtitle: "Relational mapping between atomic claims and primary citations",
    targetAnchorId: "evidence-panel",
    icon: Link2,
  },
  {
    id: "image_provenance",
    number: 5,
    label: "05 IMAGE PROVENANCE SEARCH",
    subtitle: "Reverse multimodal candidate discovery & web provenance verification",
    targetAnchorId: "image-provenance-panel",
    icon: ImageIcon,
  },
  {
    id: "stance_analysis",
    number: 6,
    label: "06 STANCE ANALYSIS",
    subtitle: "Per-claim evidence stance classification (SUPPORTS / CONTRADICTS)",
    targetAnchorId: "verification-result-panel",
    icon: Scale,
  },
  {
    id: "verdict_synthesis",
    number: 7,
    label: "07 VERDICT SYNTHESIS",
    subtitle: "Deterministic synthesis & calibrated confidence assessment",
    targetAnchorId: "verification-result-panel",
    icon: ShieldCheck,
  },
  {
    id: "investigation_complete",
    number: 8,
    label: "08 INVESTIGATION COMPLETE",
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
        clearInterval(interval);
        setIsReplaying(false);
        setReplayStep(null);
      }
    }, 450);
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    TIMELINE_STAGES.forEach((s) => {
      all[s.id] = true;
    });
    setUserExpandedOverrides(all);
  };

  const handleCollapseAll = () => {
    const all: Record<string, boolean> = {};
    TIMELINE_STAGES.forEach((s) => {
      all[s.id] = false;
    });
    setUserExpandedOverrides(all);
  };

  const toggleStage = (stageId: string) => {
    setUserExpandedOverrides((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  const scrollToAnchor = (anchorId?: string) => {
    if (!anchorId) return;
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Derive individual stage execution statuses
  const stageStatuses: Record<string, TimelineStageStatus> = useMemo(() => {
    const hasProvenance = Boolean(hasMedia || apiResponse?.imageProvenance);

    if (isReplaying && replayStep !== null) {
      const map: Record<string, TimelineStageStatus> = {};
      TIMELINE_STAGES.forEach((st, idx) => {
        if (st.id === "image_provenance" && !hasProvenance) {
          map[st.id] = "SKIPPED";
        } else if (idx < replayStep) {
          map[st.id] = "COMPLETED";
        } else if (idx === replayStep) {
          map[st.id] = "ACTIVE";
        } else {
          map[st.id] = "PENDING";
        }
      });
      return map;
    }

    if (isSubmitting) {
      return {
        input_received: "COMPLETED",
        claims_decomposed: "COMPLETED",
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
      className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2A3038] gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xs font-bold text-[#F3F5F7] tracking-wider uppercase">
                Investigation Audit Trail
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold tracking-wider uppercase ${
                  isSubmitting
                    ? "bg-[#161B21] text-[#D9DEE5] border-[#343B45] animate-pulse"
                    : isComplete
                    ? "bg-emerald-950/30 text-emerald-300 border-emerald-800/40"
                    : "bg-[#161B21] text-[#707984] border-[#2A3038]"
                }`}
              >
                {isSubmitting
                  ? "ACTIVE INVESTIGATION"
                  : isComplete
                  ? "AUDIT RESOLVED"
                  : "IDLE PIPELINE"}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] mt-0.5 font-sans">
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
              className="px-3 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#D9DEE5] border border-[#343B45] text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Replay sequential lifecycle animation"
            >
              <RotateCcw className={`h-3 w-3 ${isReplaying ? "animate-spin" : ""}`} />
              <span>{isReplaying ? "Replaying..." : "Replay"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#A7AFB8] hover:text-[#F3F5F7] border border-[#2A3038] text-xs flex items-center gap-1 transition-colors"
            title="Expand all stage details"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Expand</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#A7AFB8] hover:text-[#F3F5F7] border border-[#2A3038] text-xs flex items-center gap-1 transition-colors"
            title="Collapse all stage details"
          >
            <Minimize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Collapse</span>
          </button>
        </div>
      </div>

      {/* Main Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-4 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2A3038]">
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
                className={`absolute -left-6 sm:-left-10 top-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                  isNodeCompleted
                    ? "bg-[#080A0D] border-emerald-500 text-emerald-400"
                    : isNodeActive
                    ? "bg-[#080A0D] border-[#D9DEE5] text-[#D9DEE5] animate-pulse"
                    : isNodeSkipped
                    ? "bg-[#080A0D] border-[#2A3038] text-[#707984]"
                    : "bg-[#080A0D] border-[#2A3038] text-[#707984]"
                }`}
              >
                {isNodeCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isNodeActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D9DEE5]" />
                ) : isNodeSkipped ? (
                  <Ban className="h-3 w-3 text-[#707984]" />
                ) : (
                  <span className="text-[9px] font-mono text-[#707984] font-bold">
                    {stage.number}
                  </span>
                )}
              </div>

              {/* Stage Card Header */}
              <div
                onClick={() => toggleStage(stage.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  isNodeCompleted
                    ? "bg-[#080A0D] hover:bg-[#161B21] border-[#2A3038] hover:border-[#343B45]"
                    : isNodeActive
                    ? "bg-[#161B21] border-[#D9DEE5]/60"
                    : isNodeSkipped
                    ? "bg-[#080A0D]/50 border-[#2A3038]/50 opacity-60"
                    : "bg-[#080A0D] hover:bg-[#161B21] border-[#2A3038]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded border ${
                      isNodeCompleted
                        ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400"
                        : isNodeActive
                        ? "bg-[#161B21] border-[#343B45] text-[#D9DEE5]"
                        : "bg-[#161B21] border-[#2A3038] text-[#707984]"
                    }`}
                  >
                    <StageIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs font-bold font-mono tracking-wide ${
                          isNodeCompleted
                            ? "text-[#F3F5F7]"
                            : isNodeActive
                            ? "text-[#D9DEE5]"
                            : "text-[#A7AFB8]"
                        }`}
                      >
                        {stage.label}
                      </h4>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
                          isNodeCompleted
                            ? "bg-emerald-950/30 text-emerald-300 border border-emerald-800/40"
                            : isNodeActive
                            ? "bg-[#161B21] text-[#D9DEE5] border border-[#343B45] animate-pulse"
                            : isNodeSkipped
                            ? "bg-[#161B21] text-[#707984] border border-[#2A3038]"
                            : "bg-[#161B21] text-[#707984] border border-[#2A3038]"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-[#707984] font-sans mt-0.5 hidden sm:block">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded text-[#707984] hover:text-white">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Stage Expanded Details Body */}
              {isExpanded && (
                <div className="mt-2 p-3.5 rounded-lg bg-[#080A0D] border border-[#2A3038] space-y-3 font-sans">
                  {/* Stage 1: Input Received */}
                  {stage.id === "input_received" && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded bg-[#11151A] border border-[#2A3038] space-y-1">
                        <span className="text-[10px] text-[#707984] uppercase font-mono block">
                          Ingested Assertion
                        </span>
                        <p className="text-[#F3F5F7] italic">
                          &ldquo;{claimText || apiResponse?.input?.claim || "Target assertion under verification"}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#707984]">
                        <span>CHAR LENGTH: {(claimText || apiResponse?.input?.claim || "").length}</span>
                        {hasMedia && (
                          <span className="text-[#38BDF8]">
                            • MULTIMODAL ASSET PRESENT
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
                          <span className="text-[11px] font-mono text-[#707984] block">
                            EXTRACTED {apiResponse.extraction.claims.length} ATOMIC UNITS:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {apiResponse.extraction.claims.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => onInspectClaim?.(c.id)}
                                className="p-2.5 rounded bg-[#11151A] border border-[#2A3038] hover:border-[#343B45] space-y-1 text-xs cursor-pointer transition-colors"
                                title="Click to inspect this claim"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-[#F3F5F7] font-bold">{c.id}</span>
                                  <span className="text-[#707984] uppercase">{c.category}</span>
                                </div>
                                <p className="text-[#A7AFB8] text-[11px] line-clamp-2 font-sans">
                                  {c.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
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
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">TOTAL SOURCES</span>
                              <span className="text-[#F3F5F7] font-bold text-sm">
                                {apiResponse.evidence.totalSourcesFound}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">UNIQUE DOMAINS</span>
                              <span className="text-emerald-400 font-bold text-sm">
                                {new Set(apiResponse.evidence.allSources?.map((s) => s.domain) || []).size}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">WEB RETRIEVALS</span>
                              <span className="text-[#D9DEE5] font-bold text-sm">
                                {apiResponse.evidence.allSources?.filter((s) => s.sourceType === "web").length || 0}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">VIDEO / YOUTUBE</span>
                              <span className="text-[#38BDF8] font-bold text-sm">
                                {apiResponse.evidence.allSources?.filter((s) => s.sourceType === "youtube").length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
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
                          <p className="text-[#A7AFB8] text-[11px]">
                            {apiResponse.evidence.allSources.length} primary sources linked across {apiResponse.extraction?.claims?.length || 0} claims.
                          </p>
                          <div className="flex flex-wrap gap-1.5 font-mono">
                            {apiResponse.evidence.allSources.slice(0, 6).map((src) => (
                              <span
                                key={src.id}
                                className="px-2 py-0.5 rounded bg-[#11151A] border border-[#2A3038] text-[10px] text-[#D9DEE5]"
                              >
                                {src.domain}
                              </span>
                            ))}
                            {apiResponse.evidence.allSources.length > 6 && (
                              <span className="px-2 py-0.5 rounded bg-[#11151A] border border-[#2A3038] text-[10px] text-[#707984]">
                                +{apiResponse.evidence.allSources.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
                          {isSubmitting ? "Linking evidence to atomic assertions..." : "Relational linking pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 5: Image Provenance Search */}
                  {stage.id === "image_provenance" && (
                    <div className="space-y-2 text-xs">
                      {status === "SKIPPED" ? (
                        <p className="text-[#707984] text-xs italic font-mono">
                          Stage skipped — no image or multimodal attachment was provided for this investigation.
                        </p>
                      ) : apiResponse?.imageProvenance ? (
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">MATCH STATUS</span>
                              <span className="text-emerald-400 font-bold text-xs">
                                {apiResponse.imageProvenance.candidates.length > 0 ? "MATCH LOCATED" : "NO DIRECT MATCH"}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">CANDIDATES</span>
                              <span className="text-[#F3F5F7] font-bold text-sm">
                                {apiResponse.imageProvenance.totalCandidatesFound}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                              <span className="text-[#707984] block text-[9px]">DOMAINS</span>
                              <span className="text-emerald-400 font-bold text-sm">
                                {apiResponse.imageProvenance.uniqueDomains?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
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
                          <div className="p-2 rounded bg-[#11151A] border border-emerald-800/40">
                            <span className="text-[9px] text-[#707984] block">SUPPORTS</span>
                            <span className="text-emerald-400 font-bold text-sm">
                              {stanceTallies.supports}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-[#11151A] border border-rose-800/40">
                            <span className="text-[9px] text-[#707984] block">CONTRADICTS</span>
                            <span className="text-rose-400 font-bold text-sm">
                              {stanceTallies.contradicts}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-[#11151A] border border-[#2A3038]">
                            <span className="text-[9px] text-[#707984] block">NEUTRAL/OTHER</span>
                            <span className="text-amber-400 font-bold text-sm">
                              {stanceTallies.other}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
                          {isSubmitting ? "Classifying supporting and contradicting stance per claim..." : "Stance analysis pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 7: Verdict Synthesis */}
                  {stage.id === "verdict_synthesis" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.verification ? (
                        <div className="p-3 rounded bg-[#11151A] border border-[#2A3038] space-y-2">
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-[10px] text-[#707984]">
                              SYNTHESIS VERDICT:
                            </span>
                            <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#161B21] text-[#F3F5F7] border border-[#343B45]">
                              {apiResponse.verification.overallVerdict}
                            </span>
                          </div>
                          <p className="text-[#A7AFB8] font-sans text-xs">
                            {apiResponse.verification.overallSummary}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
                          {isSubmitting ? "Synthesizing deterministic verdict from evidence stances..." : "Synthesis pending."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stage 8: Investigation Complete */}
                  {stage.id === "investigation_complete" && (
                    <div className="space-y-2 text-xs">
                      {apiResponse?.verification ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded bg-[#11151A] border border-emerald-800/40">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-[#F3F5F7] font-medium">
                              Full evidence dossier ready for inspection.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => scrollToAnchor(stage.targetAnchorId)}
                            className="px-3 py-1 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#D9DEE5] border border-[#343B45] text-[11px] font-mono transition-colors"
                          >
                            Explore Map ↗
                          </button>
                        </div>
                      ) : (
                        <p className="text-[#707984] text-xs italic font-mono">
                          {isSubmitting ? "Finalizing investigation report..." : "Awaiting investigation completion."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick Anchor Link */}
                  {stage.targetAnchorId && isComplete && (
                    <div className="pt-2 border-t border-[#2A3038] flex justify-end font-mono">
                      <button
                        type="button"
                        onClick={() => scrollToAnchor(stage.targetAnchorId)}
                        className="text-[10px] text-[#A7AFB8] hover:text-white flex items-center gap-1 transition-colors"
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
