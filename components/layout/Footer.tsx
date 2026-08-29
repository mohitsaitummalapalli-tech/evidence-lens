import React from "react";
import { ShieldCheck, Layers, Terminal } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#2A3038] bg-[#080A0D] py-6 mt-16 text-xs text-[#707984] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#A7AFB8]">
          <ShieldCheck className="h-4 w-4 text-[#B8C0C9]" />
          <span>{APP_CONFIG.name} — Grounded Truth & Evidence Verification Engine</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[#707984]">
            <Layers className="h-3.5 w-3.5 text-[#A7AFB8]" />
            <span>Deterministic Provenance & Consensus</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#707984]">
            <Terminal className="h-3.5 w-3.5 text-[#A7AFB8]" />
            <span>Zero Fabrication Contract</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
