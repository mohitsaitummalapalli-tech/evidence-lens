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
      <div className="bg-[#0D1017]/90 border border-[#D4AF37]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-black/40">
        {/* State Indicator Text */}
        <div className="flex items-center gap-2.5 text-xs">
          {isSubmitting ? (
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#E2C15C] flex items-center gap-2 font-mono shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
              <span>Transmitting investigation request to /api/investigate...</span>
            </div>
          ) : isCompleted ? (
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 font-mono shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Investigation session initialized successfully (Phase 2 validated)</span>
            </div>
          ) : isError ? (
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-400 flex items-center gap-2 font-mono shadow-sm">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Transmission failed. Review error details below and retry.</span>
            </div>
          ) : hasValidInput ? (
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#E2C15C] flex items-center gap-2 font-mono shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
              <span>Ready for dispatch — click &quot;Start Investigation&quot; to initialize</span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#131720] border border-stone-800 text-[#94A3B8] flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 text-[#D4AF37]/60" />
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
            className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold text-[#C2C9D6] hover:text-white bg-[#131720] hover:bg-[#1C2230] border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasValidInput || isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg ${
              hasValidInput && !isSubmitting
                ? "gold-gradient-bg text-[#08090C] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] cursor-pointer active:scale-95"
                : "bg-[#131720] text-stone-600 border border-stone-800/80 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#08090C]" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current text-[#08090C]" />
                <span>Start Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {isError && errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-xs text-rose-300 shadow-lg">
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
