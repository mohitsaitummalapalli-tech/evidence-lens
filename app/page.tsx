import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { APP_CONFIG } from "@/lib/constants";
import { ShieldCheck, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Clean Professional Hero Header */}
      <section className="space-y-3 border-b border-stone-800 pb-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#131720] text-[#E2C15C] border border-stone-800">
                <ShieldCheck className="h-3.5 w-3.5 text-[#E2C15C]" />
                Multimodal Truth Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8F9FA] tracking-tight">
              <span className="gold-gradient-text">{APP_CONFIG.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] font-normal max-w-2xl">
              {APP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1017] border border-stone-800 px-3.5 py-2 rounded-xl text-xs text-[#C2C9D6] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <Cpu className="h-3.5 w-3.5 text-[#E2C15C]" />
            <span>Multi-Source Grounding & AI Consensus</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Analyst Workbench */}
      <EvidenceLensWorkbench />
    </div>
  );
}
