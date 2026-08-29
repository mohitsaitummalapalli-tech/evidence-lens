"use client";

import React, { useState, useMemo } from "react";
import { EvidenceRetrievalResult } from "@/types";
import { EvidenceCard } from "./EvidenceCard";
import { sourceQualityService } from "@/lib/evidence/sourceQuality";
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Inbox,
  AlertTriangle,
  Layers,
  LayoutGrid,
  Network,
  Scale
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
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"HIERARCHY" | "GRID">("HIERARCHY");

  // Determine evidence state
  const evidenceStatus: "SEARCHING EVIDENCE" | "EVIDENCE FOUND" | "NO EVIDENCE FOUND" | "EVIDENCE ERROR" = useMemo(() => {
    if (isSearching) return "SEARCHING EVIDENCE";
    if (evidence.status === "error" || Boolean(evidence.error)) return "EVIDENCE ERROR";
    if (evidence.totalSourcesFound === 0) return "NO EVIDENCE FOUND";
    return "EVIDENCE FOUND";
  }, [isSearching, evidence.status, evidence.error, evidence.totalSourcesFound]);

  // Compute Source Diversity & Consensus via deterministic service
  const diversitySummary = useMemo(() => {
    return sourceQualityService.calculateSourceDiversity(evidence.allSources);
  }, [evidence.allSources]);

  const consensusSummary = useMemo(() => {
    return sourceQualityService.calculateEvidenceConsensus(evidence.allSources);
  }, [evidence.allSources]);

  // Distinct claim IDs
  const claimIds = useMemo(() => {
    return evidence.bundles.map((b) => b.claimId);
  }, [evidence.bundles]);

  // Filtered bundles for hierarchical view
  const filteredBundles = useMemo(() => {
    return evidence.bundles
      .filter((bundle) => selectedClaimFilter === "ALL" || bundle.claimId === selectedClaimFilter)
      .map((bundle) => {
        const filteredSources = bundle.sources.filter((src) => {
          const matchesStance = selectedStanceFilter === "ALL" || src.stance === selectedStanceFilter;
          const matchesType = selectedSourceTypeFilter === "ALL" || (src.sourceType || "web") === selectedSourceTypeFilter;
          return matchesStance && matchesType;
        });
        return {
          ...bundle,
          sources: filteredSources,
        };
      });
  }, [evidence.bundles, selectedClaimFilter, selectedStanceFilter, selectedSourceTypeFilter]);

  // Flattened filtered sources for grid view
  const filteredAllSources = useMemo(() => {
    return evidence.allSources.filter((src) => {
      const matchesClaim = selectedClaimFilter === "ALL" || src.claimId === selectedClaimFilter;
      const matchesStance = selectedStanceFilter === "ALL" || src.stance === selectedStanceFilter;
      const matchesType = selectedSourceTypeFilter === "ALL" || (src.sourceType || "web") === selectedSourceTypeFilter;
      return matchesClaim && matchesStance && matchesType;
    });
  }, [evidence.allSources, selectedClaimFilter, selectedStanceFilter, selectedSourceTypeFilter]);

  return (
    <div id="evidence-panel" className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Web & Video Evidence Sources
              </h3>

              {/* State Badges */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase border ${
                  evidenceStatus === "EVIDENCE FOUND"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                    : evidenceStatus === "SEARCHING EVIDENCE"
                    ? "bg-red-950/40 text-red-300 border-red-500/40 animate-pulse"
                    : evidenceStatus === "EVIDENCE ERROR"
                    ? "bg-red-950/60 text-red-300 border-red-700/50"
                    : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                }`}
              >
                {evidenceStatus}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {evidence.totalSourcesFound > 0
                ? `${evidence.totalSourcesFound} verified web and video sources across ${diversitySummary.uniqueDomainCount} independent domains.`
                : "No external evidence sources returned for the current search parameters."}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden md:flex items-center p-0.5 rounded-lg bg-[#0B0D11] border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("HIERARCHY")}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === "HIERARCHY"
                ? "bg-[#161B24] text-white border border-stone-700 font-semibold"
                : "text-[#94A3B8] hover:text-[#F8F9FA]"
            }`}
            title="Group by Claim"
          >
            <Layers className="h-3.5 w-3.5 text-red-400" />
            <span>Grouped</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === "GRID"
                ? "bg-[#161B24] text-white border border-stone-700 font-semibold"
                : "text-[#94A3B8] hover:text-[#F8F9FA]"
            }`}
            title="All Sources Grid"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-red-400" />
            <span>All Sources</span>
          </button>
        </div>
      </div>

      {/* Source Diversity & Evidence Balance Summary Bars */}
      {evidence.totalSourcesFound > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Source Diversity Breakdown */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-stone-800 space-y-3 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="flex items-center gap-1.5 text-[#F8F9FA] font-bold">
                <Network className="h-4 w-4 text-red-400" />
                SOURCE DIVERSITY
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161B24] text-[#CBD5E1] border border-stone-800">
                {diversitySummary.uniqueDomainCount} Unique {diversitySummary.uniqueDomainCount === 1 ? "Domain" : "Domains"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-[#11141A] border border-stone-800">
                <span className="text-[#94A3B8] block">TOTAL</span>
                <span className="text-base font-bold text-[#F8F9FA]">{diversitySummary.totalSources}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#11141A] border border-stone-800">
                <span className="text-[#94A3B8] block">WEB</span>
                <span className="text-base font-bold text-cyan-300">{diversitySummary.webCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#11141A] border border-stone-800">
                <span className="text-[#94A3B8] block">YOUTUBE</span>
                <span className="text-base font-bold text-red-400">{diversitySummary.youtubeCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#11141A] border border-stone-800">
                <span className="text-[#94A3B8] block">ACADEMIC</span>
                <span className="text-base font-bold text-blue-300">{diversitySummary.academicCount}</span>
              </div>
            </div>

            <div className="text-[11px] text-[#94A3B8] font-sans flex items-center justify-between pt-1">
              <span>Domain Cross-Referencing:</span>
              <span className="text-[#F8F9FA] font-semibold">
                {diversitySummary.isMultiDomain ? "Multi-Domain Corroboration" : "Single Domain (Limited Diversity)"}
              </span>
            </div>
          </div>

          {/* Evidence Consensus & Balance Bar */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-stone-800 space-y-3 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="flex items-center gap-1.5 text-[#F8F9FA] font-bold">
                <Scale className="h-4 w-4 text-red-400" />
                EVIDENCE BALANCE
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                consensusSummary.balance === "SUPPORTING"
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60"
                  : consensusSummary.balance === "CONTRADICTING"
                  ? "bg-red-950/70 text-red-300 border-red-700/60"
                  : consensusSummary.balance === "MIXED"
                  ? "bg-amber-950/70 text-amber-300 border-amber-700/60"
                  : "bg-stone-900 text-stone-300 border-stone-700"
              }`}>
                {consensusSummary.balance}
              </span>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-stone-900 overflow-hidden flex border border-stone-800">
                <div
                  style={{ width: `${consensusSummary.supportPercentage}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Supporting: ${consensusSummary.supportPercentage}%`}
                />
                <div
                  style={{ width: `${consensusSummary.contradictPercentage}%` }}
                  className="bg-red-500 h-full transition-all"
                  title={`Refuting: ${consensusSummary.contradictPercentage}%`}
                />
                <div
                  style={{ width: `${consensusSummary.neutralPercentage}%` }}
                  className="bg-stone-700 h-full transition-all"
                  title={`Neutral/Uncertain: ${consensusSummary.neutralPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  {consensusSummary.supportingCount} Supporting ({consensusSummary.supportPercentage}%)
                </span>
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <XCircle className="h-3 w-3" />
                  {consensusSummary.contradictingCount} Refuting ({consensusSummary.contradictPercentage}%)
                </span>
                <span className="flex items-center gap-1 text-[#CBD5E1]">
                  <MinusCircle className="h-3 w-3" />
                  {consensusSummary.neutralCount} Neutral
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#94A3B8] font-sans pt-0.5">
              Evidence balance derived directly from retrieved publication stances without weight fabrication.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner if Tavily failed */}
      {evidence.error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Web Evidence Retrieval Warning</p>
            <p className="text-red-400/90 font-mono text-[11px]">{evidence.error}</p>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0B0D11] border border-stone-800 shadow-inner">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#94A3B8] flex items-center gap-1 font-medium">
            <Filter className="h-3.5 w-3.5 text-red-400" />
            Filter Claim:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClaimFilter("ALL")}
            className={`px-3 py-1 rounded-lg transition-all font-medium ${
              selectedClaimFilter === "ALL"
                ? "bg-red-600 text-white shadow-sm font-semibold"
                : "bg-[#161B24] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-stone-700"
            }`}
          >
            All ({evidence.allSources.length})
          </button>
          {claimIds.map((cid) => {
            const count = evidence.allSources.filter((s) => s.claimId === cid).length;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedClaimFilter(cid)}
                className={`px-3 py-1 rounded-lg transition-all font-mono ${
                  selectedClaimFilter === cid
                    ? "bg-red-600 text-white shadow-sm font-semibold"
                    : "bg-[#161B24] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-stone-700"
                }`}
              >
                {cid} ({count})
              </button>
            );
          })}
        </div>

        {/* Stance Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#94A3B8]">Stance:</span>
          {(["ALL", "SUPPORTS", "CONTRADICTS", "NEUTRAL", "UNCERTAIN"] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStanceFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                  selectedStanceFilter === st
                    ? "bg-red-950/70 text-red-200 border border-red-500/50 font-bold"
                    : "bg-[#161B24] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-stone-700"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Source Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#94A3B8]">Type:</span>
          {(["ALL", "web", "youtube", "academic"] as const).map(
            (stype) => (
              <button
                key={stype}
                type="button"
                onClick={() => setSelectedSourceTypeFilter(stype)}
                className={`px-2.5 py-1 rounded-lg text-[11px] uppercase transition-all ${
                  selectedSourceTypeFilter === stype
                    ? "bg-[#161B24] text-white border border-stone-600 font-bold"
                    : "bg-[#0B0D11] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 hover:border-stone-700"
                }`}
              >
                {stype}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Evidence Content Display */}
      {viewMode === "HIERARCHY" ? (
        /* Hierarchical Claim -> Evidence Tree Grouping */
        <div className="space-y-6">
          {filteredBundles.map((bundle) => (
            <div
              key={bundle.claimId}
              className="bg-[#0B0D11] border border-stone-800 rounded-xl p-5 space-y-4 transition-all shadow-inner"
            >
              {/* Claim Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-800 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#F8F9FA] font-mono font-bold text-xs">
                      CLAIM {bundle.claimId}
                    </span>
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                      <Search className="h-3 w-3 text-red-400" />
                      Search Query: &ldquo;<span className="text-[#F8F9FA] italic">{bundle.query}</span>&rdquo;
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F8F9FA] pl-1 leading-snug">
                    {bundle.claimText}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-sans px-2.5 py-1 rounded-lg bg-[#161B24] border border-stone-800 text-[#CBD5E1]">
                    {bundle.sources.length} {bundle.sources.length === 1 ? "Source" : "Sources"} Connected
                  </span>
                </div>
              </div>

              {/* Connected Evidence Items */}
              {bundle.sources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pl-2 sm:pl-4 border-l-2 border-red-500/40">
                  {bundle.sources.map((source) => (
                    <EvidenceCard key={source.id} evidence={source} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#161B24]/40 border border-dashed border-stone-800 text-xs text-[#94A3B8] flex items-center justify-center gap-2">
                  <Inbox className="h-4 w-4" />
                  <span>No evidence found for Claim {bundle.claimId} matching active filters.</span>
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
            <div className="p-3 rounded-full bg-[#161B24] border border-stone-800 text-[#94A3B8]">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-[#F8F9FA]">No Evidence Matches Current Filter</p>
            <p className="text-xs text-[#94A3B8] max-w-sm">
              Try adjusting the claim or stance filters above to view other retrieved citations.
            </p>
          </div>
        )
      )}
    </div>
  );
};
