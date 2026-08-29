"use client";

import React, { useState } from "react";
import { FileText, AlignLeft, AlertCircle } from "lucide-react";
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
    <div id="claim-input-section" className="bg-[#0D1017] border border-stone-800 rounded-xl p-5 shadow-xl shadow-black/40 space-y-3.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#131720] border border-stone-800 text-[#E2C15C]">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-[#F8F9FA] tracking-normal font-sans">
            Target Claim or Text to Verify <span className="text-[#E2C15C]">*</span>
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
          placeholder="Paste a claim, breaking news statement, social media post, or assertion to investigate..."
          rows={4}
          className={`w-full bg-[#08090C] border rounded-xl p-3.5 text-sm text-[#F8F9FA] placeholder:text-[#64748B] focus:outline-none transition-all font-sans leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed shadow-inner ${
            isTooLong
              ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
              : isTooShort
              ? "border-amber-500/60 focus:ring-1 focus:ring-amber-500"
              : "border-stone-800 focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30"
          }`}
        />
        {isTooShort && (
          <p className="text-xs text-amber-400 font-sans mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Please enter at least {INPUT_VALIDATION.minClaimLength} characters ({INPUT_VALIDATION.minClaimLength - charCount} more needed).
          </p>
        )}
        {isTooLong && (
          <p className="text-xs text-rose-400 font-sans mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Claim exceeds maximum limit of {INPUT_VALIDATION.maxClaimLength} characters.
          </p>
        )}
      </div>

      {/* Context Toggle */}
      <div className="pt-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-[#E2C15C] hover:text-[#F3E5B8] flex items-center gap-1.5 transition-colors disabled:opacity-50 font-medium"
        >
          <AlignLeft className="h-3.5 w-3.5" />
          <span>{showContext ? "Hide Source Link / Context" : "+ Add Source Link or Context (Optional)"}</span>
        </button>

        {showContext && (
          <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-200">
            <label htmlFor="context-input" className="text-xs text-[#94A3B8]">
              Optional source URL, article link, or context note:
            </label>
            <input
              id="context-input"
              type="text"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              disabled={disabled}
              placeholder="e.g. https://example.com/article, broadcast on Aug 2026..."
              className="w-full bg-[#08090C] border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-[#F8F9FA] placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-sans disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );
};
