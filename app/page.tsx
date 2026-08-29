import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { APP_CONFIG } from "@/lib/constants";
import { ShieldCheck, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Clean Editorial Hero Header */}
      <section className="space-y-3 border-b border-stone-800/80 pb-5 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/40 text-red-400 border border-red-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                Multimodal Truth Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8F9FA] tracking-tight">
              <span className="brand-gradient-text">{APP_CONFIG.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] font-normal max-w-2xl">
              {APP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#11141A] border border-stone-800 px-3.5 py-2 rounded-xl text-xs text-[#C2C9D6] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="h-3.5 w-3.5 text-red-400" />
            <span>Multi-Source Grounding & AI Jury</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Truth Verification Workbench */}
      <EvidenceLensWorkbench />
    </div>
  );
}
