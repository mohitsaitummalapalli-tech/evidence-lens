"use client";

import React from "react";
import {
  InvestigationVerificationResult,
  EvidenceRetrievalResult,
  ClaimVerdictType,
} from "@/types";
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Network,
} from "lucide-react";

interface VerdictInspectorProps {
  claimId: string | null;
  verification?: InvestigationVerificationResult | null;
  evidence?: EvidenceRetrievalResult | null;
  onClose: () => void;
  onViewInGraph?: (claimId: string) => void;
}

export function getDeterministicResolutionDescription(
  verdict: ClaimVerdictType | string
): string {
  if (verdict === "TRUE" || verdict === "VERIFIED") {
    return "Supporting evidence was found and no material contradiction was recorded.";
  }
  if (verdict === "FALSE") {
    return "Contradicting evidence was found and supporting evidence was insufficient to overturn the contradiction.";
  }
  if (verdict === "MIXED") {
    return "Both supporting and contradicting evidence were recorded.";
  }
  return "No sufficient evidence was available to resolve the claim.";
}

export const VerdictInspector: React.FC<VerdictInspectorProps> = ({
  claimId,
  verification,
  evidence,
  onClose,
  onViewInGraph,
}) => {
  if (!claimId || !verification) return null;

  const claimVer = verification.claimVerifications?.find(
    (c) => c.claimId === claimId
  );

  const supportingSources = (evidence?.allSources || []).filter(
    (s) => claimVer?.supportingEvidenceIds?.includes(s.id)
  );

  const contradictingSources = (evidence?.allSources || []).filter(
    (s) => claimVer?.contradictingEvidenceIds?.includes(s.id)
  );

  const verdict = claimVer?.verdict || "UNVERIFIED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg h-full bg-[#08090B] border-l border-[rgba(212,175,90,0.3)] p-6 flex flex-col justify-between shadow-2xl overflow-y-auto space-y-6 font-mono text-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Verdict Inspector"
      >
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(212,175,90,0.2)]">
            <div className="flex items-center gap-2">
              <span className="h-6 px-2 rounded bg-[#131519] border border-[rgba(212,175,90,0.4)] text-[#D4AF5A] font-bold flex items-center justify-center">
                {claimId}
              </span>
              <h3 className="font-bold text-sm text-[#F5F7FA] uppercase tracking-wider">
                Verdict Inspector Audit
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-[#131519] hover:bg-[#181B20] text-[#8D949D] hover:text-white border border-[rgba(212,175,90,0.2)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Resolution Statement */}
          <div className="p-3.5 rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#D4AF5A] uppercase font-bold">
                Deterministic Resolution
              </span>
              <span className="font-bold text-xs text-[#F5F7FA] px-2 py-0.2 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)]">
                {verdict}
              </span>
            </div>

            <p className="text-xs text-[#D7DADF] font-sans leading-relaxed">
              {getDeterministicResolutionDescription(verdict)}
            </p>
          </div>

          {/* Reasoning */}
          {claimVer?.reasoning && (
            <div className="space-y-1.5 font-sans">
              <span className="text-[11px] font-mono text-[#D4AF5A] block uppercase font-bold">
                Synthesized Reasoning:
              </span>
              <p className="text-xs text-[#D7DADF] leading-relaxed bg-[#0D0F12] p-3 rounded border border-[rgba(212,175,90,0.18)]">
                {claimVer.reasoning}
              </p>
            </div>
          )}

          {/* Supporting Citations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#D4AF5A]">
              <span className="flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Supporting Primary Sources ({supportingSources.length})
              </span>
            </div>

            {supportingSources.length === 0 ? (
              <p className="text-[#8D949D] italic text-xs">No direct supporting sources linked.</p>
            ) : (
              <div className="space-y-2">
                {supportingSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded bg-[#0D0F12] border border-emerald-700/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#F5F7FA] truncate max-w-[200px]">
                        {src.domain}
                      </span>
                      <span className="text-emerald-400 font-semibold">SUPPORTS</span>
                    </div>
                    <p className="text-xs text-[#D7DADF] font-sans truncate font-medium">
                      {src.title}
                    </p>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#D4AF5A] hover:underline flex items-center gap-0.5"
                      >
                        <span>Open citation</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contradicting Citations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#D4AF5A]">
              <span className="flex items-center gap-1 font-bold">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                Contradicting Sources ({contradictingSources.length})
              </span>
            </div>

            {contradictingSources.length === 0 ? (
              <p className="text-[#8D949D] italic text-xs">No contradicting sources identified.</p>
            ) : (
              <div className="space-y-2">
                {contradictingSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded bg-[#0D0F12] border border-rose-700/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#F5F7FA] truncate max-w-[200px]">
                        {src.domain}
                      </span>
                      <span className="text-rose-400 font-semibold">CONTRADICTS</span>
                    </div>
                    <p className="text-xs text-[#D7DADF] font-sans truncate font-medium">
                      {src.title}
                    </p>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#D4AF5A] hover:underline flex items-center gap-0.5"
                      >
                        <span>Open citation</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[rgba(212,175,90,0.2)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onViewInGraph?.(claimId);
              onClose();
            }}
            className="px-3 py-1.5 rounded bg-[#131519] hover:bg-[#181B20] text-[#D4AF5A] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.35)] flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Network className="h-3.5 w-3.5" />
            <span>Highlight in Evidence Map</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#050607] hover:bg-[#131519] text-[#8D949D] hover:text-white border border-[rgba(212,175,90,0.2)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
