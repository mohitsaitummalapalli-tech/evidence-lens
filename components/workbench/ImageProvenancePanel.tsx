"use client";

import React from "react";
import { ImageProvenanceResult, ImageProvenanceMatchType } from "@/types";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  ExternalLink,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
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
          badgeClass: "bg-emerald-950/40 text-emerald-300 border-emerald-700/50",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
        };
      case "RELATED_SOURCE":
        return {
          label: "RELATED SOURCE",
          badgeClass: "bg-amber-950/40 text-amber-300 border-amber-700/50",
          icon: <Sparkles className="h-3 w-3 text-amber-400" />,
        };
      case "NO_MATCH":
      default:
        return {
          label: "NO MATCH FOUND",
          badgeClass: "bg-[#161B21] text-[#707984] border-[#2A3038]",
          icon: <AlertCircle className="h-3 w-3 text-[#707984]" />,
        };
    }
  };

  return (
    <section
      id="image-provenance-panel"
      aria-label="Web & Media Provenance Discovery"
      className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 my-6 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A3038]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#161B21] border border-[#2A3038] text-[#38BDF8]">
            {isVideo ? <VideoIcon className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
                {isVideo ? "Media & Video Provenance" : "Web Image & Media Provenance"}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#D9DEE5] border border-[#2A3038] font-semibold uppercase">
                {isVideo ? "Video Discovery" : "Multimodal"}
              </span>
            </div>
            <p className="text-xs text-[#A7AFB8] font-sans mt-0.5">
              {isVideo
                ? "Candidate video footage, YouTube clips, and web references for uploaded media"
                : "Candidate web publications and visual references associated with uploaded media"}
            </p>
          </div>
        </div>

        {/* Telemetry Status Line */}
        {provenance && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-[#080A0D] border border-[#2A3038] text-[#707984]">
              STATUS:{" "}
              <span className="text-[#F3F5F7] font-semibold">
                {provenance.searchStatus === "SUCCESS"
                  ? "CANDIDATES DISCOVERED"
                  : provenance.searchStatus === "NO_CANDIDATES"
                  ? "NO CANDIDATES"
                  : provenance.searchStatus}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#080A0D] border border-[#2A3038] text-[#707984]">
              CANDIDATES:{" "}
              <span className="text-[#38BDF8] font-semibold">
                {provenance.totalCandidatesFound}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#080A0D] border border-[#2A3038] text-[#707984]">
              DOMAINS:{" "}
              <span className="text-emerald-400 font-semibold">
                {provenance.uniqueDomains?.length || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="mt-2">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[#707984]">
            <Search className="h-5 w-5 text-[#D9DEE5] animate-spin" />
            <p className="text-[#A7AFB8] animate-pulse">
              {isVideo ? "Searching video & YouTube provenance..." : "Searching web provenance..."}
            </p>
          </div>
        ) : !provenance || provenance.candidates.length === 0 ? (
          <div className="py-8 px-4 rounded bg-[#080A0D] border border-[#2A3038] text-center space-y-2">
            <Shield className="h-6 w-6 text-[#707984] mx-auto" />
            <h4 className="text-xs font-mono font-bold text-[#F3F5F7] uppercase tracking-wide">
              NO PROVENANCE CANDIDATES FOUND
            </h4>
            <p className="text-[11px] text-[#707984] max-w-md mx-auto leading-relaxed font-sans">
              No matching online publication, video footage, or visual reference was identified across indexed sources.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {provenance.candidates.map((cand, idx) => {
              const badge = getMatchBadgeStyle(cand.matchType, cand.sourceType);
              const isCandVideo = cand.sourceType === "youtube" || cand.sourceType === "video";

              return (
                <div
                  key={idx}
                  className="bg-[#080A0D] border border-[#2A3038] hover:border-[#343B45] rounded-lg p-3.5 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#2A3038]">
                      <span className="text-[10px] font-mono text-[#707984] flex items-center gap-1">
                        {isCandVideo ? (
                          <VideoIcon className="h-3 w-3 text-[#38BDF8]" />
                        ) : (
                          <Globe className="h-3 w-3 text-[#707984]" />
                        )}
                        <span className="truncate max-w-[120px]">{cand.domain || "Web"}</span>
                      </span>

                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border flex items-center gap-1 ${badge.badgeClass}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#F3F5F7] line-clamp-2 leading-snug">
                      {cand.title}
                    </h4>

                    {cand.snippet && (
                      <p className="text-[11px] text-[#A7AFB8] font-sans line-clamp-3 leading-relaxed">
                        &ldquo;{cand.snippet}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#2A3038] flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-[#707984]">
                      {cand.discoveredAt ? `Discovered ${new Date(cand.discoveredAt).toLocaleDateString()}` : "Indexed"}
                    </span>

                    {cand.url && (
                      <a
                        href={cand.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#161B21] hover:bg-[#1B2027] text-[#D9DEE5] hover:text-white border border-[#343B45] transition-all"
                      >
                        {isCandVideo ? (
                          <>
                            <Play className="h-3 w-3 text-rose-400 fill-current" />
                            <span>Watch ↗</span>
                          </>
                        ) : (
                          <>
                            <span>Open ↗</span>
                            <ExternalLink className="h-3 w-3 text-[#A7AFB8]" />
                          </>
                        )}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
