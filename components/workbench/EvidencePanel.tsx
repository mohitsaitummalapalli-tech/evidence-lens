"use client";

import React, { useState, useMemo } from "react";
import { EvidenceItem, EvidenceRetrievalResult } from "@/types";
import { EvidenceCard } from "./EvidenceCard";
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle,
  Inbox
} from "lucide-react";

interface EvidencePanelProps {
  evidence: EvidenceRetrievalResult;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence }) => {
  const [selectedClaimFilter, setSelectedClaimFilter] = useState<string>("ALL");
  const [selectedStanceFilter, setSelectedStanceFilter] = useState<string>("ALL");

  // Get distinct claim IDs from bundles
  const claimIds = useMemo(() => {
    return evidence.bundles.map((b) => b.claimId);
  }, [evidence.bundles]);

  // Filter sources based on selected claim and stance
  const filteredSources: EvidenceItem[] = useMemo(() => {
    return evidence.allSources.filter((src) => {
      const matchesClaim =
        selectedClaimFilter === "ALL" || src.claimId === selectedClaimFilter;
      const matchesStance =
        selectedStanceFilter === "ALL" || src.stance === selectedStanceFilter;
      return matchesClaim && matchesStance;
    });
  }, [evidence.allSources, selectedClaimFilter, selectedStanceFilter]);

  // Count stances
  const stanceCounts = useMemo(() => {
    const counts = { SUPPORTS: 0, CONTRADICTS: 0, NEUTRAL: 0, UNCERTAIN: 0 };
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold uppercase">
                STAGE: EVIDENCE RETRIEVED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Retrieved and stance-classified {evidence.totalSourcesFound} primary and secondary sources via Tavily Web Search.
            </p>
          </div>
        </div>

        {/* Stance Quick Badges */}
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
      </div>

      {/* Query Transparency Inspector */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <Search className="h-3.5 w-3.5" />
            TARGETED SEARCH QUERIES DISPATCHED
          </span>
          <span className="text-[11px] text-slate-500">Tavily Search Engine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {evidence.bundles.map((bundle) => (
            <div
              key={bundle.claimId}
              className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-400">{bundle.claimId} Query</span>
                <span className="text-slate-400">{bundle.sources.length} sources</span>
              </div>
              <p className="text-slate-300 text-[11px] truncate" title={bundle.query}>
                &ldquo;{bundle.query}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            CLAIM:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClaimFilter("ALL")}
            className={`px-2 py-1 rounded transition-colors ${
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
                className={`px-2 py-1 rounded transition-colors ${
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

      {/* Evidence Cards Grid */}
      {filteredSources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => (
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
      )}
    </div>
  );
};
