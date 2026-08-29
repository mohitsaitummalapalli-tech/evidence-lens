import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { APP_CONFIG } from "@/lib/constants";
import { ShieldCheck, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Precision Workbench Header Bar */}
      <section className="border-b border-[#2A3038] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-[#D9DEE5] bg-[#161B21] border border-[#2A3038]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#B8C0C9]" />
                PS3 Grounded Multimodal Investigation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
              <span className="platinum-gradient-text">{APP_CONFIG.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A7AFB8] max-w-2xl">
              {APP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#11151A] border border-[#2A3038] px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#A7AFB8] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <Cpu className="h-3.5 w-3.5 text-[#D9DEE5]" />
            <span>Shared Evidence Consensus Engine</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Truth Verification Workbench */}
      <EvidenceLensWorkbench />
    </div>
  );
}
