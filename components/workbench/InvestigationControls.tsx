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
      <div className="bg-[#0D1017] border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-black/40">
        {/* State Indicator Text */}
        <div className="flex items-center gap-2.5 text-xs">
          {isSubmitting ? (
            <div className="p-2 rounded-lg bg-[#131720] border border-stone-800 text-[#E2C15C] flex items-center gap-2 font-sans shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#E2C15C]" />
              <span>Searching multi-source evidence and running AI consensus...</span>
            </div>
          ) : isCompleted ? (
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-sans shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Analysis complete. Grounded results and evidence ready below.</span>
            </div>
          ) : isError ? (
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 flex items-center gap-2 font-sans shadow-sm">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Unable to complete analysis. Please check your connection and retry.</span>
            </div>
          ) : hasValidInput ? (
            <div className="p-2 rounded-lg bg-[#131720] border border-stone-800 text-[#E2C15C] flex items-center gap-2 font-sans shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#E2C15C] animate-pulse" />
              <span>Ready to analyze. Click &quot;Analyze&quot; to begin.</span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#131720] border border-stone-800 text-[#94A3B8] flex items-center gap-2 font-sans">
              <AlertCircle className="h-4 w-4 text-[#E2C15C]" />
              <span>Enter a claim above (at least 5 characters) to start.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#C2C9D6] hover:text-white bg-[#131720] hover:bg-[#1C2230] border border-stone-800 hover:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasValidInput || isSubmitting}
            className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
              hasValidInput && !isSubmitting
                ? "gold-gradient-bg text-[#08090C] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer active:scale-95"
                : "bg-[#131720] text-stone-600 border border-stone-800 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#08090C]" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-[#08090C]" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Notice</p>
            <p className="text-rose-300 font-sans mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
