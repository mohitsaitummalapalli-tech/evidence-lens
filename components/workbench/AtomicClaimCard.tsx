import React from "react";
import { AtomicClaim, AtomicClaimCategory, ClaimCheckability } from "@/types";
import { 
  Calendar, 
  MapPin, 
  Tag, 
  GitFork, 
  Clock, 
  Sparkles, 
  Camera, 
  User, 
  Flame, 
  HelpCircle 
} from "lucide-react";

interface AtomicClaimCardProps {
  claim: AtomicClaim;
  index: number;
}

const CATEGORY_STYLES: Record<
  AtomicClaimCategory,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  event: {
    label: "EVENT",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: Flame,
  },
  time: {
    label: "TEMPORAL",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: Clock,
  },
  location: {
    label: "LOCATION",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: MapPin,
  },
  identity: {
    label: "IDENTITY / ENTITY",
    bg: "bg-[#D4AF37]/10",
    text: "text-[#E2C15C]",
    border: "border-[#D4AF37]/30",
    icon: User,
  },
  media_context: {
    label: "MEDIA PROVENANCE",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: Camera,
  },
  causal: {
    label: "CAUSAL LINK",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: GitFork,
  },
  other: {
    label: "OTHER",
    bg: "bg-stone-500/10",
    text: "text-stone-400",
    border: "border-stone-500/30",
    icon: HelpCircle,
  },
};

const CHECKABILITY_BADGES: Record<
  ClaimCheckability,
  { label: string; class: string }
> = {
  high: {
    label: "HIGH CHECKABILITY",
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  medium: {
    label: "MED CHECKABILITY",
    class: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  low: {
    label: "LOW CHECKABILITY",
    class: "bg-stone-500/10 text-stone-400 border-stone-500/30",
  },
};

export const AtomicClaimCard: React.FC<AtomicClaimCardProps> = ({ claim }) => {
  const cat = CATEGORY_STYLES[claim.category] || CATEGORY_STYLES.other;
  const CategoryIcon = cat.icon;
  const checkBadge = CHECKABILITY_BADGES[claim.checkability] || CHECKABILITY_BADGES.medium;

  return (
    <div className="bg-[#08090C] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md group">
      {/* Card Header: Claim ID + Category Tag + Checkability */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded bg-[#131720] border border-[#D4AF37]/40 text-[#E2C15C] font-mono font-bold text-xs flex items-center justify-center shadow-inner">
            {claim.id}
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${cat.bg} ${cat.text} ${cat.border}`}
          >
            <CategoryIcon className="h-3 w-3" />
            {cat.label}
          </span>
        </div>

        <span
          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${checkBadge.class}`}
        >
          {checkBadge.label}
        </span>
      </div>

      {/* Main Assertion Text */}
      <p className="text-sm font-medium text-[#F8F9FA] leading-relaxed font-sans">
        &ldquo;{claim.text}&rdquo;
      </p>

      {/* Metadata Attributes (Entities, Time, Location, Dependencies) */}
      <div className="space-y-2 pt-1 border-t border-stone-900 text-xs text-[#94A3B8] font-mono">
        {/* Entities */}
        {claim.entities && claim.entities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#64748B] flex items-center gap-1">
              <Tag className="h-3 w-3" />
              ENTITIES:
            </span>
            {claim.entities.map((entity, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-[#131720] border border-stone-800 text-[#C2C9D6] text-[11px]"
              >
                {entity}
              </span>
            ))}
          </div>
        )}

        {/* Temporal & Spatial References */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {claim.timeReference && (
            <div className="flex items-center gap-1 text-purple-300">
              <Calendar className="h-3 w-3 text-purple-400" />
              <span>{claim.timeReference}</span>
            </div>
          )}
          {claim.locationReference && (
            <div className="flex items-center gap-1 text-emerald-300">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{claim.locationReference}</span>
            </div>
          )}
          {claim.dependsOn && claim.dependsOn.length > 0 && (
            <div className="flex items-center gap-1 text-amber-300">
              <GitFork className="h-3 w-3 text-amber-400" />
              <span>Depends on: {claim.dependsOn.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-2 border-t border-stone-900">
        <span className="flex items-center gap-1 text-[#E2C15C]">
          <Sparkles className="h-3 w-3" />
          Atomic Unit Extracted
        </span>
        <span className="text-[#94A3B8]">Connected to Evidence Retrieval</span>
      </div>
    </div>
  );
};
