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
    bg: "bg-rose-950/60",
    text: "text-rose-300",
    border: "border-rose-500/40",
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
    text: "text-stone-300",
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
        // Replace second item with new selection
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const invA = history.find((h) => h.id === selectedForCompare[0]);
    const invB = history.find((h) => h.id === selectedForCompare[1]);
    if (invA && invB) {
      onCompareInvestigations(invA, invB);
    }
  };

  // Filter and sort items
  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        // 1. Verdict filter
        if (verdictFilter !== "ALL" && item.overallVerdict !== verdictFilter) {
          return false;
        }
        // 2. Search query filter (matches claim, domain, or ID)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchClaim = item.targetClaim.toLowerCase().includes(q);
          const matchId = item.id.toLowerCase().includes(q);
          const matchContext = item.contextUrl?.toLowerCase().includes(q);
          return matchClaim || matchId || matchContext;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        if (sortBy === "confidence") {
          return b.confidenceScore - a.confidenceScore;
        }
        if (sortBy === "sources") {
          return b.evidenceCount - a.evidenceCount;
        }
        return 0;
      });
  }, [history, verdictFilter, searchQuery, sortBy]);

  return (
    <div
      id="investigation-history-panel"
      className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-2xl shadow-black/80 space-y-6 animate-in fade-in duration-300 relative overflow-hidden"
    >
      {/* Background Subtle Accent */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-radial from-[#D4AF37]/05 to-transparent pointer-events-none blur-3xl" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#D4AF37]/15 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37] shadow-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-[#F8F9FA] font-mono tracking-wide">
                INVESTIGATION HISTORY & COMPARISON
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131720] text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                {history.length} RECORD{history.length === 1 ? "" : "S"}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
              Client-side persistent audit records • Cross-investigation forensic comparison
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {selectedForCompare.length === 2 && (
            <button
              type="button"
              onClick={handleLaunchCompare}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15C] text-[#08090C] font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 transition-all animate-pulse"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>COMPARE (2/2)</span>
            </button>
          )}

          {history.length > 0 && !showClearConfirm && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#131720] hover:bg-rose-950/40 text-stone-400 hover:text-rose-300 border border-stone-800 text-xs font-mono flex items-center gap-1 transition-colors"
              title="Clear all stored history"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">CLEAR ALL</span>
            </button>
          )}

          {showClearConfirm && (
            <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-600/50 p-1 rounded-lg">
              <span className="text-[10px] font-mono text-rose-200 px-1">CONFIRM CLEAR?</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-mono font-bold"
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 bg-[#131720] text-stone-300 hover:text-white rounded text-[10px] font-mono"
              >
                NO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#08090C] p-3 rounded-xl border border-stone-800">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, domains, or session IDs..."
              className="w-full bg-[#131720] border border-stone-800 focus:border-[#D4AF37]/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8F9FA] placeholder:text-stone-500 focus:outline-none transition-colors font-mono"
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
                      ? "bg-[#D4AF37] text-[#08090C]"
                      : "bg-[#131720] text-stone-400 hover:text-stone-200 border border-stone-800"
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
              className="bg-[#131720] border border-stone-800 text-stone-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]/50"
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
        <div className="p-3 rounded-xl bg-[#131720] border border-[#D4AF37]/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#E2C15C]">
            <ArrowRightLeft className="h-4 w-4" />
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
                className="px-2.5 py-1 rounded bg-[#D4AF37] hover:bg-[#E2C15C] text-[#08090C] font-bold text-[11px]"
              >
                COMPARE NOW
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

      {/* History Items Grid / List */}
      {filteredHistory.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#08090C] border border-dashed border-stone-800 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#131720] text-stone-500 border border-stone-800">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-stone-300 uppercase">
              {history.length === 0 ? "No Investigation History Yet" : "No Matching Records"}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-sans">
              {history.length === 0
                ? "Submit an assertion above to initiate your first forensic investigation session. Completed results are automatically recorded here."
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
                    ? "bg-[#131720] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]"
                    : "bg-[#08090C]/90 hover:bg-[#131720]/80 border-stone-800/80 hover:border-[#D4AF37]/30"
                }`}
              >
                {/* Top Header Card Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="text-[11px] font-mono font-bold text-[#D4AF37] tracking-wider">
                      INVESTIGATION #{formattedIndex}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950 text-stone-500 hover:text-rose-400 transition-opacity"
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
                      <span className="text-[#E2C15C] font-bold">
                        {item.confidenceScore}% ({item.overallConfidence})
                      </span>
                    </div>
                    <div className="w-full bg-[#131720] rounded-full h-1.5 overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2C15C] rounded-full"
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
                    <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-mono">
                      <ImageIcon className="h-3 w-3" />
                      <span>{item.imageCandidateCount} IMAGE PROVENANCE CANDIDATES</span>
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] text-[#D4AF37] hover:text-[#E2C15C] border border-[#D4AF37]/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    title="Load complete investigation into workbench"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>OPEN</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => toggleCompareSelect(item.id, e)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                      isSelectedForCompare
                        ? "bg-[#D4AF37] text-[#08090C] border-[#D4AF37]"
                        : "bg-[#131720] hover:bg-[#1C2230] text-stone-300 border-stone-800"
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
