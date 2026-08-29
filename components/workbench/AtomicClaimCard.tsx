"use client";

import React from "react";
import { AtomicClaim, ClaimCheckability } from "@/types";
import { CheckCircle2, HelpCircle, Tag, Clock, MapPin } from "lucide-react";

interface AtomicClaimCardProps {
  claim: AtomicClaim;
}

const CHECKABILITY_THEMES: Record<
  ClaimCheckability,
  {
    label: string;
    badgeBg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  high: {
    label: "HIGH CHECKABILITY",
    badgeBg: "bg-[#0D0F12]",
    text: "text-[#D4AF5A]",
    border: "border-[rgba(212,175,90,0.4)]",
    icon: CheckCircle2,
  },
  medium: {
    label: "PARTIAL CHECKABILITY",
    badgeBg: "bg-[#0D0F12]",
    text: "text-[#D7DADF]",
    border: "border-[rgba(212,175,90,0.25)]",
    icon: HelpCircle,
  },
  low: {
    label: "SUBJECTIVE / LOW",
    badgeBg: "bg-[#0D0F12]",
    text: "text-[#8D949D]",
    border: "border-[rgba(212,175,90,0.2)]",
    icon: HelpCircle,
  },
};

export const AtomicClaimCard: React.FC<AtomicClaimCardProps> = ({ claim }) => {
  const checkTheme =
    CHECKABILITY_THEMES[claim.checkability] || CHECKABILITY_THEMES.high;

  return (
    <div className="p-4 rounded-lg bg-[#050607] hover:bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)] transition-all space-y-3 font-mono">
      {/* Header: ID + Category + Checkability */}
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(212,175,90,0.18)] text-xs">
        <div className="flex items-center gap-2">
          <span className="h-5 px-1.5 rounded bg-[#131519] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A] font-bold text-[10px] flex items-center justify-center">
            {claim.id}
          </span>
          <span className="text-[10px] text-[#8D949D] uppercase">
            {claim.category}
          </span>
        </div>

        <span
          className={`text-[9px] px-2 py-0.5 rounded border font-semibold uppercase ${checkTheme.badgeBg} ${checkTheme.text} ${checkTheme.border}`}
        >
          {checkTheme.label}
        </span>
      </div>

      {/* Claim Text */}
      <p className="text-xs sm:text-sm font-semibold text-[#F5F7FA] font-sans leading-snug">
        &ldquo;{claim.text}&rdquo;
      </p>

      {/* Entities & Temporal/Location Reference */}
      <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8D949D]">
        {claim.entities && claim.entities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 text-[#D4AF5A]" />
            {claim.entities.map((ent, i) => (
              <span
                key={i}
                className="px-1.5 py-0.2 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.2)] text-[#D7DADF]"
              >
                {ent}
              </span>
            ))}
          </div>
        )}

        {claim.timeReference && (
          <span className="text-[#D4AF5A] flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {claim.timeReference}
          </span>
        )}

        {claim.locationReference && (
          <span className="text-[#D7DADF] flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-[#D4AF5A]" />
            {claim.locationReference}
          </span>
        )}
      </div>
    </div>
  );
};
