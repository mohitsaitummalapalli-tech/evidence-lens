import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { APP_CONFIG } from "@/lib/constants";
import { Sparkles, Shield, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero / Workbench Header Section with 3D Elevation Depth */}
      <section className="space-y-4 border-b border-[#D4AF37]/20 pb-7 relative rounded-2xl bg-gradient-to-b from-[#0D1017]/80 to-[#08090C]/90 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,247,214,0.1)] border border-[#D4AF37]/25 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30 shadow-sm">
                <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                PS3 Workbench Platform
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">
                • {APP_CONFIG.phase}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8F9FA] tracking-tight flex items-center gap-3">
              <span className="gold-gradient-text drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]">{APP_CONFIG.name}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded bg-[#131720] border border-[#D4AF37]/20 text-[#D4AF37] hidden sm:inline-flex items-center gap-1 shadow-sm">
                <Shield className="h-3 w-3 text-[#D4AF37]" />
                Forensic Verification
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#C2C9D6] font-medium max-w-2xl">
              {APP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#0D1017] border border-[#D4AF37]/30 px-4 py-2.5 rounded-xl font-mono text-xs text-[#E2C15C] shadow-xl shadow-black/60">
            <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
            <Cpu className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span className="text-[#E2C15C]">Target Pipeline: Multi-source Grounding</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          {APP_CONFIG.description}
        </p>
      </section>

      {/* Main Interactive Analyst Workbench */}
      <EvidenceLensWorkbench />
    </div>
  );
}
