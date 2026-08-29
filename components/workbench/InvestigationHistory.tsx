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
  Globe,
  ImageIcon,
  CheckSquare,
  Square,
  AlertCircle,
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
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    icon: ShieldCheck,
  },
  FALSE: {
    label: "FALSE",
    bg: "bg-red-950/60",
    text: "text-red-300",
    border: "border-red-500/40",
    icon: ShieldX,
  },
  MIXED: {
    label: "MIXED",
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-500/40",
    icon: ShieldAlert,
  },
  UNVERIFIED: {
    label: "UNVERIFIED",
    bg: "bg-stone-900",
    text: "text-[#94A3B8]",
    border: "border-stone-700",
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
      className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-300 relative overflow-hidden"
    >
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-stone-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-[#F8F9FA] tracking-wide">
                Investigation History
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#161B24] text-[#CBD5E1] border border-stone-800 font-semibold">
                {history.length} {history.length === 1 ? "RECORD" : "RECORDS"}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
              Client-side persistent audit records • Cross-investigation comparison
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {selectedForCompare.length === 2 && (
            <button
              type="button"
              onClick={handleLaunchCompare}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition-all animate-pulse"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>COMPARE (2/2)</span>
            </button>
          )}

          {history.length > 0 && !showClearConfirm && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-red-950/40 text-stone-400 hover:text-red-300 border border-stone-800 text-xs font-sans flex items-center gap-1 transition-colors"
              title="Clear all stored history"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}

          {showClearConfirm && (
            <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-600/50 p-1 rounded-lg">
              <span className="text-[10px] font-mono text-red-200 px-1">CONFIRM CLEAR?</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold"
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 bg-[#161B24] text-stone-300 hover:text-white rounded text-[10px] font-mono"
              >
                NO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0B0D11] p-3 rounded-xl border border-stone-800">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, domains, or session IDs..."
              className="w-full bg-[#161B24] border border-stone-800 focus:border-red-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8F9FA] placeholder:text-stone-500 focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Verdict Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-mono text-stone-500 uppercase flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" />
            </span>
            {VERDICT_FILTERS.map((filter) => {
              const isSelected = verdictFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setVerdictFilter(filter)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-[#161B24] text-stone-400 hover:text-stone-200 border border-stone-800"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[10px] font-mono text-stone-500 uppercase flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as HistorySortOption)}
              className="bg-[#161B24] border border-stone-800 text-stone-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500/50"
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
        <div className="p-3 rounded-xl bg-[#161B24] border border-red-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-red-300">
            <ArrowRightLeft className="h-4 w-4 text-red-400" />
            <span>
              {selectedForCompare.length === 1
                ? "1 of 2 investigations selected. Choose a second investigation to compare."
                : "2 investigations selected for side-by-side comparison!"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedForCompare.length === 2 && (
              <button
                type="button"
                onClick={handleLaunchCompare}
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
              >
                Compare Now
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="text-stone-400 hover:text-stone-200 text-[11px] underline"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* History Items Grid */}
      {filteredHistory.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#0B0D11] border border-dashed border-stone-800 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#161B24] text-stone-500 border border-stone-800">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-300 uppercase">
              {history.length === 0 ? "No Investigation History Yet" : "No Matching Records"}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-sans">
              {history.length === 0
                ? "Submit a claim above to initiate your first verification. Completed results are automatically recorded here."
                : "Try adjusting your search query or verdict filter to view matching records."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item, idx) => {
            const verdictTheme =
              VERDICT_BADGE_STYLES[item.overallVerdict] || VERDICT_BADGE_STYLES.UNVERIFIED;
            const VerdictIcon = verdictTheme.icon;
            const isSelectedForCompare = selectedForCompare.includes(item.id);
            const formattedIndex = (history.length - idx).toString().padStart(2, "0");

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                  isSelectedForCompare
                    ? "bg-[#161B24] border-red-500 shadow-lg shadow-red-950/20 ring-1 ring-red-500"
                    : "bg-[#0B0D11]/90 hover:bg-[#161B24]/80 border-stone-800/80 hover:border-stone-700"
                }`}
              >
                {/* Top Header Card Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="text-[11px] font-mono font-bold text-[#F8F9FA] tracking-wider">
                      INVESTIGATION #{formattedIndex}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950 text-stone-500 hover:text-red-400 transition-opacity"
                        title="Delete this record"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase flex items-center gap-1 ${verdictTheme.bg} ${verdictTheme.text} ${verdictTheme.border}`}
                      >
                        <VerdictIcon className="h-3 w-3" />
                        {verdictTheme.label}
                      </span>
                    </div>
                  </div>

                  {/* Target Claim Snippet */}
                  <p className="text-xs text-[#F8F9FA] font-sans line-clamp-2 leading-snug">
                    &ldquo;{item.targetClaim}&rdquo;
                  </p>

                  {/* Confidence Bar & Percentage */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#94A3B8]">CONFIDENCE</span>
                      <span className="text-[#F8F9FA] font-bold">
                        {item.confidenceScore}% ({item.overallConfidence})
                      </span>
                    </div>
                    <div className="w-full bg-[#161B24] rounded-full h-1.5 overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                        style={{ width: `${item.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="space-y-2 pt-2 border-t border-stone-900 text-[10px] font-mono text-stone-400">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-blue-400" />
                      {item.atomicClaimCount} CLAIMS
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-amber-400" />
                      {item.evidenceCount} SOURCES
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-purple-400" />
                      {item.uniqueDomainCount} DOMAINS
                    </span>
                  </div>

                  {item.imageCandidateCount > 0 && (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono">
                      <ImageIcon className="h-3 w-3" />
                      <span>{item.imageCandidateCount} MEDIA CANDIDATES</span>
                    </div>
                  )}

                  <div className="text-[9px] text-stone-500 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons: [OPEN] [COMPARE] */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenInvestigation(item)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-700 text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    title="Load complete investigation into workbench"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open ↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => toggleCompareSelect(item.id, e)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                      isSelectedForCompare
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-[#161B24] hover:bg-[#1E2430] text-stone-300 border-stone-800"
                    }`}
                    title="Select for comparison"
                  >
                    {isSelectedForCompare ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                    <span>COMPARE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
