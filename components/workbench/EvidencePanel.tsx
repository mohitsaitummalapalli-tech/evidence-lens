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
    <div className="bg-slate-900/80 border border-blue-500/40 rounded-xl p-6 shadow-xl shadow-blue-950/20 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Web Evidence & Provenance Retrieval
              </h3>

              {/* State Badges: SEARCHING EVIDENCE | EVIDENCE FOUND | NO EVIDENCE FOUND | EVIDENCE ERROR */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                  evidenceStatus === "EVIDENCE FOUND"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                    : evidenceStatus === "SEARCHING EVIDENCE"
                    ? "bg-cyan-950/60 text-cyan-300 border-cyan-700/50 animate-pulse"
                    : evidenceStatus === "EVIDENCE ERROR"
                    ? "bg-rose-950/60 text-rose-300 border-rose-700/50"
                    : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                }`}
              >
                {evidenceStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {evidence.totalSourcesFound > 0
                ? `Retrieved ${evidence.totalSourcesFound} deduplicated primary/secondary citations linked to ${evidence.bundles.length} atomic claims.`
                : "No external evidence citations returned for the current search parameters."}
            </p>
          </div>
        </div>

        {/* Stance Quick Badges & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {stanceCounts.SUPPORTS} Supporting
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {stanceCounts.CONTRADICTS} Refuting
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300 flex items-center gap-1">
              <MinusCircle className="h-3 w-3" />
              {stanceCounts.NEUTRAL} Neutral
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {stanceCounts.UNCERTAIN} Uncertain
            </span>
          </div>

          <div className="hidden md:flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("HIERARCHY")}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === "HIERARCHY"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Group by Atomic Claim Hierarchy"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === "GRID"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            FILTER CLAIM:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClaimFilter("ALL")}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedClaimFilter === "ALL"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
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
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedClaimFilter === cid
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cid} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500">STANCE:</span>
          {(["ALL", "SUPPORTS", "CONTRADICTS", "NEUTRAL", "UNCERTAIN"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStanceFilter(st)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  selectedStanceFilter === st
                    ? "bg-blue-500 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
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
              className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-5 space-y-4 transition-all"
            >
              {/* Claim Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 font-mono font-bold text-xs tracking-wide">
                      CLAIM {bundle.claimId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Search className="h-3 w-3 text-slate-500" />
                      Targeted Query: &ldquo;<span className="text-cyan-400/90 font-sans italic">{bundle.query}</span>&rdquo;
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 pl-1 leading-snug">
                    {bundle.claimText}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {bundle.sources.length} {bundle.sources.length === 1 ? "Source" : "Sources"} Connected
                  </span>
                </div>
              </div>

              {/* Connected Evidence Items */}
              {bundle.sources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pl-2 sm:pl-4 border-l-2 border-cyan-500/20">
                  {bundle.sources.map((source) => (
                    <EvidenceCard key={source.id} evidence={source} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-800/80 text-xs text-slate-500 flex items-center justify-center gap-2 font-mono">
                  <Inbox className="h-4 w-4 text-slate-600" />
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
          <div className="p-8 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-300">No Evidence Matches Current Filter</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Try adjusting the claim or stance filters above to view other retrieved citations.
            </p>
          </div>
        )
      )}
    </div>
  );
};
