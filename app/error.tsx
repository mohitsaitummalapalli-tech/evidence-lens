"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("EvidenceLens Workbench Error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-xl p-6 text-center space-y-4 shadow-xl">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100">
            Workbench Session Error
          </h2>
          <p className="text-xs text-slate-400">
            An unexpected error interrupted the workbench runtime.
          </p>
        </div>

        {error.message && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-xs text-rose-300 break-words">
            {error.message}
          </div>
        )}

        <button
          type="button"
          onClick={() => reset()}
          className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Workbench Session</span>
        </button>
      </div>
    </div>
  );
}
