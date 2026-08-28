"use client";

import React from "react";
import { UploadCloud, Image as ImageIcon, Video, FileText, Lock, Music } from "lucide-react";
import { SUPPORTED_MEDIA_TYPES } from "@/lib/constants";

export const MediaUploadSection: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            2. Multimodal Artifacts
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          <Lock className="h-3 w-3 text-slate-400" />
          <span>Scheduled for Phase 2</span>
        </div>
      </div>

      {/* Disabled Dropzone Visual Placeholder */}
      <div className="border-2 border-dashed border-slate-800 bg-slate-950/40 rounded-lg p-6 flex flex-col items-center justify-center text-center group relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3 text-slate-600">
          <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
            <ImageIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
            <Video className="h-5 w-5 text-slate-500" />
          </div>
          <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
            <Music className="h-5 w-5 text-slate-500" />
          </div>
          <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
            <FileText className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        <p className="text-sm font-medium text-slate-300">
          Drag and drop media files or click to inspect provenance
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Images, audio recordings, video clips, and PDF dossiers will be ingested here for forensic metadata & reverse search matching.
        </p>

        {/* Format Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            IMG: {SUPPORTED_MEDIA_TYPES.images.join(", ")}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            VID: {SUPPORTED_MEDIA_TYPES.video.join(", ")}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            DOC: {SUPPORTED_MEDIA_TYPES.documents.join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
};
