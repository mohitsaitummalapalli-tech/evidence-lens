import React from "react";
import { Layers, ShieldCheck, GitBranch } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-500" />
          <span>{APP_CONFIG.name} — PS3 Multimodal Claim Verification</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>Modular Next.js Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <GitBranch className="h-3.5 w-3.5 text-slate-500" />
            <span>Vercel Deployable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
