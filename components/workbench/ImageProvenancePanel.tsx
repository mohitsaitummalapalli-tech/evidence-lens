"use client";

import React from "react";
import { ImageProvenanceResult } from "@/types";
import {
  ImageIcon,
  Globe,
  ExternalLink,
  Video,
  Play,
} from "lucide-react";

interface ImageProvenancePanelProps {
  provenance?: ImageProvenanceResult | null;
  isLoading?: boolean;
}

export const ImageProvenancePanel: React.FC<ImageProvenancePanelProps> = ({
  provenance,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-5 sm:p-6 space-y-4 font-mono animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]" />
          <div className="h-4 w-48 bg-[#050607] rounded" />
        </div>
        <div className="h-28 bg-[#050607] rounded-lg border border-[rgba(212,175,90,0.2)]" />
      </div>
    );
  }

  if (!provenance || (!provenance.hasImage && !provenance.hasMedia)) {
    return null;
  }

  const isVideo = provenance.mediaType === "video";
  const candidates = provenance.candidates || [];

  return (
    <div id="image-provenance-panel" className="p-5 sm:p-6 space-y-5 font-mono">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#38BDF8]">
            {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Media Provenance & Reverse Lookup
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  provenance.searchStatus === "SUCCESS"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-700/50"
                    : "bg-[#050607] text-[#8D949D] border border-[rgba(212,175,90,0.2)]"
                }`}
              >
                {provenance.searchStatus}
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Historical digital footprint and cross-platform publishing trace
            </p>
          </div>
        </div>

        {/* Provenance Statistics */}
        <div className="flex items-center gap-3 text-xs text-[#D7DADF]">
          <div className="px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
            <span className="text-[#8D949D]">Candidates: </span>
            <strong className="text-[#F5F7FA]">{provenance.totalCandidatesFound}</strong>
          </div>
          <div className="px-3 py-1 rounded bg-[#050607] border border-[rgba(212,175,90,0.25)]">
            <span className="text-[#8D949D]">Domains: </span>
            <strong className="text-[#D4AF5A]">{provenance.uniqueDomains?.length || 0}</strong>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {candidates.length === 0 ? (
        <div className="py-8 text-center bg-[#050607] border border-[rgba(212,175,90,0.2)] rounded-lg text-xs text-[#8D949D]">
          No previous publishing appearances or reverse matches identified for this asset.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {candidates.map((cand) => {
            const isCandVideo = cand.sourceType === "youtube" || cand.sourceType === "video";

            return (
              <div
                key={cand.id}
                className="p-4 rounded-lg bg-[#050607] hover:bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[rgba(212,175,90,0.18)] text-xs">
                    <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                      {isCandVideo ? (
                        <Video className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-[#D4AF5A] shrink-0" />
                      )}
                      <span className="font-bold text-[#F5F7FA] truncate">
                        {cand.domain}
                      </span>
                    </div>

                    <span className="text-[9px] px-2 py-0.5 rounded bg-[#0D0F12] text-[#D4AF5A] border border-[rgba(212,175,90,0.3)] font-bold uppercase">
                      {Math.round(cand.relevanceScore * 100)}% REL
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[#F5F7FA] line-clamp-2 leading-snug font-sans">
                    {cand.title}
                  </h3>

                  {cand.snippet && (
                    <p className="text-[11px] text-[#D7DADF] font-sans line-clamp-3 leading-relaxed">
                      &ldquo;{cand.snippet}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[#8D949D]">
                    {cand.discoveredAt ? `Discovered ${new Date(cand.discoveredAt).toLocaleDateString()}` : "Indexed"}
                  </span>

                  {cand.url && (
                    <a
                      href={cand.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] transition-all"
                    >
                      {isCandVideo ? (
                        <>
                          <Play className="h-3 w-3 text-rose-400 fill-current" />
                          <span>Watch ↗</span>
                        </>
                      ) : (
                        <>
                          <span>Open ↗</span>
                          <ExternalLink className="h-3 w-3 text-[#D4AF5A]" />
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
  );
};
