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
import { INPUT_VALIDATION } from "@/lib/constants";
import { 
  InvestigationInputResponse, 
  InvestigationUIState, 
  UploadedMediaPreview 
} from "@/types";

export const EvidenceLensWorkbench: React.FC = () => {
  const [claimText, setClaimText] = useState("");
  const [contextText, setContextText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<UploadedMediaPreview | null>(null);
  const [statusState, setStatusState] = useState<"SUBMITTING" | "INPUT_RECEIVED" | "ERROR" | null>(null);
  const [apiResponse, setApiResponse] = useState<InvestigationInputResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setApiResponse(data as InvestigationInputResponse);
      setStatusState("INPUT_RECEIVED");
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

  const isFormDisabled = uiState === "SUBMITTING";

  return (
    <div className="space-y-6">
      {/* Top Input & Media Ingestion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Control Bar & State Indicators */}
      <InvestigationControls
        uiState={uiState}
        hasValidInput={hasValidInput}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {/* Investigation Initialized Server Response Panel */}
      {uiState === "INPUT_RECEIVED" && apiResponse && (
        <>
          <InvestigationResultPanel response={apiResponse} />
          {apiResponse.extraction && (
            <ClaimExtractionPanel extraction={apiResponse.extraction} />
          )}
          {apiResponse.evidence && (
            <EvidencePanel evidence={apiResponse.evidence} />
          )}
        </>
      )}

      {/* Investigation Workspace State */}
      <WorkspacePlaceholder
        claims={apiResponse?.extraction?.claims || []}
        evidence={apiResponse?.evidence}
      />

      {/* Pipeline Architecture Reference */}
      <PipelineOverview />
    </div>
  );
};
