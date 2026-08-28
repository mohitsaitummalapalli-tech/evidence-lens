"use client";

import React, { useState } from "react";
import { ClaimInputSection } from "./ClaimInputSection";
import { MediaUploadSection } from "./MediaUploadSection";
import { InvestigationControls } from "./InvestigationControls";
import { PipelineOverview } from "./PipelineOverview";
import { WorkspacePlaceholder } from "./WorkspacePlaceholder";

export const EvidenceLensWorkbench: React.FC = () => {
  const [claimText, setClaimText] = useState("");
  const [contextText, setContextText] = useState("");

  const handleReset = () => {
    setClaimText("");
    setContextText("");
  };

  return (
    <div className="space-y-6">
      {/* Top Input & Ingestion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClaimInputSection
          claimText={claimText}
          setClaimText={setClaimText}
          contextText={contextText}
          setContextText={setContextText}
        />
        <MediaUploadSection />
      </div>

      {/* Control Bar */}
      <InvestigationControls
        claimText={claimText}
        onReset={handleReset}
      />

      {/* Empty Investigation Workspace */}
      <WorkspacePlaceholder />

      {/* Pipeline Architecture Reference */}
      <PipelineOverview />
    </div>
  );
};
