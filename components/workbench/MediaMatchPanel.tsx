"use client";

import React, { useState } from "react";
import {
  MultimodalMediaMatchSummary,
  MediaMatchType,
} from "@/types";
import {
  ExternalLink,
  Play,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

interface MediaMatchPanelProps {
  mediaMatch?: MultimodalMediaMatchSummary;
  uploadedPreviewUrl?: string;
  isLoading?: boolean;
}

const MATCH_TYPE_BADGES: Record<
  MediaMatchType,
  { label: string; badgeBg: string; text: string; border: string }
> = {
  EXACT: {
    label: "EXACT MATCH",
    badgeBg: "bg-emerald-500 text-[#08090C]",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
  },
  HIGH_SIMILARITY: {
    label: "HIGH SIMILARITY",
    badgeBg: "bg-teal-500 text-[#08090C]",
    text: "text-teal-300",
    border: "border-teal-500/40",
  },
  RELATED: {
    label: "RELATED CONTEXT",
    badgeBg: "bg-amber-500 text-[#08090C]",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
  NONE: {
    label: "NO MATCH",
    badgeBg: "bg-stone-800 text-stone-300",
    text: "text-[#94A3B8]",
    border: "border-stone-800",
  },
};

export const MediaMatchPanel: React.FC<MediaMatchPanelProps> = ({
  mediaMatch,
  uploadedPreviewUrl,
  isLoading = false,
}) => {
  const [showAllMatches, setShowAllMatches] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[#0D1017] border border-stone-800 rounded-xl p-5 shadow-xl animate-pulse space-y-3">
        <div className="h-4 bg-stone-800 rounded w-1/3" />
        <div className="h-20 bg-stone-900 rounded-lg" />
      </div>
    );
  }

  if (!mediaMatch || !mediaMatch.hasMedia) {
    return null;
  }

  const primary = mediaMatch.primaryMatch;
  const isMatchFound = mediaMatch.status === "MATCH_FOUND" && primary && (primary.type === "EXACT" || primary.type === "HIGH_SIMILARITY");
  const isExact = primary?.type === "EXACT";
  const badgeConfig = primary ? MATCH_TYPE_BADGES[primary.type] : MATCH_TYPE_BADGES.NONE;

  return (
    <div
      id="media-match-panel"
      className="bg-[#0D1017] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-5 animate-in fade-in duration-300"
    >
      {/* Header & Match Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isMatchFound
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : "bg-[#131720] border-stone-800 text-[#E2C15C]"
            }`}
          >
            {mediaMatch.mediaType === "video" ? (
              <Video className="h-5 w-5" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans uppercase font-bold text-[#94A3B8]">
                Multimodal Media Matching
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold uppercase ${badgeConfig.badgeBg}`}
              >
                {isMatchFound ? (isExact ? "MEDIA MATCH FOUND" : "HIGH SIMILARITY FOUND") : "NO EXACT MATCH"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F8F9FA] mt-0.5">
              {mediaMatch.summaryText}
            </h3>
          </div>
        </div>

        {mediaMatch.mediaFilename && (
          <span className="text-xs text-[#94A3B8] font-mono px-3 py-1 rounded-full bg-[#131720] border border-stone-800 truncate max-w-[220px]">
            {mediaMatch.mediaFilename}
          </span>
        )}
      </div>

      {/* Primary Match Showcase Card (if a match or candidates exist) */}
      {primary && (
        <div
          className={`p-4 sm:p-5 rounded-xl border ${
            isMatchFound
              ? "bg-emerald-950/20 border-emerald-500/30"
              : "bg-[#08090C] border-stone-800"
          } space-y-4`}
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            {/* Uploaded vs Matched Source Comparison */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#E2C15C] uppercase">
                  Top Matched Online Source
                </span>
                <span className="text-xs text-[#94A3B8]">
                  • {Math.round(primary.confidence * 100)}% Similarity Confidence
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-[#F8F9FA] leading-snug">
                {primary.title}
              </h4>

              <p className="text-xs sm:text-sm text-[#C2C9D6] leading-relaxed">
                {primary.explanation}
              </p>

              {uploadedPreviewUrl && (
                <div className="pt-2 flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg bg-[#050608] border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {mediaMatch.mediaType === "video" ? (
                      <video src={uploadedPreviewUrl} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={uploadedPreviewUrl} alt="Uploaded Media Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    <span className="text-[#F8F9FA] font-medium block">Uploaded Source Artifact</span>
                    <span>Direct match comparison evaluated against open web & video index.</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#94A3B8] bg-[#131720] px-2.5 py-1 rounded-lg border border-stone-800">
                  Domain: <span className="text-[#F8F9FA] font-medium">{primary.domain}</span>
                </span>
                {primary.publishedAt && (
                  <span className="text-xs text-[#94A3B8] bg-[#131720] px-2.5 py-1 rounded-lg border border-stone-800">
                    Published: {primary.publishedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Direct Open Link CTA */}
            <div className="shrink-0 pt-1">
              <a
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  primary.sourceType === "youtube"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-[#131720] hover:bg-[#1C2230] text-[#E2C15C] border border-[#D4AF37]/30"
                }`}
              >
                {primary.sourceType === "youtube" ? (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Watch on YouTube</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Online Source</span>
                  </>
                )}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Expandable All Matches List (if multiple results found) */}
      {mediaMatch.allMatches.length > 1 && (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="text-xs text-[#E2C15C] hover:text-[#F3E5B8] font-medium flex items-center gap-1.5 transition-colors"
          >
            {showAllMatches ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>
              {showAllMatches
                ? "Hide additional online media candidates"
                : `View all ${mediaMatch.allMatches.length} candidate media matches`}
            </span>
          </button>

          {showAllMatches && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {mediaMatch.allMatches.slice(1).map((match) => {
                const itemBadge = MATCH_TYPE_BADGES[match.type] || MATCH_TYPE_BADGES.NONE;
                return (
                  <div
                    key={match.id}
                    className="p-3.5 rounded-xl bg-[#08090C] border border-stone-800 space-y-2 hover:border-stone-700 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#94A3B8] truncate">{match.domain}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${itemBadge.badgeBg}`}
                      >
                        {itemBadge.label}
                      </span>
                    </div>

                    <p className="text-[#F8F9FA] font-medium line-clamp-2">{match.title}</p>
                    <p className="text-[#94A3B8] text-[11px] line-clamp-2">{match.explanation}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-900">
                      <span className="text-[11px] text-[#E2C15C]">
                        {Math.round(match.confidence * 100)}% Confidence
                      </span>
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#E2C15C] hover:text-white flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Honest Boundary Notice */}
      <div className="flex items-center gap-2 text-xs text-[#94A3B8] pt-1">
        <HelpCircle className="h-3.5 w-3.5 text-[#E2C15C] shrink-0" />
        <span>
          Visual matches are verified against indexed web citations and video archives without synthetic fabrication.
        </span>
      </div>
    </div>
  );
};
