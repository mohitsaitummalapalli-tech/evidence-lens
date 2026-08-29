"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  InvestigationHistoryRecord,
  HistorySortOption,
  HistoryVerdictFilter,
  OverallVerdictType,
} from "@/types";
import {
  getInvestigationHistory,
  deleteHistoryItem,
  clearInvestigationHistory,
  subscribeToHistory,
} from "@/lib/history/storage";
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  Filter,
  ArrowUpDown,
  Layers,
  Database,
  ImageIcon,
  CheckSquare,
  Square,
} from "lucide-react";

interface InvestigationHistoryProps {
  onOpenInvestigation: (record: InvestigationHistoryRecord) => void;
  onCompareInvestigations: (
    recordA: InvestigationHistoryRecord,
    recordB: InvestigationHistoryRecord
  ) => void;
  lastUpdatedTimestamp?: string | number;
}

const VERDICT_BADGE_STYLES: Record<
  OverallVerdictType,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  VERIFIED: {
    label: "VERIFIED",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    icon: ShieldCheck,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-700/50",
    icon: ShieldX,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
    icon: ShieldAlert,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
};

const VERDICT_FILTERS: HistoryVerdictFilter[] = [
  "ALL",
  "VERIFIED",
  "FALSE",
  "MIXED",
  "UNVERIFIED",
];

export const InvestigationHistory: React.FC<InvestigationHistoryProps> = ({
  onOpenInvestigation,
  onCompareInvestigations,
}) => {
  const [history, setHistory] = useState<InvestigationHistoryRecord[]>(() => getInvestigationHistory());
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<HistoryVerdictFilter>("ALL");
  const [sortBy, setSortBy] = useState<HistorySortOption>("newest");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    return subscribeToHistory(() => {
      setHistory(getInvestigationHistory());
    });
  }, []);

  const handleClearAll = () => {
    clearInvestigationHistory();
    setHistory([]);
    setSelectedForCompare([]);
    setShowClearConfirm(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    setSelectedForCompare((prev) => prev.filter((item) => item !== id));
  };

  const toggleCompareSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const recA = history.find((h) => h.id === selectedForCompare[0]);
    const recB = history.find((h) => h.id === selectedForCompare[1]);
    if (recA && recB) {
      onCompareInvestigations(recA, recB);
    }
  };

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        if (verdictFilter !== "ALL" && item.overallVerdict !== verdictFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesClaim = item.targetClaim.toLowerCase().includes(query);
          const matchesId = item.id.toLowerCase().includes(query);
          const matchesContext = item.contextUrl ? item.contextUrl.toLowerCase().includes(query) : false;
          return matchesClaim || matchesId || matchesContext;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "confidence") return b.confidenceScore - a.confidenceScore;
        if (sortBy === "sources") return b.evidenceCount - a.evidenceCount;
        return 0;
      });
  }, [history, verdictFilter, searchQuery, sortBy]);

  return (
    <div
      id="investigation-history-panel"
      className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-6"
    >
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#2A3038] gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <History className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xs font-bold text-[#F3F5F7] tracking-wider uppercase">
                Investigation History
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#161B21] text-[#D9DEE5] border border-[#2A3038] font-semibold">
                {history.length} {history.length === 1 ? "RECORD" : "RECORDS"}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] font-sans mt-0.5">
              Client-side audit records • Cross-investigation comparison
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {selectedForCompare.length === 2 && (
            <button
              type="button"
              onClick={handleLaunchCompare}
              className="px-3.5 py-1.5 rounded bg-[#1B2027] text-white border border-[#D9DEE5] font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>COMPARE (2/2)</span>
            </button>
          )}

          {history.length > 0 && !showClearConfirm && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#707984] hover:text-rose-300 border border-[#2A3038] text-xs font-mono flex items-center gap-1 transition-colors"
              title="Clear all stored history"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {showClearConfirm && (
            <div className="flex items-center gap-1.5 bg-[#161B21] border border-rose-800/50 p-1 rounded font-mono">
              <span className="text-[10px] text-rose-300 px-1">CLEAR ALL?</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-0.5 bg-rose-900 text-rose-200 hover:bg-rose-800 rounded text-[10px] font-bold"
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 bg-[#1B2027] text-[#A7AFB8] hover:text-white rounded text-[10px]"
              >
                NO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#080A0D] p-3 rounded-lg border border-[#2A3038] font-mono">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#707984]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, domains, or IDs..."
              className="w-full bg-[#161B21] border border-[#2A3038] focus:border-[#D9DEE5] rounded pl-9 pr-3 py-1.5 text-xs text-[#F3F5F7] placeholder:text-[#707984] focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Verdict Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-[#707984] uppercase flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" />
            </span>
            {VERDICT_FILTERS.map((filter) => {
              const isSelected = verdictFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setVerdictFilter(filter)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-[#1B2027] text-white border border-[#D9DEE5]"
                      : "bg-[#161B21] text-[#707984] hover:text-[#A7AFB8] border border-[#2A3038]"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[10px] text-[#707984] uppercase flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as HistorySortOption)}
              className="bg-[#161B21] border border-[#2A3038] text-[#A7AFB8] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#D9DEE5]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="sources">Most Sources</option>
            </select>
          </div>
        </div>
      )}

      {/* Comparison Selection Hint Banner */}
      {selectedForCompare.length > 0 && (
        <div className="p-3 rounded-lg bg-[#080A0D] border border-[#343B45] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#D9DEE5]">
            <ArrowRightLeft className="h-4 w-4 text-[#38BDF8]" />
            <span>
              {selectedForCompare.length === 1
                ? "1 of 2 investigations selected for comparison. Select another to compare."
                : "2 investigations selected. Ready to launch comparison."}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedForCompare([])}
            className="text-[11px] text-[#707984] hover:text-white underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* History Records List / Grid */}
      {history.length === 0 ? (
        <div className="py-10 text-center bg-[#080A0D] border border-[#2A3038] rounded-lg space-y-2 font-mono">
          <History className="h-6 w-6 text-[#707984] mx-auto" />
          <p className="text-xs text-[#A7AFB8]">
            No investigation sessions stored yet.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-8 text-center bg-[#080A0D] border border-[#2A3038] rounded-lg text-xs font-mono text-[#707984]">
          No history records match the current filter or search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHistory.map((item) => {
            const vStyle = VERDICT_BADGE_STYLES[item.overallVerdict] || VERDICT_BADGE_STYLES.UNVERIFIED;
            const VIcon = vStyle.icon;
            const isSelectedForCompare = selectedForCompare.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onOpenInvestigation(item)}
                className={`p-4 rounded-lg border transition-all cursor-pointer select-none space-y-3 relative group ${
                  isSelectedForCompare
                    ? "bg-[#161B21] border-[#D9DEE5]"
                    : "bg-[#080A0D] hover:bg-[#161B21] border-[#2A3038] hover:border-[#343B45]"
                }`}
              >
                {/* Card Header: Timestamp + Compare Checkbox + Verdict Pill */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#2A3038] font-mono">
                  <div className="flex items-center gap-2">
                    {/* Compare Selection Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleCompareSelect(item.id, e)}
                      className="p-1 text-[#707984] hover:text-[#F3F5F7] transition-colors"
                      title={
                        isSelectedForCompare
                          ? "Deselect from comparison"
                          : "Select for side-by-side comparison"
                      }
                    >
                      {isSelectedForCompare ? (
                        <CheckSquare className="h-4 w-4 text-[#38BDF8]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <span className="text-[11px] text-[#707984]">
                      {new Date(item.timestamp).toLocaleDateString()}{" "}
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${vStyle.bg} ${vStyle.text} ${vStyle.border}`}
                    >
                      <VIcon className="h-3 w-3" />
                      {item.overallVerdict}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1 text-[#707984] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete record"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Target Claim Text */}
                <p className="text-xs sm:text-sm font-semibold text-[#F3F5F7] line-clamp-2 leading-snug font-sans">
                  &ldquo;{item.targetClaim}&rdquo;
                </p>

                {/* Metrics Grid Footer */}
                <div className="pt-2 border-t border-[#2A3038] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#707984]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-[#B8C0C9]" />
                      {item.atomicClaimCount} Claims
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-[#B8C0C9]" />
                      {item.evidenceCount} Sources
                    </span>
                    {item.hasMedia && (
                      <span className="flex items-center gap-1 text-[#38BDF8]">
                        <ImageIcon className="h-3 w-3" />
                        Media
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[#D9DEE5]">
                    <span>Open ↗</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
