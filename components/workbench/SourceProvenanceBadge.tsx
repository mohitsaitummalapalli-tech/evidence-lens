"use client";

import React from "react";
import { GeminiLogo, TavilyLogo, OpenAILogo, AnthropicLogo } from "./ProviderLogos";

export interface SourceProvenanceInfo {
  url?: string;
  domain: string;
  sourceType?: string;
  retrievalProvider?: "Tavily" | "Serper" | "DirectWeb" | string;
  analysisProviders?: Array<"Gemini" | "OpenAI" | "Anthropic" | string>;
  modelName?: string;
}

interface SourceProvenanceBadgeProps {
  provenance: SourceProvenanceInfo;
  compact?: boolean;
}

export const SourceProvenanceBadge: React.FC<SourceProvenanceBadgeProps> = ({
  provenance,
  compact = false,
}) => {
  const retrieval = provenance.retrievalProvider || "Tavily";
  const analysis = provenance.analysisProviders || ["Gemini"];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className="flex items-center gap-1 text-[#8D949D] px-1.5 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
          <span className="text-[#8D949D]">via</span>
          <TavilyLogo className="h-2.5 w-2.5 text-[#38BDF8]" />
          <span className="text-[#D7DADF] font-semibold">{retrieval}</span>
        </span>
        <span className="flex items-center gap-1 text-[#8D949D] px-1.5 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)]">
          <span className="text-[#8D949D]">eval</span>
          <GeminiLogo className="h-2.5 w-2.5 text-[#D4AF5A]" />
          <span className="text-[#D7DADF] font-semibold">{provenance.modelName || "Gemini"}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-[rgba(212,175,90,0.15)]">
      {/* Retrieved Via */}
      <div className="p-2 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)] flex flex-col justify-between">
        <span className="text-[9px] uppercase tracking-wider text-[#8D949D] font-bold">
          Retrieved Via
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-[#F5F7FA]">
          <TavilyLogo className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
          <span className="font-semibold truncate">{retrieval}</span>
        </div>
      </div>

      {/* Analyzed By */}
      <div className="p-2 rounded bg-[#050607] border border-[rgba(212,175,90,0.2)] flex flex-col justify-between">
        <span className="text-[9px] uppercase tracking-wider text-[#8D949D] font-bold">
          Analyzed By
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-[#F5F7FA] flex-wrap">
          {analysis.map((prov, idx) => (
            <span key={idx} className="flex items-center gap-1 font-semibold truncate">
              {prov.toLowerCase().includes("gemini") && (
                <GeminiLogo className="h-3.5 w-3.5 text-[#D4AF5A] shrink-0" />
              )}
              {prov.toLowerCase().includes("openai") && (
                <OpenAILogo className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              {prov.toLowerCase().includes("anthropic") && (
                <AnthropicLogo className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              )}
              <span className="truncate">{provenance.modelName || prov}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
