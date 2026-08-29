"use client";

import React from "react";
import { ClaimExtractionResult } from "@/types";
import { AtomicClaimCard } from "./AtomicClaimCard";
import { Split } from "lucide-react";

interface ClaimExtractionPanelProps {
  extraction: ClaimExtractionResult;
}

export const ClaimExtractionPanel: React.FC<ClaimExtractionPanelProps> = ({
  extraction,
}) => {
  const claims = extraction.claims || [];

  return (
    <div
      id="claim-extraction-panel"
      className="p-5 sm:p-6 space-y-5 font-mono"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Atomic Claim Decomposition
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                {claims.length} {claims.length === 1 ? "Unit Extracted" : "Units Extracted"}
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Compound assertion deconstructed into independent, fact-checkable propositions
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Atomic Claim Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {claims.map((claim) => (
          <AtomicClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
};
