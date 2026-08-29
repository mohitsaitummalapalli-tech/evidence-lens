"use client";

import React, { useState, useMemo } from "react";
import { ClaimInputSection } from "./ClaimInputSection";
import { MediaUploadSection } from "./MediaUploadSection";
import { InvestigationControls } from "./InvestigationControls";
import { PipelineOverview } from "./PipelineOverview";
import { WorkspacePlaceholder } from "./WorkspacePlaceholder";
import { InvestigationResultPanel } from "./InvestigationResultPanel";
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

  return (
    <Forensic3DLayer
      verdict={apiResponse?.verification?.overallVerdict}
      isInvestigating={uiState === "SUBMITTING"}
    >
      <div className="space-y-6">
        {/* Top Input & Media Ingestion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepthCard floatingPhase={1} enableTilt={false}>
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

          <DepthCard floatingPhase={2} enableTilt={false}>
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

        {/* Control Bar & State Indicators */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <InvestigationControls
            uiState={uiState}
            hasValidInput={hasValidInput}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </DepthCard>

        {/* 1. PRIMARY RESULT & VERDICT (Phase 5 / 7A) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.verification && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <VerificationResultPanel
              verification={apiResponse.verification}
              onInspectClaim={(claimId) => setInspectingClaimId(claimId)}
            />
          </DepthCard>
        )}

        {/* 2. UNIVERSAL WEB & YOUTUBE SOURCES (Phase 4B / 10) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.evidence && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <EvidencePanel evidence={apiResponse.evidence} />
          </DepthCard>
        )}

        {/* 3. MULTIMODAL MEDIA & IMAGE PROVENANCE (Phase 6B / 10) */}
        {(uiState === "SUBMITTING" && Boolean(selectedMedia)) || (uiState === "INPUT_RECEIVED" && apiResponse?.imageProvenance) ? (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <ImageProvenancePanel
              provenance={apiResponse?.imageProvenance}
              isLoading={uiState === "SUBMITTING" && Boolean(selectedMedia)}
            />
          </DepthCard>
        ) : null}

        {/* 4. ATOMIC CLAIM DECOMPOSITION (Phase 3) */}
        {uiState === "INPUT_RECEIVED" && apiResponse?.extraction && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <ClaimExtractionPanel extraction={apiResponse.extraction} />
          </DepthCard>
        )}

        {/* 5. FORENSIC INVESTIGATION LIFECYCLE TIMELINE (Phase 8) */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <InvestigationTimeline
            uiState={uiState}
            apiResponse={apiResponse}
            claimText={claimText}
            hasMedia={Boolean(selectedMedia)}
            onInspectClaim={(claimId) => setInspectingClaimId(claimId)}
            onViewInGraph={() => {
              const graphEl = document.getElementById("evidence-graph-panel");
              if (graphEl) {
                graphEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />
        </DepthCard>

        {/* 6. LIVE FORENSIC EVIDENCE GRAPH */}
        {(uiState === "SUBMITTING" || (uiState === "INPUT_RECEIVED" && apiResponse && (apiResponse.extraction || apiResponse.evidence))) && (
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

        {/* 7. CONFIDENCE TRAJECTORY COMET GRAPH */}
        {(uiState === "SUBMITTING" || (uiState === "INPUT_RECEIVED" && apiResponse?.verification)) && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <ConfidenceCometGraph
              verification={apiResponse?.verification}
              isAnalyzing={uiState === "SUBMITTING"}
            />
          </DepthCard>
        )}

        {/* Server Response Diagnostics */}
        {uiState === "INPUT_RECEIVED" && apiResponse && (
          <DepthCard floatingPhase="none" enableTilt={false}>
            <InvestigationResultPanel response={apiResponse} />
          </DepthCard>
        )}

        {/* Forensic "Why This Verdict?" Inspector Drawer (Phase 7A) */}
        <VerdictInspector
          claimId={inspectingClaimId}
          verification={apiResponse?.verification}
          evidence={apiResponse?.evidence}
          onClose={() => setInspectingClaimId(null)}
          onViewInGraph={() => {
            // Scroll smoothly to Evidence Graph container
            const graphEl = document.getElementById("evidence-graph-panel") || document.querySelector(".edges-layer")?.closest("div");
            if (graphEl) {
              graphEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Forensic Investigation History & Comparison Dashboard (Phase 9) */}
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

        {/* Investigation Workspace State */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <WorkspacePlaceholder
            claims={apiResponse?.extraction?.claims || []}
            evidence={apiResponse?.evidence}
            verification={apiResponse?.verification}
          />
        </DepthCard>

        {/* Pipeline Architecture Reference */}
        <DepthCard floatingPhase="none" enableTilt={false}>
          <PipelineOverview />
        </DepthCard>
      </div>
    </Forensic3DLayer>
  );
};
