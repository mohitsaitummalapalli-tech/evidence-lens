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
    <div id="claim-input-section" className="bg-[#0D1017]/90 border border-[#D4AF37]/20 rounded-xl p-5 shadow-xl shadow-black/40 space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37]">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-[#F8F9FA] tracking-wide uppercase font-mono">
            1. Target Claim or Assertion <span className="text-[#D4AF37]">*</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`${
              isTooLong
                ? "text-rose-400 font-bold"
                : isTooShort
                ? "text-amber-400 font-semibold"
                : "text-[#94A3B8]"
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
          className={`w-full bg-[#08090C] border rounded-lg p-3.5 text-sm text-[#F8F9FA] placeholder:text-[#64748B] focus:outline-none transition-all font-sans leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed shadow-inner ${
            isTooLong
              ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
              : isTooShort
              ? "border-amber-500/60 focus:ring-1 focus:ring-amber-500"
              : "border-[#D4AF37]/25 focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/40"
          }`}
        />
        {isTooShort && (
          <p className="text-xs text-amber-400 font-mono mt-1.5 flex items-center gap-1">
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
          className="text-xs font-mono text-[#D4AF37] hover:text-[#F3E5B8] flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <AlignLeft className="h-3.5 w-3.5" />
          <span>{showContext ? "Hide Additional Context" : "+ Add Context / Source URL (Optional)"}</span>
        </button>

        {showContext && (
          <div className="mt-3 space-y-2">
            <label htmlFor="context-input" className="text-xs font-mono text-[#94A3B8]">
              Source URL, timestamp, or incident context:
            </label>
            <input
              id="context-input"
              type="text"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              disabled={disabled}
              placeholder="e.g. https://twitter.com/example/status/..., televised briefing Aug 2026..."
              className="w-full bg-[#08090C] border border-[#D4AF37]/25 rounded-lg px-3.5 py-2 text-xs text-[#F8F9FA] placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/70 focus:ring-1 focus:ring-[#D4AF37]/40 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] pt-1">
        <HelpCircle className="h-3.5 w-3.5 text-[#D4AF37]/70 shrink-0" />
        <span>Claims can be single assertions or multi-sentence narrative statements.</span>
      </div>
    </div>
  );
};
