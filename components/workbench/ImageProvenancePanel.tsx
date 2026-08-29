"use client";

import React from "react";
import { ImageProvenanceResult, ImageProvenanceCandidate, ImageProvenanceMatchType } from "@/types";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  ExternalLink,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Play,
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

  const isVideo =
    provenance?.mediaType === "video" ||
    provenance?.mediaMimeType?.startsWith("video/") ||
    /\.(mp4|webm|mov|avi|mkv)$/i.test(provenance?.mediaFilename || "");

  // Helper for match type styling
  const getMatchBadgeStyle = (matchType: ImageProvenanceMatchType, candidateSourceType?: string) => {
    const isCandidateVideo = candidateSourceType === "youtube" || candidateSourceType === "video";

    switch (matchType) {
      case "POSSIBLE_MATCH":
        return {
          label: isCandidateVideo ? "POSSIBLE VIDEO SOURCE" : "POSSIBLE WEB SOURCE",
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
          label: "NO MATCH FOUND",
          badgeClass: "bg-stone-900 text-stone-400 border-stone-700",
          icon: <AlertCircle className="h-3 w-3 text-stone-400" />,
        };
    }
  };

  return (
    <section
      id="image-provenance-panel"
      aria-label="Web & Media Provenance Discovery"
      className="bg-[#11141A] border border-stone-800 rounded-xl p-5 shadow-2xl relative overflow-hidden my-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            {isVideo ? <VideoIcon className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8F9FA] tracking-wide">
                {isVideo ? "Media & Video Provenance" : "Web Image & Media Provenance"}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161B24] text-[#CBD5E1] border border-stone-800 font-semibold uppercase">
                {isVideo ? "Video Discovery" : "Multimodal Discovery"}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans mt-0.5">
              {isVideo
                ? "Candidate video footage, YouTube clips, and web references for uploaded media"
                : "Candidate web publications and visual references associated with uploaded media"}
            </p>
          </div>
        </div>

        {/* Telemetry Status Line */}
        {provenance && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-[#161B24] border border-stone-800 text-[#94A3B8]">
              STATUS:{" "}
              <span className="text-[#F8F9FA] font-semibold">
                {provenance.searchStatus === "SUCCESS"
                  ? "CANDIDATES DISCOVERED"
                  : provenance.searchStatus === "NO_CANDIDATES"
                  ? "NO CANDIDATES"
                  : provenance.searchStatus}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#161B24] border border-stone-800 text-[#94A3B8]">
              CANDIDATES:{" "}
              <span className="text-red-400 font-semibold">
                {provenance.totalCandidatesFound}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#161B24] border border-stone-800 text-[#94A3B8]">
              DOMAINS:{" "}
              <span className="text-emerald-400 font-semibold">
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
            <Search className="h-6 w-6 text-red-400 animate-spin" />
            <p className="text-[#CBD5E1] animate-pulse">
              {isVideo ? "Searching video & YouTube provenance..." : "Searching web provenance..."}
            </p>
          </div>
        ) : !provenance || provenance.candidates.length === 0 ? (
          <div className="py-8 px-4 rounded-xl bg-[#0B0D11] border border-stone-800 text-center space-y-2">
            <Shield className="h-8 w-8 text-stone-500 mx-auto" />
            <h4 className="text-xs font-bold font-mono text-[#F8F9FA] uppercase tracking-wide">
              NO PROVENANCE CANDIDATES FOUND
            </h4>
            <p className="text-[11px] text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              No matching online publication, video footage, or visual reference was identified across indexed sources. Absence of candidates does not confirm authenticity or fabrication.
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
                    className="px-2 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#CBD5E1]"
                  >
                    &ldquo;{q}&rdquo;
                  </span>
                ))}
              </div>
            )}

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {provenance.candidates.map((candidate: ImageProvenanceCandidate) => {
                const isCandidateYouTube =
                  candidate.sourceType === "youtube" ||
                  candidate.domain.toLowerCase().includes("youtube.com") ||
                  candidate.domain.toLowerCase().includes("youtu.be") ||
                  candidate.url.toLowerCase().includes("youtube.com") ||
                  candidate.url.toLowerCase().includes("youtu.be");

                const style = getMatchBadgeStyle(candidate.matchType, candidate.sourceType);
                const relevancePct = Math.round(candidate.relevanceScore * 100);

                return (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-xl bg-[#0B0D11] border border-stone-800 hover:border-stone-700 transition-all duration-200 shadow-md flex flex-col justify-between space-y-3 group"
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

                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#CBD5E1] truncate">
                          {isCandidateYouTube ? (
                            <VideoIcon className="h-3 w-3 text-red-400" />
                          ) : (
                            <Globe className="h-3 w-3 text-[#94A3B8]" />
                          )}
                          <span className="truncate">{candidate.domain}</span>
                        </div>
                      </div>

                      {/* Candidate Title */}
                      <h4 className="text-xs font-bold text-[#F8F9FA] line-clamp-2 leading-snug group-hover:text-red-300 transition-colors">
                        {candidate.title}
                      </h4>

                      {/* Snippet Excerpt */}
                      {candidate.snippet && (
                        <p className="text-[11px] text-[#CBD5E1] font-sans line-clamp-3 leading-relaxed">
                          &ldquo;{candidate.snippet}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Action */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="text-stone-400 flex items-center gap-1.5">
                        <span>SEARCH RELEVANCE:</span>
                        <span className="text-[#F8F9FA] font-semibold">{relevancePct}%</span>
                      </div>

                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs ${
                          isCandidateYouTube
                            ? "bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-600/40 hover:border-red-500"
                            : "bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-700"
                        }`}
                      >
                        {isCandidateYouTube ? (
                          <>
                            <Play className="h-3 w-3 fill-red-400 text-red-400" />
                            <span>Watch video ↗</span>
                          </>
                        ) : (
                          <>
                            <span>Open source ↗</span>
                            <ExternalLink className="h-3 w-3" />
                          </>
                        )}
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
      <div className="mt-4 pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#94A3B8]">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Clock className="h-3 w-3 text-red-400" />
          <span>
            Discovered:{" "}
            {provenance?.discoveredAt
              ? new Date(provenance.discoveredAt).toLocaleTimeString()
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-stone-500">
          <Shield className="h-3 w-3" />
          <span>Web & Video Artifact Search Discovery • Contextual Signals</span>
        </div>
      </div>
    </section>
  );
};
