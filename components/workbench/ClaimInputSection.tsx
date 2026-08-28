"use client";

import React, { useState } from "react";
import { FileText, HelpCircle, AlignLeft, AlertCircle } from "lucide-react";
import { INPUT_VALIDATION } from "@/lib/constants";

interface ClaimInputSectionProps {
  claimText: string;
  setClaimText: (val: string) => void;
  contextText: string;
  setContextText: (val: string) => void;
  disabled?: boolean;
}

export const ClaimInputSection: React.FC<ClaimInputSectionProps> = ({
  claimText,
  setClaimText,
  contextText,
  setContextText,
  disabled = false,
}) => {
  const [showContext, setShowContext] = useState(Boolean(contextText));
  const charCount = claimText.length;
  const isTooShort = charCount > 0 && charCount < INPUT_VALIDATION.minClaimLength;
  const isTooLong = charCount > INPUT_VALIDATION.maxClaimLength;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            1. Target Claim or Assertion <span className="text-rose-400">*</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`${
              isTooLong
                ? "text-rose-400 font-bold"
                : isTooShort
                ? "text-amber-400"
                : "text-slate-400"
            }`}
          >
            {charCount}/{INPUT_VALIDATION.maxClaimLength}
          </span>
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
          disabled={disabled}
          placeholder="Enter a statement, social media post, breaking report assertion, or factual claim to verify..."
          rows={4}
          className={`w-full bg-slate-950/70 border rounded-lg p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all font-sans leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed ${
            isTooLong
              ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
              : isTooShort
              ? "border-amber-500/50 focus:ring-1 focus:ring-amber-500"
              : "border-slate-800 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          }`}
        />
        {isTooShort && (
          <p className="text-xs text-amber-400/90 font-mono mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Minimum {INPUT_VALIDATION.minClaimLength} characters required ({INPUT_VALIDATION.minClaimLength - charCount} more needed)
          </p>
        )}
        {isTooLong && (
          <p className="text-xs text-rose-400 font-mono mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Claim exceeds maximum limit of {INPUT_VALIDATION.maxClaimLength} characters by {charCount - INPUT_VALIDATION.maxClaimLength}.
          </p>
        )}
      </div>

      {/* Context Toggle */}
      <div className="pt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowContext(!showContext)}
          className="text-xs font-mono text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
              disabled={disabled}
              placeholder="e.g. https://twitter.com/example/status/..., televised briefing Aug 2026..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
        <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span>Claims can be single assertions or multi-sentence narrative statements.</span>
      </div>
    </div>
  );
};
