import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Compass className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 font-mono">
            404 - Resource Not Found
          </h2>
          <p className="text-xs text-slate-400">
            The requested investigation route or resource does not exist in the workbench registry.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Workbench</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
