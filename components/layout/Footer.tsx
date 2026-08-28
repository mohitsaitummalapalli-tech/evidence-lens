import React from "react";
import { Layers, ShieldCheck, GitBranch } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D4AF37]/15 bg-[#08090C]/80 py-6 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8] font-mono">
        <div className="flex items-center gap-2 text-[#E2C15C]">
          <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
          <span>{APP_CONFIG.name} — PS3 Multimodal Claim Verification</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Layers className="h-3.5 w-3.5 text-[#D4AF37]/70" />
            <span>Modular Next.js Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <GitBranch className="h-3.5 w-3.5 text-[#D4AF37]/70" />
            <span>Vercel Deployable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
