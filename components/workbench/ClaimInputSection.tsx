"use client";

import React, { useState } from "react";
import { FileText, HelpCircle, AlignLeft } from "lucide-react";

interface ClaimInputSectionProps {
  claimText: string;
  setClaimText: (val: string) => void;
  contextText: string;
  setContextText: (val: string) => void;
}

export const ClaimInputSection: React.FC<ClaimInputSectionProps> = ({
  claimText,
  setClaimText,
  contextText,
  setContextText,
}) => {
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            1. Target Claim or Query
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono">{claimText.length} chars</span>
        </div>
      </div>

      <div>
        <label htmlFor="claim-input" className="sr-only">
          Claim text input
        </label>
        <textarea
          id="claim-input"
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          placeholder="Enter a statement, social media post, article excerpt, or factual assertion to verify..."
          rows={4}
          className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-sans leading-relaxed resize-none"
        />
      </div>

      {/* Context Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowContext(!showContext)}
          className="text-xs font-mono text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
        >
          <AlignLeft className="h-3.5 w-3.5" />
          <span>{showContext ? "Hide Additional Context" : "+ Add Context / Source URL (Optional)"}</span>
        </button>

        {showContext && (
          <div className="mt-3 space-y-2">
            <label htmlFor="context-input" className="text-xs font-mono text-slate-400">
              Source URL, timestamp, or incident context:
            </label>
            <input
              id="context-input"
              type="text"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="e.g. https://example.com/news/123, broadcast aired Aug 2026..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
        <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span>Claims can be raw text or narrative transcripts. Multi-claim deconstruction will run during Phase 2.</span>
      </div>
    </div>
  );
};
