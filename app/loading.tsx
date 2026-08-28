import React from "react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 border-b border-slate-800/80 pb-6">
        <div className="h-4 w-36 bg-slate-800/80 rounded" />
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="h-4 w-96 bg-slate-800/60 rounded" />
      </div>

      {/* Input Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-slate-900/60 border border-slate-800 rounded-xl" />
        <div className="h-56 bg-slate-900/60 border border-slate-800 rounded-xl" />
      </div>

      {/* Workspace Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="h-64 bg-slate-900/40 border border-slate-800/80 rounded-xl" />
        <div className="h-64 bg-slate-900/40 border border-slate-800/80 rounded-xl" />
        <div className="h-64 bg-slate-900/40 border border-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}
