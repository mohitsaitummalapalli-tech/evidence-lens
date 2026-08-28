"use client";

import React from "react";
import { ImageProvenanceResult, ImageProvenanceCandidate, ImageProvenanceMatchType } from "@/types";
import {
  Image as ImageIcon,
  Globe,
  ExternalLink,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ImageProvenancePanelProps {
  provenance?: ImageProvenanceResult;
  isLoading?: boolean;
}

export const ImageProvenancePanel: React.FC<ImageProvenancePanelProps> = ({
  provenance,
  isLoading = false,
}) => {
  if (!provenance && !isLoading) {
    return null;
  }

  // Helper for match type styling
  const getMatchBadgeStyle = (matchType: ImageProvenanceMatchType) => {
    switch (matchType) {
      case "POSSIBLE_MATCH":
        return {
          label: "POSSIBLE MATCH",
          badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
        };
      case "RELATED_SOURCE":
        return {
          label: "RELATED SOURCE",
          badgeClass: "bg-amber-950/80 text-amber-300 border-amber-700/60",
          icon: <Sparkles className="h-3 w-3 text-amber-400" />,
        };
      case "NO_MATCH":
      default:
        return {
          label: "NO MATCH",
          badgeClass: "bg-stone-900 text-stone-400 border-stone-700",
          icon: <AlertCircle className="h-3 w-3 text-stone-400" />,
        };
    }
  };

  return (
    <section
      aria-label="Web Image Provenance Discovery"
      className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-xl p-5 shadow-2xl shadow-black/60 relative overflow-hidden my-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37] shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8F9FA] tracking-wide">
                WEB IMAGE PROVENANCE
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30 font-semibold uppercase">
                Multimodal Discovery
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
              Candidate web sources associated with the uploaded artifact
            </p>
          </div>
        </div>

        {/* Telemetry Status Line */}
        {provenance && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-[#131720] border border-[#D4AF37]/20 text-[#94A3B8]">
              STATUS:{" "}
              <span className="text-[#E2C15C] font-semibold">
                {provenance.searchStatus === "SUCCESS"
                  ? "CANDIDATES DISCOVERED"
                  : provenance.searchStatus === "NO_CANDIDATES"
                  ? "NO CANDIDATES"
                  : provenance.searchStatus}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#131720] border border-[#D4AF37]/20 text-[#94A3B8]">
              CANDIDATES:{" "}
              <span className="text-[#E2C15C] font-semibold">
                {provenance.totalCandidatesFound}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#131720] border border-[#D4AF37]/20 text-[#94A3B8]">
              DOMAINS:{" "}
              <span className="text-[#E2C15C] font-semibold">
                {provenance.uniqueDomains?.length || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="mt-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#94A3B8]">
            <Search className="h-6 w-6 text-[#D4AF37] animate-spin" />
            <p className="text-[#E2C15C] animate-pulse">SEARCHING WEB PROVENANCE...</p>
          </div>
        ) : !provenance || provenance.candidates.length === 0 ? (
          <div className="py-8 px-4 rounded-xl bg-[#08090C] border border-stone-800 text-center space-y-2">
            <Shield className="h-8 w-8 text-[#D4AF37]/60 mx-auto" />
            <h4 className="text-xs font-bold font-mono text-[#F8F9FA] uppercase tracking-wide">
              NO WEB PROVENANCE CANDIDATES FOUND
            </h4>
            <p className="text-[11px] text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              No matching online publication or visual reference was identified across available web index queries. Absence of candidates does not confirm authenticity or fabrication.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Discovered Queries Pill Line */}
            {provenance.queriesExecuted && provenance.queriesExecuted.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#94A3B8] pb-1">
                <span className="text-stone-500">Search Descriptors:</span>
                {provenance.queriesExecuted.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#131720] border border-stone-800 text-[#C2C9D6]"
                  >
                    &ldquo;{q}&rdquo;
                  </span>
                ))}
              </div>
            )}

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {provenance.candidates.map((candidate: ImageProvenanceCandidate) => {
                const style = getMatchBadgeStyle(candidate.matchType);
                const relevancePct = Math.round(candidate.relevanceScore * 100);

                return (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-xl bg-[#08090C] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 transition-all duration-200 shadow-md flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      {/* Top Line: Badge + Domain */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 uppercase ${style.badgeClass}`}
                        >
                          {style.icon}
                          {style.label}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#E2C15C] truncate">
                          <Globe className="h-3 w-3 text-[#D4AF37]" />
                          <span className="truncate">{candidate.domain}</span>
                        </div>
                      </div>

                      {/* Candidate Title */}
                      <h4 className="text-xs font-bold text-[#F8F9FA] line-clamp-2 leading-snug group-hover:text-[#F3E5B8] transition-colors">
                        {candidate.title}
                      </h4>

                      {/* Snippet Excerpt */}
                      {candidate.snippet && (
                        <p className="text-[11px] text-[#94A3B8] font-sans line-clamp-3 leading-relaxed">
                          &ldquo;{candidate.snippet}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Action */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="text-stone-400 flex items-center gap-1.5">
                        <span>SEARCH RELEVANCE:</span>
                        <span className="text-[#E2C15C] font-semibold">{relevancePct}%</span>
                      </div>

                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] hover:text-white border border-[#D4AF37]/30 transition-colors flex items-center gap-1 font-semibold"
                      >
                        <span>OPEN SOURCE</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#94A3B8]">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Clock className="h-3 w-3 text-[#D4AF37]" />
          <span>
            Discovered:{" "}
            {provenance?.discoveredAt
              ? new Date(provenance.discoveredAt).toLocaleTimeString()
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-stone-500">
          <Shield className="h-3 w-3" />
          <span>Web Artifact Search Relevance • Not Reverse-Image Pixel Matching</span>
        </div>
      </div>
    </section>
  );
};
