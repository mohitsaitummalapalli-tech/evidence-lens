"use client";

import React from "react";
import { ClaimExtractionResult } from "@/types";
import { AtomicClaimCard } from "./AtomicClaimCard";
import { Sparkles, Split, Info, Camera } from "lucide-react";

interface ClaimExtractionPanelProps {
  extraction: ClaimExtractionResult;
}

export const ClaimExtractionPanel: React.FC<ClaimExtractionPanelProps> = ({
  extraction,
}) => {
  return (
    <div id="claim-extraction-panel" className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2A3038] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
                Claim Breakdown
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#D9DEE5] border border-[#2A3038] font-semibold uppercase">
                {extraction.claims.length} {extraction.claims.length === 1 ? "Claim" : "Claims"}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] mt-0.5 font-sans">
              Statement broken down into individual verifiable assertions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#080A0D] px-3 py-1.5 rounded border border-[#2A3038] self-start sm:self-auto font-mono text-xs text-[#A7AFB8]">
          <Sparkles className="h-3.5 w-3.5 text-[#D9DEE5]" />
          <span>{extraction.claims.length} Claims Identified</span>
        </div>
      </div>

      {/* Original Compound Assertion */}
      <div className="bg-[#080A0D] border border-[#2A3038] rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#707984]">
          <span className="flex items-center gap-1.5 text-[#F3F5F7] font-semibold">
            <Info className="h-3.5 w-3.5 text-[#D9DEE5]" />
            Original Input Statement
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#F3F5F7] font-sans leading-relaxed italic">
          &ldquo;{extraction.originalClaim}&rdquo;
        </p>
        {extraction.contextUrl && (
          <p className="text-xs text-[#707984] font-mono pt-1 truncate">
            Source Context: <span className="text-[#38BDF8]">{extraction.contextUrl}</span>
          </p>
        )}
      </div>

      {/* Visual Context Badge (if image was processed) */}
      {extraction.mediaContext && (
        <div className="bg-[#080A0D] border border-[#2A3038] rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#38BDF8] font-mono font-semibold uppercase">
            <Camera className="h-4 w-4" />
            <span>Extracted Visual Context</span>
          </div>
          <p className="text-[#A7AFB8] font-sans leading-relaxed">
            {extraction.mediaContext}
          </p>
        </div>
      )}

      {/* Grid of Atomic Claims */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#707984] pb-1 border-b border-[#2A3038]">
          <span className="font-semibold text-[#F3F5F7]">
            Individual Claims ({extraction.claims.length})
          </span>
          <span>Evaluated individually against retrieved evidence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {extraction.claims.map((claim) => (
            <AtomicClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      </div>
    </div>
  );
};
