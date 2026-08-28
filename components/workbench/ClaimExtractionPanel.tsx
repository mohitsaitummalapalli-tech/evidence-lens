"use client";

import React from "react";
import { ClaimExtractionResult } from "@/types";
import { AtomicClaimCard } from "./AtomicClaimCard";
import { Sparkles, Split, Info, Layers, Camera } from "lucide-react";

interface ClaimExtractionPanelProps {
  extraction: ClaimExtractionResult;
}

export const ClaimExtractionPanel: React.FC<ClaimExtractionPanelProps> = ({
  extraction,
}) => {
  return (
    <div id="claim-extraction-panel" className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-xl p-6 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/15 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37] shadow-sm">
            <Split className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                AI Claim Deconstruction
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30 font-semibold uppercase">
                STAGE: AI CLAIM EXTRACTION
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Target assertion decomposed into {extraction.claims.length} atomic verifiable units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#08090C] px-3.5 py-2 rounded-xl border border-[#D4AF37]/20 self-start sm:self-auto font-mono text-xs text-[#E2C15C] shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span>{extraction.claims.length} Claims Identified</span>
        </div>
      </div>

      {/* Original Compound Assertion */}
      <div className="bg-[#08090C] border border-[#D4AF37]/15 rounded-xl p-4 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5 text-[#E2C15C] font-semibold">
            <Info className="h-3.5 w-3.5 text-[#D4AF37]" />
            ORIGINAL COMPOUND ASSERTION
          </span>
          <span className="text-[11px] text-[#64748B]">Unprocessed Input</span>
        </div>
        <p className="text-sm text-[#F8F9FA] font-sans leading-relaxed italic">
          &ldquo;{extraction.originalClaim}&rdquo;
        </p>
        {extraction.contextUrl && (
          <p className="text-xs text-[#94A3B8] font-mono pt-1 truncate">
            Source Context: <span className="text-[#E2C15C]">{extraction.contextUrl}</span>
          </p>
        )}
      </div>

      {/* Multimodal & Extraction Notes (if present) */}
      {(extraction.overallExtractionNotes || extraction.mediaContext) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {extraction.overallExtractionNotes && (
            <div className="bg-[#08090C] border border-stone-800 rounded-xl p-3.5 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 font-mono text-[#E2C15C] font-medium">
                <Layers className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Deconstruction Rationale</span>
              </div>
              <p className="text-[#C2C9D6] leading-relaxed font-sans text-xs">
                {extraction.overallExtractionNotes}
              </p>
            </div>
          )}

          {extraction.mediaContext && (
            <div className="bg-[#08090C] border border-stone-800 rounded-xl p-3.5 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 font-mono text-amber-400 font-medium">
                <Camera className="h-3.5 w-3.5 text-amber-400" />
                <span>Artifact Grounding</span>
              </div>
              <p className="text-[#C2C9D6] leading-relaxed font-sans text-xs">
                {extraction.mediaContext}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Atomic Claims Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-[#E2C15C] tracking-wider uppercase font-mono">
            Extracted Atomic Claims ({extraction.claims.length})
          </h4>
          <span className="text-[11px] font-mono text-[#64748B]">
            Click-free Independent Units
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extraction.claims.map((claim, idx) => (
            <AtomicClaimCard key={claim.id || idx} claim={claim} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};
