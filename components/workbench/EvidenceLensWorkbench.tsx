"use client";

import React, { useState, useMemo } from "react";
import { ClaimInputSection } from "./ClaimInputSection";
import { MediaUploadSection } from "./MediaUploadSection";
import { InvestigationControls } from "./InvestigationControls";
import { ClaimExtractionPanel } from "./ClaimExtractionPanel";
import { EvidencePanel } from "./EvidencePanel";
import { VerificationResultPanel } from "./VerificationResultPanel";
import { EvidenceGraph } from "./EvidenceGraph";
import { ConfidenceCometGraph } from "./ConfidenceCometGraph";
import { ImageProvenancePanel } from "./ImageProvenancePanel";
import { VerdictInspector } from "./VerdictInspector";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { InvestigationHistory } from "./InvestigationHistory";
import { InvestigationComparison } from "./InvestigationComparison";
import { MultiAIConsensusPanel } from "./MultiAIConsensusPanel";
import { Forensic3DLayer } from "./Forensic3DLayer";
import { DepthCard } from "./DepthCard";
import { saveInvestigationToHistory } from "@/lib/history/storage";
import { INPUT_VALIDATION } from "@/lib/constants";
import { 
  InvestigationInputResponse, 
  InvestigationUIState, 
  InvestigationHistoryRecord,
  UploadedMediaPreview 
} from "@/types";

export const EvidenceLensWorkbench: React.FC = () => {
  const [claimText, setClaimText] = useState("");
  const [contextText, setContextText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<UploadedMediaPreview | null>(null);
  const [statusState, setStatusState] = useState<"SUBMITTING" | "INPUT_RECEIVED" | "ERROR" | null>(null);
  const [apiResponse, setApiResponse] = useState<InvestigationInputResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inspectingClaimId, setInspectingClaimId] = useState<string | null>(null);
  const [historyUpdatedTimestamp, setHistoryUpdatedTimestamp] = useState<number>(0);
  const [comparingRecords, setComparingRecords] = useState<{
    recordA: InvestigationHistoryRecord;
    recordB: InvestigationHistoryRecord;
  } | null>(null);

  // Compute validation state
  const hasValidInput = useMemo(() => {
    const trimmed = claimText.trim();
    return (
      trimmed.length >= INPUT_VALIDATION.minClaimLength &&
      trimmed.length <= INPUT_VALIDATION.maxClaimLength
    );
  }, [claimText]);

  // Derive active UI state cleanly without cascading effects
  const uiState: InvestigationUIState = useMemo(() => {
    if (statusState) {
      return statusState;
    }
    return hasValidInput ? "READY" : "IDLE";
  }, [statusState, hasValidInput]);

  const handleSubmit = async () => {
    if (!hasValidInput || uiState === "SUBMITTING") return;

    setStatusState("SUBMITTING");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("claim", claimText.trim());
      if (contextText.trim()) {
        formData.append("contextUrl", contextText.trim());
      }
      if (selectedMedia?.file) {
        formData.append("media", selectedMedia.file);
      }

      const res = await fetch("/api/investigate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to process investigation request.`);
      }

      const responseObj = data as InvestigationInputResponse;
      setApiResponse(responseObj);
      setStatusState("INPUT_RECEIVED");

      // Save to client-side investigation history
      saveInvestigationToHistory(responseObj);
      setHistoryUpdatedTimestamp(Date.now());
    } catch (err: unknown) {
      console.error("Investigation submit error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected network error occurred.";
      setErrorMessage(msg);
      setStatusState("ERROR");
    }
  };

  const handleReset = () => {
    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }
    setClaimText("");
    setContextText("");
    setSelectedMedia(null);
    setApiResponse(null);
    setErrorMessage(null);
    setStatusState(null);
  };

  const handleOpenFromHistory = (record: InvestigationHistoryRecord) => {
    if (record.fullResponse) {
      setApiResponse(record.fullResponse);
      setClaimText(record.targetClaim);
      setContextText(record.contextUrl || "");
      setStatusState("INPUT_RECEIVED");
      setErrorMessage(null);

      // Smooth scroll up to the Investigation Timeline / Results
      const timelineEl = document.getElementById("investigation-timeline-panel") || document.getElementById("verification-result-panel");
      if (timelineEl) {
        timelineEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCompareFromHistory = (
    recordA: InvestigationHistoryRecord,
    recordB: InvestigationHistoryRecord
  ) => {
    setComparingRecords({ recordA, recordB });
  };

  const handleSwapComparingSides = () => {
    if (!comparingRecords) return;
    setComparingRecords({
      recordA: comparingRecords.recordB,
      recordB: comparingRecords.recordA,
    });
  };

  const isFormDisabled = uiState === "SUBMITTING";

  const [activeViewTab, setActiveViewTab] = useState<
    "ALL" | "WHY_RESULT" | "SOURCES" | "MEDIA" | "CONSENSUS" | "MAP" | "TIMELINE" | "HISTORY"
  >("ALL");

  return (
    <Forensic3DLayer
      verdict={apiResponse?.verification?.overallVerdict}
      isInvestigating={uiState === "SUBMITTING"}
    >
      <div className="space-y-6">
        {/* Top Input & Media Ingestion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DepthCard floatingPhase="none" enableTilt={false}>
            <ClaimInputSection
              claimText={claimText}
              setClaimText={(val) => {
                setClaimText(val);
                if (statusState === "ERROR") {
                  setStatusState(null);
                  setErrorMessage(null);
                }
              }}
              contextText={contextText}
              setContextText={setContextText}
              disabled={isFormDisabled}
            />
          </DepthCard>

          <DepthCard floatingPhase="none" enableTilt={false}>
            <MediaUploadSection
              media={selectedMedia}
              setMedia={(media) => {
                setSelectedMedia(media);
                if (statusState === "ERROR") {
                  setStatusState(null);
                  setErrorMessage(null);
                }
              }}
              disabled={isFormDisabled}
            />
          </DepthCard>
        </div>

        {/* Primary Action & State Bar */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <InvestigationControls
            uiState={uiState}
            hasValidInput={hasValidInput}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </DepthCard>

        {/* 1. PRIMARY RESULT & VERDICT (Immediate Plain-English Presentation) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.verification && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <VerificationResultPanel
              verification={apiResponse.verification}
              onInspectClaim={(claimId) => setInspectingClaimId(claimId)}
            />
          </DepthCard>
        )}

        {/* Progressive Disclosure Section Navigation (Visible once results are ready) */}
        {uiState === "INPUT_RECEIVED" && apiResponse && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#0D1017] border border-stone-800 shadow-lg">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveViewTab("ALL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === "ALL"
                    ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                }`}
              >
                All Sections
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("WHY_RESULT")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === "WHY_RESULT"
                    ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                }`}
              >
                Why this result?
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("SOURCES")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === "SOURCES"
                    ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                }`}
              >
                Sources ({apiResponse.evidence?.totalSourcesFound || 0})
              </button>
              {apiResponse.imageProvenance && (
                <button
                  type="button"
                  onClick={() => setActiveViewTab("MEDIA")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeViewTab === "MEDIA"
                      ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                  }`}
                >
                  Media Matches ({apiResponse.imageProvenance.totalCandidatesFound})
                </button>
              )}
              {apiResponse.consensus && (
                <button
                  type="button"
                  onClick={() => setActiveViewTab("CONSENSUS")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeViewTab === "CONSENSUS"
                      ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                  }`}
                >
                  AI Agreement ({apiResponse.consensus.overallAgreementRate}%)
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveViewTab("MAP")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === "MAP"
                    ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                }`}
              >
                Evidence Map
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("TIMELINE")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeViewTab === "TIMELINE"
                    ? "bg-[#131720] text-[#E2C15C] border border-[#D4AF37]/40 font-semibold shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8F9FA] hover:bg-[#131720]/50"
                }`}
              >
                Timeline
              </button>
            </div>
            <span className="text-[11px] text-[#94A3B8] pr-2 hidden sm:inline">
              Progressive Analysis View
            </span>
          </div>
        )}

        {/* 2. MULTI-AI EVIDENCE CONSENSUS (Phase 12) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.consensus && (activeViewTab === "ALL" || activeViewTab === "CONSENSUS") && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <MultiAIConsensusPanel consensus={apiResponse.consensus} />
          </DepthCard>
        )}

        {/* 3. UNIVERSAL WEB & YOUTUBE SOURCES (Phase 4B / 10 / 11) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.evidence && (activeViewTab === "ALL" || activeViewTab === "SOURCES") && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <EvidencePanel evidence={apiResponse.evidence} />
          </DepthCard>
        )}

        {/* 4. MULTIMODAL MEDIA & IMAGE PROVENANCE (Phase 6B / 10) */}
        {((uiState === "SUBMITTING" && Boolean(selectedMedia)) || (uiState === "INPUT_RECEIVED" && apiResponse?.imageProvenance)) &&
          (activeViewTab === "ALL" || activeViewTab === "MEDIA") && (
            <DepthCard floatingPhase="none" enableTilt={false}>
              <ImageProvenancePanel
                provenance={apiResponse?.imageProvenance}
                isLoading={uiState === "SUBMITTING" && Boolean(selectedMedia)}
              />
            </DepthCard>
        )}

        {/* 5. CLAIM DECOMPOSITION (Phase 3) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.extraction && (activeViewTab === "ALL" || activeViewTab === "WHY_RESULT") && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <ClaimExtractionPanel extraction={apiResponse.extraction} />
          </DepthCard>
        )}

        {/* 6. INVESTIGATION LIFECYCLE TIMELINE (Phase 8) */}
        {(activeViewTab === "ALL" || activeViewTab === "TIMELINE") && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <InvestigationTimeline
              uiState={uiState}
              apiResponse={apiResponse}
              claimText={claimText}
              hasMedia={Boolean(selectedMedia)}
              onInspectClaim={(claimId) => setInspectingClaimId(claimId)}
              onViewInGraph={() => {
                setActiveViewTab("MAP");
                const graphEl = document.getElementById("evidence-graph-panel");
                if (graphEl) {
                  graphEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </DepthCard>
        )}

        {/* 7. SPACIOUS INTERACTIVE EVIDENCE MAP */}
        {(uiState === "SUBMITTING" || (uiState === "INPUT_RECEIVED" && apiResponse && (apiResponse.extraction || apiResponse.evidence))) &&
          (activeViewTab === "ALL" || activeViewTab === "MAP") && (
            <DepthCard floatingPhase="none" enableTilt={false}>
              <EvidenceGraph
                extraction={apiResponse?.extraction}
                evidence={apiResponse?.evidence}
                verification={apiResponse?.verification}
                imageProvenance={apiResponse?.imageProvenance}
                originalClaim={claimText.trim() || apiResponse?.input.claim}
                isInitializing={uiState === "SUBMITTING"}
              />
            </DepthCard>
        )}

        {/* 8. CONFIDENCE COMET GRAPH */}
        {(uiState === "SUBMITTING" || (uiState === "INPUT_RECEIVED" && apiResponse?.verification)) &&
          (activeViewTab === "ALL" || activeViewTab === "WHY_RESULT") && (
            <DepthCard floatingPhase="none" enableTilt={false}>
              <ConfidenceCometGraph
                verification={apiResponse?.verification}
                isAnalyzing={uiState === "SUBMITTING"}
              />
            </DepthCard>
        )}

        {/* Forensic "Why This Verdict?" Inspector Drawer (Phase 7A) */}
        <VerdictInspector
          claimId={inspectingClaimId}
          verification={apiResponse?.verification}
          evidence={apiResponse?.evidence}
          onClose={() => setInspectingClaimId(null)}
          onViewInGraph={() => {
            setActiveViewTab("MAP");
            const graphEl = document.getElementById("evidence-graph-panel") || document.querySelector(".edges-layer")?.closest("div");
            if (graphEl) {
              graphEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Investigation History & Comparison Dashboard (Phase 9) */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <InvestigationHistory
            onOpenInvestigation={handleOpenFromHistory}
            onCompareInvestigations={handleCompareFromHistory}
            lastUpdatedTimestamp={historyUpdatedTimestamp}
          />
        </DepthCard>

        {/* Forensic Side-by-Side Comparison Modal (Phase 9) */}
        {comparingRecords && (
          <InvestigationComparison
            investigationA={comparingRecords.recordA}
            investigationB={comparingRecords.recordB}
            onClose={() => setComparingRecords(null)}
            onSwap={handleSwapComparingSides}
            onOpenInvestigation={handleOpenFromHistory}
          />
        )}
      </div>
    </Forensic3DLayer>
  );
};
