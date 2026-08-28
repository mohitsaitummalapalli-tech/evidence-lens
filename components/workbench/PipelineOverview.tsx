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
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono">
          Verification Pipeline Architecture
        </h3>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
          6-Stage Modular Design
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = STAGE_ICONS[idx % STAGE_ICONS.length];
          return (
            <div
              key={stage.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="p-2 rounded-md bg-slate-900 border border-slate-800 shrink-0 text-cyan-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    0{idx + 1}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
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
