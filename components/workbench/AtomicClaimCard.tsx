import React from "react";
import { AtomicClaim, AtomicClaimCategory, ClaimCheckability } from "@/types";
import { 
  MapPin, 
  Tag, 
  GitFork, 
  Clock, 
  Camera, 
  User, 
  Flame, 
  HelpCircle 
} from "lucide-react";

interface AtomicClaimCardProps {
  claim: AtomicClaim;
  index?: number;
}

const CATEGORY_STYLES: Record<
  AtomicClaimCategory,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  event: {
    label: "EVENT",
    bg: "bg-[#161B21]",
    text: "text-[#38BDF8]",
    border: "border-[#2A3038]",
    icon: Flame,
  },
  time: {
    label: "TEMPORAL",
    bg: "bg-[#161B21]",
    text: "text-[#5DADE2]",
    border: "border-[#2A3038]",
    icon: Clock,
  },
  location: {
    label: "LOCATION",
    bg: "bg-[#161B21]",
    text: "text-emerald-400",
    border: "border-[#2A3038]",
    icon: MapPin,
  },
  identity: {
    label: "IDENTITY / ENTITY",
    bg: "bg-[#161B21]",
    text: "text-[#D9DEE5]",
    border: "border-[#2A3038]",
    icon: User,
  },
  media_context: {
    label: "MEDIA PROVENANCE",
    bg: "bg-[#161B21]",
    text: "text-[#38BDF8]",
    border: "border-[#2A3038]",
    icon: Camera,
  },
  causal: {
    label: "CAUSAL LINK",
    bg: "bg-[#161B21]",
    text: "text-amber-400",
    border: "border-[#2A3038]",
    icon: GitFork,
  },
  other: {
    label: "OTHER",
    bg: "bg-[#161B21]",
    text: "text-[#707984]",
    border: "border-[#2A3038]",
    icon: HelpCircle,
  },
};

const CHECKABILITY_BADGES: Record<
  ClaimCheckability,
  { label: string; class: string }
> = {
  high: {
    label: "HIGH CHECKABILITY",
    class: "bg-emerald-950/30 text-emerald-400 border-emerald-800/40",
  },
  medium: {
    label: "MED CHECKABILITY",
    class: "bg-[#161B21] text-[#A7AFB8] border-[#2A3038]",
  },
  low: {
    label: "LOW CHECKABILITY",
    class: "bg-[#161B21] text-[#707984] border-[#2A3038]",
  },
};

export const AtomicClaimCard: React.FC<AtomicClaimCardProps> = ({ claim }) => {
  const cat = CATEGORY_STYLES[claim.category] || CATEGORY_STYLES.other;
  const CategoryIcon = cat.icon;
  const checkBadge = CHECKABILITY_BADGES[claim.checkability] || CHECKABILITY_BADGES.medium;

  return (
    <div className="bg-[#080A0D] border border-[#2A3038] hover:border-[#343B45] rounded-lg p-4 space-y-3 transition-all">
      {/* Card Header: Claim ID + Category Tag + Checkability */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2A3038]">
        <div className="flex items-center gap-2">
          <span className="h-5 px-2 rounded bg-[#161B21] border border-[#2A3038] text-[#F3F5F7] font-mono font-bold text-xs flex items-center justify-center">
            {claim.id}
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 border ${cat.bg} ${cat.text} ${cat.border}`}
          >
            <CategoryIcon className="h-3 w-3" />
            {cat.label}
          </span>
        </div>

        <span
          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${checkBadge.class}`}
        >
          {checkBadge.label}
        </span>
      </div>

      {/* Main Assertion Text */}
      <p className="text-xs sm:text-sm font-medium text-[#F3F5F7] leading-relaxed font-sans">
        &ldquo;{claim.text}&rdquo;
      </p>

      {/* Metadata Attributes (Entities, Time, Location, Dependencies) */}
      <div className="space-y-2 pt-1 border-t border-[#2A3038] text-xs text-[#707984] font-mono">
        {/* Entities */}
        {claim.entities && claim.entities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#707984] flex items-center gap-1">
              <Tag className="h-3 w-3 text-[#B8C0C9]" />
              ENTITIES:
            </span>
            {claim.entities.map((entity, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5] text-[10px]"
              >
                {entity}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
