import React from "react";
import { Shield, Terminal, Activity } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-[#D4AF37]/15 bg-[#08090C]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gold-gradient-bg p-[1px] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10">
            <div className="h-full w-full bg-[#08090C] rounded-[7px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#F8F9FA] tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30">
                v{APP_CONFIG.version}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Phase 1 Active
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] hidden sm:block">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* System Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-[#94A3B8] bg-[#0D1017] px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/15">
            <div className="flex items-center gap-1.5 text-[#E2C15C]">
              <Terminal className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>PS3: Multimodal Provenance</span>
            </div>
            <span className="text-stone-700">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Core Ready</span>
            </div>
          </div>

          <a
            href="https://github.com/mohitsaitummalapalli-tech/evidence-lens"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-[#E2C15C] hover:text-white px-3 py-1.5 rounded-lg bg-[#131720] hover:bg-[#1C2230] border border-[#D4AF37]/25 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Workbench Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
};
