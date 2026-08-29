"use client";

import React, { useState, useMemo } from "react";
import { EvidenceRetrievalResult } from "@/types";
import { EvidenceCard } from "./EvidenceCard";
import { sourceQualityService } from "@/lib/evidence/sourceQuality";
import {
  Database,
  Filter,
  Layers,
  LayoutGrid,
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
    <div id="evidence-panel" className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2A3038] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
                Grounded Evidence Sources
              </h3>

              {/* State Badges */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase border ${
                  evidenceStatus === "EVIDENCE FOUND"
                    ? "bg-emerald-950/30 text-emerald-300 border-emerald-800/40"
                    : evidenceStatus === "SEARCHING EVIDENCE"
                    ? "bg-[#161B21] text-[#D9DEE5] border-[#343B45] animate-pulse"
                    : evidenceStatus === "EVIDENCE ERROR"
                    ? "bg-rose-950/30 text-rose-300 border-rose-800/40"
                    : "bg-amber-950/30 text-amber-300 border-amber-800/40"
                }`}
              >
                {evidenceStatus}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] mt-0.5 font-sans">
              {evidence.totalSourcesFound > 0
                ? `${evidence.totalSourcesFound} external sources indexed across ${diversitySummary.uniqueDomainCount} independent domains.`
                : "No external evidence sources returned for the current search parameters."}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="hidden md:flex items-center p-0.5 rounded bg-[#080A0D] border border-[#2A3038] text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode("HIERARCHY")}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewMode === "HIERARCHY"
                ? "bg-[#161B21] text-white border border-[#343B45] font-semibold"
                : "text-[#707984] hover:text-[#F3F5F7]"
            }`}
            title="Group by Claim"
          >
            <Layers className="h-3.5 w-3.5 text-[#B8C0C9]" />
            <span>Grouped</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewMode === "GRID"
                ? "bg-[#161B21] text-white border border-[#343B45] font-semibold"
                : "text-[#707984] hover:text-[#F3F5F7]"
            }`}
            title="Flat Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-[#B8C0C9]" />
            <span>All Sources ({evidence.allSources.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-[#080A0D] border border-[#2A3038] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#707984] flex items-center gap-1 font-semibold text-[11px]">
            <Filter className="h-3.5 w-3.5 text-[#B8C0C9]" />
            FILTERS:
          </span>

          {/* Claim Filter */}
          {claimIds.length > 1 && (
            <select
              value={selectedClaimFilter}
              onChange={(e) => setSelectedClaimFilter(e.target.value)}
              className="bg-[#161B21] border border-[#2A3038] rounded px-2.5 py-1 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#D9DEE5]"
            >
              <option value="ALL">All Claims ({evidence.bundles.length})</option>
              {claimIds.map((cid) => (
                <option key={cid} value={cid}>
                  Claim {cid}
                </option>
              ))}
            </select>
          )}

          {/* Stance Filter */}
          <select
            value={selectedStanceFilter}
            onChange={(e) => setSelectedStanceFilter(e.target.value)}
            className="bg-[#161B21] border border-[#2A3038] rounded px-2.5 py-1 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#D9DEE5]"
          >
            <option value="ALL">All Stances</option>
            <option value="SUPPORTS">Supports Only</option>
            <option value="CONTRADICTS">Contradicts Only</option>
            <option value="MIXED">Mixed Only</option>
            <option value="INSUFFICIENT">Insufficient Only</option>
          </select>

          {/* Source Type Filter */}
          <select
            value={selectedSourceTypeFilter}
            onChange={(e) => setSelectedSourceTypeFilter(e.target.value)}
            className="bg-[#161B21] border border-[#2A3038] rounded px-2.5 py-1 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#D9DEE5]"
          >
            <option value="ALL">All Media Types</option>
            <option value="web">Web Sources</option>
            <option value="youtube">YouTube Videos</option>
            <option value="academic">Academic Papers</option>
            <option value="video_portal">Video Portals</option>
          </select>
        </div>

        {/* Domain Count Tag */}
        <div className="text-[11px] text-[#707984]">
          Showing <span className="text-[#F3F5F7] font-bold">{filteredAllSources.length}</span> of {evidence.totalSourcesFound} sources
        </div>
      </div>

      {/* Sources Display Body */}
      {evidence.totalSourcesFound === 0 ? (
        <div className="p-8 text-center bg-[#080A0D] border border-[#2A3038] rounded-lg space-y-2">
          <p className="text-xs font-mono text-[#A7AFB8]">
            No evidence sources currently available for this assertion.
          </p>
        </div>
      ) : viewMode === "HIERARCHY" ? (
        <div className="space-y-6">
          {filteredBundles.map((bundle) => {
            if (bundle.sources.length === 0 && selectedClaimFilter !== "ALL") return null;

            return (
              <div key={bundle.claimId} className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2A3038]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#161B21] border border-[#2A3038] text-[#F3F5F7] font-mono font-bold text-xs">
                      {bundle.claimId}
                    </span>
                    <span className="text-xs font-semibold text-[#F3F5F7] font-sans line-clamp-1">
                      &ldquo;{bundle.claimText}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#707984]">
                    {bundle.sources.length} sources
                  </span>
                </div>

                {bundle.sources.length === 0 ? (
                  <div className="p-4 rounded bg-[#080A0D] border border-[#2A3038] text-xs font-mono text-[#707984]">
                    No sources match the selected filters for Claim {bundle.claimId}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bundle.sources.map((src) => (
                      <EvidenceCard key={src.id} evidence={src} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllSources.map((src) => (
            <EvidenceCard key={src.id} evidence={src} />
          ))}
        </div>
      )}
    </div>
  );
};
