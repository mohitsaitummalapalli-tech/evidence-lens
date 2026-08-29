"use client";

import React from "react";
import { Shield, Lock, Terminal, Cpu } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050607] border-t border-[rgba(212,175,90,0.2)] py-10 font-mono text-xs">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Top summary row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[rgba(212,175,90,0.15)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#F5F7FA]">
              <Shield className="h-4 w-4 text-[#D4AF5A]" />
              <span>EVIDENCE<span className="text-[#D4AF5A]">LENS</span></span>
              <span className="text-[10px] text-[#8D949D] font-normal font-sans">
                — Autonomous Multimodal Verification System
              </span>
            </div>
            <p className="text-[#8D949D] font-sans text-xs max-w-xl">
              Zero-fabrication intelligence workbench. Grounded evidence aggregation across open web indices, video archives, visual provenance, and multi-model consensus.
            </p>
          </div>

          {/* Core specs badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#D7DADF]">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Cpu className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Multi-AI Consensus</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Lock className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Deterministic Audit</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Terminal className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Strict Citation Grounding</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8D949D]">
          <div>
            © {new Date().getFullYear()} EvidenceLens Intelligence. All verified citations traceable to primary URLs.
          </div>
          <div className="flex items-center gap-4 text-[#D7DADF]">
            <span className="hover:text-[#D4AF5A] transition-colors cursor-pointer">Grounding Engine</span>
            <span>•</span>
            <span className="hover:text-[#D4AF5A] transition-colors cursor-pointer">Deterministic Pipeline</span>
            <span>•</span>
            <span className="hover:text-[#D4AF5A] transition-colors cursor-pointer">Zero Fabrication Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
