import React from "react";
import { Shield, Terminal, Activity } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v{APP_CONFIG.version}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Phase 1 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* System Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span>PS3: Multimodal Provenance</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Core Ready</span>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            Workbench Docs
          </a>
        </div>
      </div>
    </header>
  );
};
