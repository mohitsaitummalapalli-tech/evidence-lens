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
    badgeBg: "bg-emerald-950/40 text-emerald-300 border border-emerald-700/50",
    text: "text-emerald-400",
    border: "border-emerald-700/50",
  },
  HIGH_SIMILARITY: {
    label: "HIGH SIMILARITY",
    badgeBg: "bg-sky-950/40 text-sky-300 border border-sky-700/50",
    text: "text-sky-400",
    border: "border-sky-700/50",
  },
  RELATED: {
    label: "RELATED CONTEXT",
    badgeBg: "bg-amber-950/40 text-amber-300 border border-amber-700/50",
    text: "text-amber-400",
    border: "border-amber-700/50",
  },
  NONE: {
    label: "NO MATCH",
    badgeBg: "bg-[#161B21] text-[#707984] border border-[#2A3038]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
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
      <div className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 animate-pulse space-y-3">
        <div className="h-4 bg-[#161B21] rounded w-1/3" />
        <div className="h-20 bg-[#080A0D] rounded" />
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
      className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 sm:p-6 space-y-5"
    >
      {/* Header & Match Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A3038]">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded border ${
              isMatchFound
                ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400"
                : "bg-[#161B21] border-[#2A3038] text-[#38BDF8]"
            }`}
          >
            {mediaMatch.mediaType === "video" ? (
              <Video className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#707984]">
                Multimodal Media Matching
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${badgeConfig.badgeBg}`}
              >
                {isMatchFound ? (isExact ? "MATCH FOUND" : "HIGH SIMILARITY") : "NO EXACT MATCH"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#F3F5F7] mt-0.5">
              {isMatchFound ? "This media appears in verified online records" : "No exact matching media found in current web index"}
            </h3>
          </div>
        </div>

        {mediaMatch.mediaFilename && (
          <span className="text-xs text-[#A7AFB8] font-mono px-2.5 py-1 rounded bg-[#080A0D] border border-[#2A3038] truncate max-w-[220px]">
            {mediaMatch.mediaFilename}
          </span>
        )}
      </div>

      {/* Primary Match Showcase Card (if a match or candidates exist) */}
      {primary && (
        <div
          className={`p-4 sm:p-5 rounded-lg border ${
            isMatchFound
              ? "bg-emerald-950/15 border-emerald-800/40"
              : "bg-[#080A0D] border-[#2A3038]"
          } space-y-4`}
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            {/* Uploaded vs Matched Source Comparison */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold text-[#D9DEE5] uppercase tracking-wider">
                  Top Matched Online Source
                </span>
                <span className="text-[10px] font-mono text-[#707984]">
                  ({primary.domain})
                </span>
              </div>

              <h4 className="text-sm font-semibold text-[#F3F5F7]">
                {primary.title}
              </h4>

              {primary.explanation && (
                <p className="text-xs text-[#A7AFB8] font-sans leading-relaxed">
                  &ldquo;{primary.explanation}&rdquo;
                </p>
              )}

              {primary.publishedAt && (
                <div className="text-[11px] font-mono text-[#707984] pt-1">
                  Published: <span className="text-[#D9DEE5]">{primary.publishedAt}</span>
                </div>
              )}
            </div>

            {/* Side-by-side or thumbnail comparison */}
            <div className="flex items-center gap-3 shrink-0">
              {uploadedPreviewUrl && (
                <div className="space-y-1 text-center">
                  <span className="text-[9px] font-mono text-[#707984] uppercase">Uploaded</span>
                  <div className="h-16 w-20 rounded bg-[#11151A] border border-[#2A3038] overflow-hidden flex items-center justify-center">
                    <img
                      src={uploadedPreviewUrl}
                      alt="Uploaded media preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {primary.thumbnail && (
                <div className="space-y-1 text-center">
                  <span className="text-[9px] font-mono text-[#707984] uppercase">Matched</span>
                  <div className="h-16 w-20 rounded bg-[#11151A] border border-[#2A3038] overflow-hidden flex items-center justify-center">
                    <img
                      src={primary.thumbnail}
                      alt="Matched media thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#2A3038] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#707984]">
              Match Confidence: <strong className="text-[#F3F5F7]">{Math.round(primary.confidence * 100)}%</strong>
            </span>

            {primary.url && (
              <a
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-semibold bg-[#161B21] hover:bg-[#1B2027] text-[#D9DEE5] hover:text-white border border-[#343B45] transition-all"
              >
                {primary.sourceType === "youtube" ? (
                  <>
                    <Play className="h-3 w-3 text-rose-400 fill-current" />
                    <span>Watch Source ↗</span>
                  </>
                ) : (
                  <>
                    <span>Open Web Source ↗</span>
                    <ExternalLink className="h-3 w-3 text-[#A7AFB8]" />
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Additional Matches Accordion */}
      {((mediaMatch.allMatches || mediaMatch.candidates || []).length > 1) && (
        <div className="space-y-2 pt-2 border-t border-[#2A3038]">
          <button
            type="button"
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="w-full py-2 px-3 rounded bg-[#080A0D] hover:bg-[#161B21] border border-[#2A3038] text-xs font-mono text-[#A7AFB8] hover:text-[#F3F5F7] flex items-center justify-between transition-colors"
          >
            <span>Additional Media Match Candidates ({(mediaMatch.allMatches || mediaMatch.candidates || []).length - 1})</span>
            {showAllMatches ? (
              <ChevronUp className="h-4 w-4 text-[#707984]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#707984]" />
            )}
          </button>

          {showAllMatches && (
            <div className="space-y-2 pt-2">
              {(mediaMatch.allMatches || mediaMatch.candidates || []).slice(1).map((match, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-[#080A0D] border border-[#2A3038] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#F3F5F7] truncate max-w-sm">
                        {match.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#707984]">
                        ({match.domain})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7AFB8] truncate font-sans">
                      {match.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
                      {Math.round(match.confidence * 100)}% sim
                    </span>
                    {match.url && (
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-[#161B21] text-[#D9DEE5] hover:text-white transition-colors"
                        title="Open Source"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
