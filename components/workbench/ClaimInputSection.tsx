"use client";

import React, { useState } from "react";
import { INPUT_VALIDATION } from "@/lib/constants";
import {
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";

interface ClaimInputSectionProps {
  claimText: string;
  setClaimText: (val: string) => void;
  contextText: string;
  setContextText: (val: string) => void;
  disabled?: boolean;
}

const EXAMPLE_CLAIMS = [
  "James Webb Space Telescope detected carbon dioxide in an exoplanet atmosphere.",
  "NASA confirmed the discovery of liquid water oceans under the surface of Europa.",
  "Voyager 1 officially entered interstellar space in August 2012.",
];

export const ClaimInputSection: React.FC<ClaimInputSectionProps> = ({
  claimText,
  setClaimText,
  contextText,
  setContextText,
  disabled = false,
}) => {
  const [showContext, setShowContext] = useState<boolean>(Boolean(contextText));
  const charCount = claimText.length;
  const isTooShort = charCount > 0 && charCount < INPUT_VALIDATION.minClaimLength;
  const isTooLong = charCount > INPUT_VALIDATION.maxClaimLength;

  return (
    <div id="claim-input-section" className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Header with Gold Step Number */}
      <div className="flex items-center justify-between border-b border-[rgba(212,175,90,0.2)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded bg-[#131519] border border-[rgba(212,175,90,0.4)] flex items-center justify-center text-[11px] font-bold text-[#D4AF5A]">
            01
          </div>
          <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
            Claim To Verify
          </h2>
        </div>

        <span className="text-[10px] text-[#8D949D] font-sans">
          Plain language statement or news excerpt
        </span>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
            disabled={disabled}
            placeholder="Enter a statement, headline, social media claim, or assertion to ground against primary evidence..."
            rows={4}
            className="w-full bg-[#050607] border border-[rgba(212,175,90,0.25)] focus:border-[#D4AF5A] rounded-lg p-3.5 text-sm text-[#F5F7FA] placeholder:text-[#8D949D] focus:outline-none transition-colors resize-y leading-relaxed font-sans"
            aria-label="Claim Text"
          />

          <div className="flex items-center justify-between text-[11px] text-[#8D949D] px-1 pt-1">
            <div className="flex items-center gap-1.5 font-sans">
              <Info className="h-3 w-3 text-[#D4AF5A]" />
              <span>Min {INPUT_VALIDATION.minClaimLength} chars</span>
            </div>

            <span
              className={`font-mono ${
                isTooShort || isTooLong ? "text-amber-400 font-bold" : "text-[#8D949D]"
              }`}
            >
              {charCount} / {INPUT_VALIDATION.maxClaimLength}
            </span>
          </div>
        </div>
      </div>

      {/* Example Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF5A]">
          <Sparkles className="h-3 w-3" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Sample Claims</span>
        </div>

        <div className="flex flex-wrap gap-1.5 font-sans">
          {EXAMPLE_CLAIMS.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setClaimText(example)}
              disabled={disabled}
              className="text-left text-xs px-2.5 py-1.5 rounded bg-[#050607] hover:bg-[#131519] border border-[rgba(212,175,90,0.2)] hover:border-[rgba(212,175,90,0.45)] text-[#D7DADF] hover:text-[#F5F7FA] transition-all truncate max-w-full"
            >
              &ldquo;{example}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Optional Context URL (Collapsible) */}
      <div className="pt-2 border-t border-[rgba(212,175,90,0.15)]">
        <button
          type="button"
          onClick={() => setShowContext(!showContext)}
          className="flex items-center gap-1.5 text-xs text-[#D7DADF] hover:text-[#D4AF5A] transition-colors"
        >
          <LinkIcon className="h-3 w-3 text-[#D4AF5A]" />
          <span>{showContext ? "Hide Context / Source URL" : "+ Add Context / Reference URL (Optional)"}</span>
          {showContext ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showContext && (
          <div className="mt-2">
            <input
              type="url"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              disabled={disabled}
              placeholder="https://example.com/source-article-or-post"
              className="w-full bg-[#050607] border border-[rgba(212,175,90,0.25)] focus:border-[#D4AF5A] rounded p-2.5 text-xs text-[#F5F7FA] placeholder:text-[#8D949D] focus:outline-none transition-colors font-sans"
            />
          </div>
        )}
      </div>
    </div>
  );
};
