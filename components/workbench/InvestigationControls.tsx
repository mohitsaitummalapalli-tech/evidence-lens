"use client";

import React from "react";
import { RotateCcw, AlertCircle, Cpu } from "lucide-react";

interface InvestigationControlsProps {
  claimText: string;
  onReset: () => void;
}

export const InvestigationControls: React.FC<InvestigationControlsProps> = ({
  claimText,
  onReset,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-xs text-slate-400">
        <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-300">Phase 1 Foundation Mode:</span>{" "}
          <span>Pipeline engines (AI extraction, retrieval, and verdict graph) initialize in Phase 2.</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={!claimText}
          className="px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Input</span>
        </button>

        <button
          type="button"
          disabled={true}
          title="Investigation Engine will activate in Phase 2"
          className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700/80 cursor-not-allowed flex items-center gap-2 shadow-inner"
        >
          <Cpu className="h-3.5 w-3.5 text-slate-500" />
          <span>Start Investigation (Phase 2)</span>
        </button>
      </div>
    </div>
  );
};
