"use client";

import React, { useState } from "react";
import { MultimodalMediaMatchSummary } from "@/types";
import {
  ExternalLink,
  Play,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MediaMatchPanelProps {
  mediaMatch?: MultimodalMediaMatchSummary | null;
  uploadedPreviewUrl?: string;
  isLoading?: boolean;
}

export const MediaMatchPanel: React.FC<MediaMatchPanelProps> = ({
  mediaMatch,
  uploadedPreviewUrl,
  isLoading = false,
}) => {
  const [showAllMatches, setShowAllMatches] = useState(false);

  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 space-y-4 font-mono animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]" />
          <div className="h-4 w-48 bg-[#050607] rounded" />
        </div>
        <div className="h-32 bg-[#050607] rounded-lg border border-[rgba(212,175,90,0.2)]" />
      </div>
    );
  }

  if (!mediaMatch || !mediaMatch.hasMedia) {
    return null;
  }

  const primary = mediaMatch.primaryMatch;
  const isVideo = mediaMatch.mediaType === "video";

  return (
    <div id="media-match-panel" className="p-5 sm:p-6 space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#38BDF8]">
            {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Exact Multimodal Media Match
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[#38BDF8]/40 text-[#38BDF8] font-semibold">
                {mediaMatch.status === "MATCH_FOUND" ? "EXACT MATCH LOCATED" : "SEARCH COMPLETE"}
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Automated cross-reference against indexed video streams and visual web archives
            </p>
          </div>
        </div>

        {/* Match Count Pill */}
        <div className="text-xs text-[#D7DADF] px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
          <span className="text-[#8D949D]">Exact Matches: </span>
          <strong className="text-emerald-400">{mediaMatch.exactMatchCount}</strong>
          <span className="text-[#8D949D] ml-2">Similar: </span>
          <strong className="text-[#D4AF5A]">{mediaMatch.similarMatchCount}</strong>
        </div>
      </div>

      {/* Primary Match Highlight Card */}
      {primary && (
        <div className="p-4 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.35)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {primary.type} MATCH
                </span>
                <span className="text-xs font-bold text-[#D4AF5A]">
                  {primary.domain}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#F5F7FA] font-sans leading-snug">
                {primary.title}
              </h3>

              {primary.explanation && (
                <p className="text-xs text-[#D7DADF] font-sans leading-relaxed">
                  &ldquo;{primary.explanation}&rdquo;
                </p>
              )}

              {primary.publishedAt && (
                <div className="text-[11px] font-mono text-[#8D949D] pt-1">
                  Published: <span className="text-[#D7DADF]">{primary.publishedAt}</span>
                </div>
              )}
            </div>

            {/* Side-by-side or thumbnail comparison */}
            <div className="flex items-center gap-3 shrink-0">
              {uploadedPreviewUrl && (
                <div className="space-y-1 text-center">
                  <span className="text-[9px] font-mono text-[#8D949D] uppercase">Uploaded</span>
                  <div className="h-16 w-20 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] overflow-hidden flex items-center justify-center">
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
                  <span className="text-[9px] font-mono text-[#8D949D] uppercase">Matched</span>
                  <div className="h-16 w-20 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] overflow-hidden flex items-center justify-center">
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

          <div className="pt-3 border-t border-[rgba(212,175,90,0.18)] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8D949D]">
              Match Confidence: <strong className="text-[#D4AF5A]">{Math.round(primary.confidence * 100)}%</strong>
            </span>

            {primary.url && (
              <a
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-semibold bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] transition-all"
              >
                {primary.sourceType === "youtube" ? (
                  <>
                    <Play className="h-3 w-3 text-rose-400 fill-current" />
                    <span>Watch Source ↗</span>
                  </>
                ) : (
                  <>
                    <span>Open Web Source ↗</span>
                    <ExternalLink className="h-3 w-3 text-[#D4AF5A]" />
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Additional Matches Accordion */}
      {((mediaMatch.allMatches || mediaMatch.candidates || []).length > 1) && (
        <div className="space-y-2 pt-2 border-t border-[rgba(212,175,90,0.18)]">
          <button
            type="button"
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="w-full py-2 px-3 rounded bg-[#050607] hover:bg-[#131519] border border-[rgba(212,175,90,0.25)] text-xs font-mono text-[#D7DADF] hover:text-[#F5F7FA] flex items-center justify-between transition-colors"
          >
            <span>Additional Media Match Candidates ({(mediaMatch.allMatches || mediaMatch.candidates || []).length - 1})</span>
            {showAllMatches ? (
              <ChevronUp className="h-4 w-4 text-[#8D949D]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#8D949D]" />
            )}
          </button>

          {showAllMatches && (
            <div className="space-y-2 pt-2">
              {(mediaMatch.allMatches || mediaMatch.candidates || []).slice(1).map((match, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#F5F7FA] truncate max-w-sm">
                        {match.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#D4AF5A]">
                        ({match.domain})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D7DADF] truncate font-sans">
                      {match.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] text-[#D4AF5A]">
                      {Math.round(match.confidence * 100)}% sim
                    </span>
                    {match.url && (
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-[#131519] text-[#D4AF5A] hover:text-white transition-colors"
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
