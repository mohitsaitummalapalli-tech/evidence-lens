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
      <div className="bg-[#11151A] border border-[#2A3038] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* State Indicator Text */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {isSubmitting ? (
            <div className="px-3 py-1.5 rounded bg-[#161B21] border border-[#343B45] text-[#D9DEE5] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#D9DEE5]" />
              <span>Retrieving grounded sources & synthesizing multi-AI consensus...</span>
            </div>
          ) : isCompleted ? (
            <div className="px-3 py-1.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Investigation complete. Review evidence dossier and audit trail below.</span>
            </div>
          ) : isError ? (
            <div className="px-3 py-1.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Investigation halted. Check network connection or input parameters.</span>
            </div>
          ) : hasValidInput ? (
            <div className="px-3 py-1.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Assertion registered. Click &quot;Analyze Claim&quot; to execute.</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded bg-[#161B21] border border-[#2A3038] text-[#707984] flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-[#A7AFB8]" />
              <span>Enter a claim above (minimum 5 characters) to start.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end font-mono">
          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded text-xs font-medium text-[#A7AFB8] hover:text-[#F3F5F7] bg-[#161B21] hover:bg-[#1B2027] border border-[#2A3038] hover:border-[#343B45] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasValidInput || isSubmitting}
            className={`px-6 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
              hasValidInput && !isSubmitting
                ? "platinum-button-primary cursor-pointer active:scale-98"
                : "bg-[#161B21] text-[#707984] border border-[#2A3038] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>ANALYZE CLAIM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2.5 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-bold">Investigation Notice</p>
            <p className="text-rose-300 font-sans mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
