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
    <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-6 shadow-xl shadow-cyan-950/20 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Split className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                AI Claim Deconstruction
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold uppercase">
                STAGE: AI CLAIM EXTRACTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target assertion decomposed into {extraction.claims.length} atomic verifiable units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto font-mono text-xs text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>{extraction.claims.length} Claims Identified</span>
        </div>
      </div>

      {/* Original Compound Assertion */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Info className="h-3.5 w-3.5" />
            ORIGINAL COMPOUND ASSERTION
          </span>
          <span className="text-[11px] text-slate-500">Unprocessed Input</span>
        </div>
        <p className="text-sm text-slate-200 font-sans leading-relaxed italic">
          &ldquo;{extraction.originalClaim}&rdquo;
        </p>
        {extraction.contextUrl && (
          <p className="text-xs text-slate-400 font-mono pt-1 truncate">
            Source Context: <span className="text-blue-400">{extraction.contextUrl}</span>
          </p>
        )}
      </div>

      {/* Multimodal & Extraction Notes (if present) */}
      {(extraction.overallExtractionNotes || extraction.mediaContext) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {extraction.overallExtractionNotes && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-slate-400 font-medium">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Deconstruction Rationale</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                {extraction.overallExtractionNotes}
              </p>
            </div>
          )}

          {extraction.mediaContext && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-slate-400 font-medium">
                <Camera className="h-3.5 w-3.5 text-amber-400" />
                <span>Artifact Grounding</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                {extraction.mediaContext}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Atomic Claims Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono">
            Extracted Atomic Claims ({extraction.claims.length})
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
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
