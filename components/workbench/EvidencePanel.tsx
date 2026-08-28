"use client";

import React, { useState, useMemo } from "react";
import { EvidenceRetrievalResult, EvidenceStance } from "@/types";
import { EvidenceCard } from "./EvidenceCard";
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle,
  Inbox,
  AlertTriangle,
  Layers,
  LayoutGrid
} from "lucide-react";

interface EvidencePanelProps {
  evidence: EvidenceRetrievalResult;
  isSearching?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  isSearching = false
}) => {
  const [selectedClaimFilter, setSelectedClaimFilter] = useState<string>("ALL");
  const [selectedStanceFilter, setSelectedStanceFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"HIERARCHY" | "GRID">("HIERARCHY");

  // Determine evidence state: SEARCHING EVIDENCE | EVIDENCE FOUND | NO EVIDENCE FOUND | EVIDENCE ERROR
  const evidenceStatus: "SEARCHING EVIDENCE" | "EVIDENCE FOUND" | "NO EVIDENCE FOUND" | "EVIDENCE ERROR" = useMemo(() => {
    if (isSearching) return "SEARCHING EVIDENCE";
    if (evidence.status === "error" || Boolean(evidence.error)) return "EVIDENCE ERROR";
    if (evidence.totalSourcesFound === 0) return "NO EVIDENCE FOUND";
    return "EVIDENCE FOUND";
  }, [isSearching, evidence.status, evidence.error, evidence.totalSourcesFound]);

  // Distinct claim IDs
  const claimIds = useMemo(() => {
    return evidence.bundles.map((b) => b.claimId);
  }, [evidence.bundles]);

  // Filtered bundles for hierarchical view
  const filteredBundles = useMemo(() => {
    return evidence.bundles
      .filter((bundle) => selectedClaimFilter === "ALL" || bundle.claimId === selectedClaimFilter)
      .map((bundle) => {
        const filteredSources = bundle.sources.filter(
          (src) => selectedStanceFilter === "ALL" || src.stance === selectedStanceFilter
        );
        return {
          ...bundle,
          sources: filteredSources,
        };
      });
  }, [evidence.bundles, selectedClaimFilter, selectedStanceFilter]);

  // Flattened filtered sources for grid view
  const filteredAllSources = useMemo(() => {
    return evidence.allSources.filter((src) => {
      const matchesClaim = selectedClaimFilter === "ALL" || src.claimId === selectedClaimFilter;
      const matchesStance = selectedStanceFilter === "ALL" || src.stance === selectedStanceFilter;
      return matchesClaim && matchesStance;
    });
  }, [evidence.allSources, selectedClaimFilter, selectedStanceFilter]);

  // Stance breakdown counts
  const stanceCounts = useMemo(() => {
    const counts: Record<EvidenceStance, number> = {
      SUPPORTS: 0,
      CONTRADICTS: 0,
      MIXED: 0,
      INSUFFICIENT: 0,
      NEUTRAL: 0,
      UNCERTAIN: 0,
    };
    evidence.allSources.forEach((src) => {
      if (counts[src.stance] !== undefined) {
        counts[src.stance]++;
      }
    });
    return counts;
  }, [evidence.allSources]);

  return (
    <div id="evidence-panel" className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-xl p-6 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/15 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37] shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Web Evidence & Provenance Retrieval
              </h3>

              {/* State Badges: SEARCHING EVIDENCE | EVIDENCE FOUND | NO EVIDENCE FOUND | EVIDENCE ERROR */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                  evidenceStatus === "EVIDENCE FOUND"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                    : evidenceStatus === "SEARCHING EVIDENCE"
                    ? "bg-[#D4AF37]/10 text-[#E2C15C] border-[#D4AF37]/40 animate-pulse"
                    : evidenceStatus === "EVIDENCE ERROR"
                    ? "bg-rose-950/60 text-rose-300 border-rose-700/50"
                    : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                }`}
              >
                {evidenceStatus}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {evidence.totalSourcesFound > 0
                ? `Retrieved ${evidence.totalSourcesFound} deduplicated primary/secondary citations linked to ${evidence.bundles.length} atomic claims.`
                : "No external evidence citations returned for the current search parameters."}
            </p>
          </div>
        </div>

        {/* Stance Quick Badges & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {stanceCounts.SUPPORTS} Supporting
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {stanceCounts.CONTRADICTS} Refuting
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900/80 border border-stone-800 text-[#C2C9D6] flex items-center gap-1">
              <MinusCircle className="h-3 w-3" />
              {stanceCounts.NEUTRAL} Neutral
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {stanceCounts.UNCERTAIN} Uncertain
            </span>
          </div>

          <div className="hidden md:flex items-center p-0.5 rounded-lg bg-[#08090C] border border-[#D4AF37]/20 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("HIERARCHY")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === "HIERARCHY"
                  ? "bg-[#D4AF37]/20 text-[#F3E5B8] border border-[#D4AF37]/40 font-semibold"
                  : "text-[#94A3B8] hover:text-[#F8F9FA]"
              }`}
              title="Group by Atomic Claim Hierarchy"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === "GRID"
                  ? "bg-[#D4AF37]/20 text-[#F3E5B8] border border-[#D4AF37]/40 font-semibold"
                  : "text-[#94A3B8] hover:text-[#F8F9FA]"
              }`}
              title="All Evidence Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner if Tavily failed */}
      {evidence.error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Web Evidence Retrieval Warning</p>
            <p className="text-rose-400/90 font-mono text-[11px]">{evidence.error}</p>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#08090C] border border-[#D4AF37]/15 shadow-inner">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#94A3B8] flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-[#D4AF37]" />
            FILTER CLAIM:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClaimFilter("ALL")}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedClaimFilter === "ALL"
                ? "gold-gradient-bg text-[#08090C] font-bold shadow-sm"
                : "bg-[#131720] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-[#D4AF37]/30"
            }`}
          >
            ALL ({evidence.allSources.length})
          </button>
          {claimIds.map((cid) => {
            const count = evidence.allSources.filter((s) => s.claimId === cid).length;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedClaimFilter(cid)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedClaimFilter === cid
                    ? "gold-gradient-bg text-[#08090C] font-bold shadow-sm"
                    : "bg-[#131720] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-[#D4AF37]/30"
                }`}
              >
                {cid} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[#94A3B8]">STANCE:</span>
          {(["ALL", "SUPPORTS", "CONTRADICTS", "NEUTRAL", "UNCERTAIN"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStanceFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                  selectedStanceFilter === st
                    ? "bg-[#D4AF37]/30 text-[#F3E5B8] border border-[#D4AF37]/50 font-bold"
                    : "bg-[#131720] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-[#D4AF37]/30"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Evidence Content Display */}
      {viewMode === "HIERARCHY" ? (
        /* Hierarchical Claim -> Evidence Tree Grouping (C1 -> Sources, C2 -> Sources) */
        <div className="space-y-6">
          {filteredBundles.map((bundle) => (
            <div
              key={bundle.claimId}
              className="bg-[#08090C] border border-[#D4AF37]/20 rounded-xl p-5 space-y-4 transition-all shadow-inner"
            >
              {/* Claim Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-800 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#131720] border border-[#D4AF37]/40 text-[#E2C15C] font-mono font-bold text-xs tracking-wide">
                      CLAIM {bundle.claimId}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-mono flex items-center gap-1">
                      <Search className="h-3 w-3 text-[#D4AF37]" />
                      Targeted Query: &ldquo;<span className="text-[#E2C15C] font-sans italic">{bundle.query}</span>&rdquo;
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F8F9FA] pl-1 leading-snug">
                    {bundle.claimText}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#131720] border border-[#D4AF37]/20 text-[#E2C15C]">
                    {bundle.sources.length} {bundle.sources.length === 1 ? "Source" : "Sources"} Connected
                  </span>
                </div>
              </div>

              {/* Connected Evidence Items */}
              {bundle.sources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pl-2 sm:pl-4 border-l-2 border-[#D4AF37]/35">
                  {bundle.sources.map((source) => (
                    <EvidenceCard key={source.id} evidence={source} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#131720]/50 border border-dashed border-stone-800 text-xs text-[#64748B] flex items-center justify-center gap-2 font-mono">
                  <Inbox className="h-4 w-4 text-[#64748B]" />
                  <span>NO EVIDENCE FOUND for Claim {bundle.claimId} matching the active filters.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Unified Evidence Grid */
        filteredAllSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllSources.map((source) => (
              <EvidenceCard key={source.id} evidence={source} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-stone-800 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-[#131720] border border-stone-800 text-[#64748B]">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-[#C2C9D6]">No Evidence Matches Current Filter</p>
            <p className="text-xs text-[#64748B] max-w-sm">
              Try adjusting the claim or stance filters above to view other retrieved citations.
            </p>
          </div>
        )
      )}
    </div>
  );
};
