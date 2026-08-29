"use client";

import React from "react";
import { InvestigationUIState } from "@/types";
import { 
  Play, 
  RotateCcw, 
  Loader2, 
  Cpu
} from "lucide-react";

interface InvestigationControlsProps {
  uiState: InvestigationUIState;
  hasValidInput: boolean;
  errorMessage?: string | null;
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
  const isComplete = uiState === "INPUT_RECEIVED";
  const isError = uiState === "ERROR";

  return (
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
      {/* Status & Feedback Text */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="p-2 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] shrink-0">
          <Cpu className="h-4 w-4" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
              Pipeline Controller
            </span>

            <span
              className={`text-[10px] px-2 py-0.2 rounded border font-semibold tracking-wider uppercase ${
                isSubmitting
                  ? "bg-[#050607] text-[#D4AF5A] border-[#D4AF5A] animate-pulse"
                  : isComplete
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/50"
                  : isError
                  ? "bg-rose-950/40 text-rose-300 border-rose-700/50"
                  : hasValidInput
                  ? "bg-[#050607] text-[#D4AF5A] border-[rgba(212,175,90,0.4)]"
                  : "bg-[#050607] text-[#8D949D] border-[rgba(212,175,90,0.2)]"
              }`}
            >
              {uiState}
            </span>
          </div>

          <p className="text-xs text-[#8D949D] font-sans">
            {isSubmitting
              ? "Running multi-stage grounding: decomposition, search, visual match, consensus..."
              : isComplete
              ? "Investigation verified and fully grounded across sources."
              : isError
              ? errorMessage || "An error occurred during verification processing."
              : hasValidInput
              ? "Ready to initiate autonomous investigation."
              : "Enter a claim to activate pipeline verification."}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {(isComplete || isError) && (
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-lg gold-button-secondary text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasValidInput || isSubmitting}
          className="px-6 py-2.5 rounded-lg gold-button-primary text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md w-full sm:w-auto cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#050607]" />
              <span>Analyzing Claim...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current text-[#050607]" />
              <span>Analyze Claim</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
