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
    <div id="claim-extraction-panel" className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <Split className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Claim Breakdown
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-500/30 font-semibold uppercase">
                {extraction.claims.length} {extraction.claims.length === 1 ? "Claim" : "Claims"}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Statement broken down into individual verifiable claims.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0B0D11] px-3.5 py-2 rounded-xl border border-stone-800 self-start sm:self-auto font-sans text-xs text-[#CBD5E1] shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-red-400" />
          <span>{extraction.claims.length} Claims Identified</span>
        </div>
      </div>

      {/* Original Compound Assertion */}
      <div className="bg-[#0B0D11] border border-stone-800 rounded-xl p-4 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs font-sans text-[#94A3B8]">
          <span className="flex items-center gap-1.5 text-[#F8F9FA] font-semibold">
            <Info className="h-3.5 w-3.5 text-red-400" />
            Original Input Statement
          </span>
        </div>
        <p className="text-sm text-[#F8F9FA] font-sans leading-relaxed italic">
          &ldquo;{extraction.originalClaim}&rdquo;
        </p>
        {extraction.contextUrl && (
          <p className="text-xs text-[#94A3B8] font-mono pt-1 truncate">
            Source Context: <span className="text-red-400">{extraction.contextUrl}</span>
          </p>
        )}
      </div>

      {/* Visual Context Badge (if image was processed) */}
      {extraction.mediaContext && (
        <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-red-300 font-semibold uppercase">
            <Camera className="h-4 w-4 text-red-400" />
            <span>Extracted Visual Context</span>
          </div>
          <p className="text-[#CBD5E1] font-sans leading-relaxed">
            {extraction.mediaContext}
          </p>
        </div>
      )}

      {/* Grid of Atomic Claims */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-semibold text-[#F8F9FA]">
            Individual Claims ({extraction.claims.length})
          </span>
          <span>Evaluated individually for evidence stance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extraction.claims.map((claim) => (
            <AtomicClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      </div>
    </div>
  );
};
