"use client";

import React, { useState } from "react";
import { FileText, AlignLeft, AlertCircle, Sparkles } from "lucide-react";
import { INPUT_VALIDATION } from "@/lib/constants";

interface ClaimInputSectionProps {
  claimText: string;
  setClaimText: (val: string) => void;
  contextText: string;
  setContextText: (val: string) => void;
  disabled?: boolean;
}

const EXAMPLE_CLAIMS = [
  "The James Webb Space Telescope was launched on December 25, 2021.",
  "India gained independence in 1947.",
  "The Eiffel Tower is located in Rome, Italy.",
];

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
    <div id="claim-input-section" className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
              Verify a Claim <span className="text-[#38BDF8]">*</span>
            </h2>
            <p className="text-[11px] text-[#A7AFB8]">
              Enter a statement, headline, or assertion to investigate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`${
              isTooLong
                ? "text-rose-400 font-bold"
                : isTooShort
                ? "text-amber-400 font-semibold"
                : "text-[#707984]"
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
          placeholder="e.g. 'The James Webb Space Telescope was launched into space on December 25, 2021.'"
          rows={3}
          className={`w-full bg-[#080A0D] border rounded-md p-3.5 text-sm text-[#F3F5F7] placeholder:text-[#707984] focus:outline-none transition-all font-sans leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed ${
            isTooLong
              ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
              : isTooShort
              ? "border-amber-500/60 focus:ring-1 focus:ring-amber-500"
              : "border-[#2A3038] focus:border-[#D9DEE5] focus:ring-1 focus:ring-[#D9DEE5]/20"
          }`}
        />
        {isTooShort && (
          <p className="text-xs text-amber-400 font-mono mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Please enter at least {INPUT_VALIDATION.minClaimLength} characters ({INPUT_VALIDATION.minClaimLength - charCount} more needed).
          </p>
        )}
        {isTooLong && (
          <p className="text-xs text-rose-400 font-mono mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Claim exceeds maximum limit of {INPUT_VALIDATION.maxClaimLength} characters.
          </p>
        )}
      </div>

      {/* Examples for instant evaluation */}
      {!claimText && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono text-[#707984] flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-[#B8C0C9]" /> EXAMPLES:
          </span>
          {EXAMPLE_CLAIMS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setClaimText(ex)}
              className="text-[11px] font-sans px-2.5 py-1 rounded bg-[#161B21] hover:bg-[#1B2027] text-[#A7AFB8] hover:text-[#F3F5F7] border border-[#2A3038] transition-colors truncate max-w-[280px]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Context Toggle */}
      <div className="pt-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-[#A7AFB8] hover:text-[#F3F5F7] flex items-center gap-1.5 transition-colors disabled:opacity-50 font-mono"
        >
          <AlignLeft className="h-3.5 w-3.5 text-[#B8C0C9]" />
          <span>{showContext ? "Hide Context / Source Link" : "+ Add Source Context or Article Link (Optional)"}</span>
        </button>

        {showContext && (
          <div className="mt-2.5 space-y-1.5">
            <label htmlFor="context-input" className="text-[11px] font-mono text-[#707984]">
              Origin URL, article link, or context note:
            </label>
            <input
              id="context-input"
              type="text"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              disabled={disabled}
              placeholder="https://example.com/news-story or contextual detail..."
              className="w-full bg-[#080A0D] border border-[#2A3038] rounded-md px-3.5 py-2 text-xs text-[#F3F5F7] placeholder:text-[#707984] focus:outline-none focus:border-[#D9DEE5] focus:ring-1 focus:ring-[#D9DEE5]/20 transition-all font-sans disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
