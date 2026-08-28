import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { APP_CONFIG } from "@/lib/constants";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero / Workbench Header Section */}
      <section className="space-y-3 border-b border-slate-800/80 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="h-3 w-3" />
                PS3 Workbench Platform
              </span>
              <span className="text-xs font-mono text-slate-500">
                • {APP_CONFIG.phase}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
              <span>{APP_CONFIG.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
              {APP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-lg font-mono text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Target Pipeline: Multi-source Grounding</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          {APP_CONFIG.description}
        </p>
      </section>

      {/* Main Interactive Analyst Workbench */}
      <EvidenceLensWorkbench />
    </div>
  );
}
