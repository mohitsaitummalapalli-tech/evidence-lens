"use client";

import React from "react";
import { 
  Play, 
  RotateCcw, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { InvestigationUIState } from "@/types";

interface InvestigationControlsProps {
  uiState: InvestigationUIState;
  hasValidInput: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
  onReset: () => void;
}

export const InvestigationControls: React.FC<InvestigationControlsProps> = ({
  uiState,
  hasValidInput,
  errorMessage,
  onSubmit,
  onReset,
}) => {
  const isSubmitting = uiState === "SUBMITTING";
  const isCompleted = uiState === "INPUT_RECEIVED";
  const isError = uiState === "ERROR";

  return (
    <div className="space-y-3">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* State Indicator Text */}
        <div className="flex items-center gap-2.5 text-xs">
          {isSubmitting ? (
            <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5 font-mono">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Transmitting investigation request to /api/investigate...</span>
            </div>
          ) : isCompleted ? (
            <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="h-4 w-4" />
              <span>Investigation session initialized successfully (Phase 2 validated)</span>
            </div>
          ) : isError ? (
            <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="h-4 w-4" />
              <span>Transmission failed. Review error details below and retry.</span>
            </div>
          ) : hasValidInput ? (
            <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Ready for dispatch — click &quot;Start Investigation&quot; to initialize</span>
            </div>
          ) : (
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1.5 font-mono">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              <span>Enter target claim above (minimum 5 characters required)</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasValidInput || isSubmitting}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-lg ${
              hasValidInput && !isSubmitting
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 cursor-pointer font-bold"
                : "bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {isError && errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Investigation Dispatch Error</p>
            <p className="text-rose-300/90 leading-relaxed font-mono">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
