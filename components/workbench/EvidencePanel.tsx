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
}) => {
  const [selectedClaimFilter, setSelectedClaimFilter] = useState<string>("ALL");
  const [selectedStanceFilter, setSelectedStanceFilter] = useState<string>("ALL");
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grouped" | "grid">("grid");

  const sources = useMemo(() => evidence.allSources || [], [evidence.allSources]);

  // Calculate high-level metrics
  const uniqueDomainsCount = useMemo(() => {
    return new Set(sources.map((s) => s.domain)).size;
  }, [sources]);

  const sourceDiversity = useMemo(() => {
    return sourceQualityService.calculateSourceDiversity(sources);
  }, [sources]);

  // Extract all available claim IDs for filtering
  const availableClaimIds = useMemo(() => {
    const ids = new Set<string>();
    sources.forEach((s) => {
      if (s.claimId) ids.add(s.claimId);
    });
    return Array.from(ids);
  }, [sources]);

  // Filter sources
  const filteredSources = useMemo(() => {
    return sources.filter((item) => {
      if (selectedClaimFilter !== "ALL" && item.claimId !== selectedClaimFilter) {
        return false;
      }
      if (selectedStanceFilter !== "ALL" && item.stance !== selectedStanceFilter) {
        return false;
      }
      if (selectedSourceTypeFilter !== "ALL" && item.sourceType !== selectedSourceTypeFilter) {
        return false;
      }
      return true;
    });
  }, [sources, selectedClaimFilter, selectedStanceFilter, selectedSourceTypeFilter]);

  return (
    <div id="evidence-panel" className="p-5 sm:p-6 space-y-5 font-mono">
      {/* Header & High-Level Source Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Grounded Source Intelligence
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                {sources.length} Sources Found
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Primary citations retrieved from open web, academic repositories, and video archives
            </p>
          </div>
        </div>

        {/* Intelligence Scoreboard */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#D7DADF]">
          <div className="px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
            <span className="text-[#8D949D]">Domains: </span>
            <strong className="text-[#D4AF5A]">{uniqueDomainsCount}</strong>
          </div>
          <div className="px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
            <span className="text-[#8D949D]">Diversity: </span>
            <strong className="text-emerald-400">{sourceDiversity.diversityLevel}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.2)] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#8D949D] flex items-center gap-1 text-[11px]">
            <Filter className="h-3 w-3 text-[#D4AF5A]" /> Filters:
          </span>

          {/* Stance Filter */}
          <select
            value={selectedStanceFilter}
            onChange={(e) => setSelectedStanceFilter(e.target.value)}
            className="bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] focus:border-[#D4AF5A] text-[#F5F7FA] rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Stances</option>
            <option value="SUPPORTS">Supports</option>
            <option value="CONTRADICTS">Contradicts</option>
            <option value="NEUTRAL">Neutral / Referred</option>
          </select>

          {/* Source Type Filter */}
          <select
            value={selectedSourceTypeFilter}
            onChange={(e) => setSelectedSourceTypeFilter(e.target.value)}
            className="bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] focus:border-[#D4AF5A] text-[#F5F7FA] rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Media Types</option>
            <option value="web">Web Articles</option>
            <option value="youtube">YouTube / Video</option>
            <option value="academic">Academic Papers</option>
          </select>

          {/* Claim Filter (if multiple) */}
          {availableClaimIds.length > 1 && (
            <select
              value={selectedClaimFilter}
              onChange={(e) => setSelectedClaimFilter(e.target.value)}
              className="bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] focus:border-[#D4AF5A] text-[#F5F7FA] rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Atomic Claims</option>
              {availableClaimIds.map((cid) => (
                <option key={cid} value={cid}>Claim {cid}</option>
              ))}
            </select>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-[#131519] text-[#D4AF5A] border border-[rgba(212,175,90,0.35)]"
                : "text-[#8D949D] hover:text-[#F5F7FA]"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grouped"
                ? "bg-[#131519] text-[#D4AF5A] border border-[rgba(212,175,90,0.35)]"
                : "text-[#8D949D] hover:text-[#F5F7FA]"
            }`}
            title="Grouped View"
          >
            <Layers className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sources Grid / List */}
      {filteredSources.length === 0 ? (
        <div className="py-8 text-center bg-[#050607] border border-[rgba(212,175,90,0.2)] rounded-lg text-xs text-[#8D949D]">
          No evidence sources match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
