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
      <div className="bg-[#11141A] border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        {/* State Indicator Text */}
        <div className="flex items-center gap-2.5 text-xs">
          {isSubmitting ? (
            <div className="p-2 rounded-lg bg-[#161B24] border border-stone-800 text-red-300 flex items-center gap-2 font-sans shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              <span>Searching multi-source evidence and running AI jury...</span>
            </div>
          ) : isCompleted ? (
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-sans shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Verification complete. Grounded results and sources ready below.</span>
            </div>
          ) : isError ? (
            <div className="p-2 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 flex items-center gap-2 font-sans shadow-sm">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span>Unable to complete analysis. Please check your connection and retry.</span>
            </div>
          ) : hasValidInput ? (
            <div className="p-2 rounded-lg bg-[#161B24] border border-stone-800 text-[#CBD5E1] flex items-center gap-2 font-sans shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ready to verify. Click &quot;Analyze&quot; to begin.</span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#161B24] border border-stone-800 text-[#94A3B8] flex items-center gap-2 font-sans">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>Enter a claim or question above (at least 5 characters) to start.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#161B24] hover:bg-[#1E2430] border border-stone-800 hover:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
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
                ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] cursor-pointer active:scale-95"
                : "bg-[#161B24] text-stone-600 border border-stone-800 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-white" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Notice</p>
            <p className="text-red-300 font-sans mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
