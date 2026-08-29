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
    badgeBg: "bg-emerald-500 text-[#0B0D11]",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
  },
  HIGH_SIMILARITY: {
    label: "HIGH SIMILARITY",
    badgeBg: "bg-teal-500 text-[#0B0D11]",
    text: "text-teal-400",
    border: "border-teal-500/40",
  },
  RELATED: {
    label: "RELATED CONTEXT",
    badgeBg: "bg-amber-500 text-[#0B0D11]",
    text: "text-amber-400",
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
      <div className="bg-[#11141A] border border-stone-800 rounded-xl p-5 shadow-xl animate-pulse space-y-3">
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
      className="bg-[#11141A] border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-300"
    >
      {/* Header & Match Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isMatchFound
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : "bg-[#161B24] border-stone-800 text-red-400"
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
              <span className="text-xs uppercase font-bold text-[#94A3B8]">
                Multimodal Media Matching
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeConfig.badgeBg}`}
              >
                {isMatchFound ? (isExact ? "MATCH FOUND" : "HIGH SIMILARITY FOUND") : "NO EXACT MATCH"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F8F9FA] mt-0.5">
              {isMatchFound ? "This media appears online" : "No exact matching media verified online"}
            </h3>
          </div>
        </div>

        {mediaMatch.mediaFilename && (
          <span className="text-xs text-[#CBD5E1] font-mono px-3 py-1 rounded-full bg-[#161B24] border border-stone-800 truncate max-w-[220px]">
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
              : "bg-[#0B0D11] border-stone-800"
          } space-y-4`}
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            {/* Uploaded vs Matched Source Comparison */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  Top Matched Online Source
                </span>
                <span className="text-xs text-[#94A3B8]">
                  • {Math.round(primary.confidence * 100)}% Match Confidence
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-[#F8F9FA] leading-snug">
                {primary.title}
              </h4>

              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
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
                    <span className="text-[#F8F9FA] font-medium block">Uploaded Media</span>
                    <span>Matched against open web and video archives.</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#CBD5E1] bg-[#161B24] px-2.5 py-1 rounded-lg border border-stone-800">
                  Domain: <span className="text-[#F8F9FA] font-medium">{primary.domain}</span>
                </span>
                {primary.publishedAt && (
                  <span className="text-xs text-[#CBD5E1] bg-[#161B24] px-2.5 py-1 rounded-lg border border-stone-800">
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
                  primary.sourceType === "youtube"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-[#161B24] hover:bg-[#1E2430] text-[#F8F9FA] hover:text-white border border-stone-700"
                }`}
              >
                {primary.sourceType === "youtube" ? (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Watch on YouTube ↗</span>
                  </>
                ) : (
                  <>
                    <span>Open source ↗</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Expandable All Matches List (if multiple results found) */}
      {mediaMatch.candidates && mediaMatch.candidates.length > 1 && (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="text-xs text-[#CBD5E1] hover:text-[#F8F9FA] font-medium flex items-center gap-1.5 transition-colors"
          >
            {showAllMatches ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>
              {showAllMatches
                ? "Hide additional online media candidates"
                : `View all ${mediaMatch.candidates.length} candidate media matches`}
            </span>
          </button>

          {showAllMatches && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {mediaMatch.candidates.slice(1).map((match) => {
                const itemBadge = MATCH_TYPE_BADGES[match.type] || MATCH_TYPE_BADGES.NONE;
                return (
                  <div
                    key={match.id}
                    className="p-3.5 rounded-xl bg-[#0B0D11] border border-stone-800 space-y-2 hover:border-stone-700 transition-all text-xs"
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

                    <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                      <span className="text-[11px] text-[#CBD5E1]">
                        {Math.round(match.confidence * 100)}% Confidence
                      </span>
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                      >
                        <span>Open source ↗</span>
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

      {/* Boundary Notice */}
      <div className="flex items-center gap-2 text-xs text-[#94A3B8] pt-1">
        <HelpCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
        <span>
          Visual matches are verified against indexed web citations and video archives without synthetic fabrication.
        </span>
      </div>
    </div>
  );
};
