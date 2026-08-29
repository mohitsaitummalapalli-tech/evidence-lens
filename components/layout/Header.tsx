import React from "react";
import { ShieldCheck, Activity, GitBranch } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-[#2A3038] bg-[#080A0D]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & System Identifier */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-[#161B21] border border-[#343B45] flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#D9DEE5]" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-bold text-base text-[#F3F5F7] tracking-tight">
              {APP_CONFIG.name}
            </span>
            <span className="text-[10px] font-mono text-[#A7AFB8] uppercase tracking-wider hidden sm:inline">
              Evidence Workbench
            </span>
          </div>
        </div>

        {/* Workbench Section Navigation & Live Status */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-5 text-xs font-mono text-[#A7AFB8]">
            <a href="#claim-input-section" className="hover:text-[#F3F5F7] transition-colors">
              Investigate
            </a>
            <a href="#evidence-panel" className="hover:text-[#F3F5F7] transition-colors">
              Evidence
            </a>
            <a href="#evidence-graph-panel" className="hover:text-[#F3F5F7] transition-colors">
              Graph
            </a>
            <a href="#investigation-timeline-panel" className="hover:text-[#F3F5F7] transition-colors">
              Audit Trail
            </a>
            <a href="#investigation-history-panel" className="hover:text-[#F3F5F7] transition-colors">
              History
            </a>
          </div>

          <div className="h-4 w-[1px] bg-[#2A3038] hidden lg:block" />

          {/* System Status Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#A7AFB8] bg-[#11151A] px-3 py-1 rounded border border-[#2A3038]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px]">Online</span>
            </div>
            <span className="text-[#343B45]">|</span>
            <span className="text-[11px] text-[#A7AFB8] hidden sm:inline">PS3 Consensus Engine</span>
          </div>

          <a
            href="https://github.com/mohitsaitummalapalli-tech/evidence-lens"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-[#F3F5F7] hover:text-white px-2.5 py-1 rounded bg-[#161B21] hover:bg-[#1B2027] border border-[#343B45] transition-all shadow-sm flex items-center gap-1.5"
          >
            <GitBranch className="h-3 w-3 text-[#A7AFB8]" />
            <span className="hidden sm:inline">Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
};
