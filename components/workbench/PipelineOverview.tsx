import React from "react";
import { PIPELINE_STAGES } from "@/lib/constants";
import { 
  Sparkles, 
  Search, 
  Fingerprint, 
  Network, 
  Scale, 
  UserCheck 
} from "lucide-react";

const STAGE_ICONS = [
  Sparkles,
  Search,
  Fingerprint,
  Network,
  Scale,
  UserCheck,
];

export const PipelineOverview: React.FC = () => {
  return (
    <div className="bg-[#0D1017]/80 border border-[#D4AF37]/20 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#F8F9FA] tracking-wider uppercase font-mono flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
          Verification Pipeline Architecture
        </h3>
        <span className="text-[11px] font-mono text-[#E2C15C] bg-[#131720] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full font-semibold">
          6-Stage Modular Design
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = STAGE_ICONS[idx % STAGE_ICONS.length];
          return (
            <div
              key={stage.id}
              className="bg-[#08090C] border border-stone-800 hover:border-[#D4AF37]/40 rounded-xl p-3.5 flex items-start gap-3 transition-all shadow-sm group"
            >
              <div className="p-2 rounded-lg bg-[#131720] border border-[#D4AF37]/20 shrink-0 text-[#D4AF37] group-hover:border-[#D4AF37]/40 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F8F9FA] group-hover:text-[#E2C15C] transition-colors">
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    0{idx + 1}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
