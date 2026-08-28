"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  ArrowRight,
  Clock
} from "lucide-react";
import { InvestigationInputResponse } from "@/types";

interface InvestigationResultPanelProps {
  response: InvestigationInputResponse;
}

export const InvestigationResultPanel: React.FC<InvestigationResultPanelProps> = ({
  response,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(response.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-6 shadow-xl shadow-emerald-950/20 space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Investigation Session Initialized
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                STAGE: {response.stage.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {response.message}
            </p>
          </div>
        </div>

        {/* Session ID Badge with Copy */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <div className="text-left font-mono">
            <span className="text-[10px] text-slate-500 block">SESSION ID</span>
            <span className="text-xs text-cyan-400 font-semibold">{response.sessionId}</span>
          </div>
          <button
            type="button"
            onClick={handleCopySessionId}
            title="Copy Session ID"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-1"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Structured Investigation Metadata Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Claim Received Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Target Assertion</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
            &ldquo;{response.input.claim}&rdquo;
          </p>
          <div className="text-[10px] font-mono text-emerald-400 pt-1">
            ✓ Ingested & Validated ({response.input.claim.length} chars)
          </div>
        </div>

        {/* Context & Provenance URL */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>Context / Source Reference</span>
          </div>
          {response.input.contextUrlReceived && response.input.contextUrl ? (
            <>
              <p className="text-xs text-slate-200 font-mono truncate">
                {response.input.contextUrl}
              </p>
              <div className="text-[10px] font-mono text-emerald-400 pt-1">
                ✓ Context URL Bound to Session
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-mono italic">
                No external context URL supplied
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Default: Open Web Provenance
              </div>
            </>
          )}
        </div>

        {/* Media Artifact Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            {response.input.media?.type === "video" ? (
              <Video className="h-3.5 w-3.5 text-blue-400" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span>Multimodal Artifact</span>
          </div>
          {response.input.mediaReceived && response.input.media ? (
            <>
              <p className="text-xs text-slate-200 font-mono truncate">
                {response.input.media.filename}
              </p>
              <div className="text-[10px] font-mono text-emerald-400 pt-1 flex items-center justify-between">
                <span>{response.input.media.mimeType}</span>
                <span>{formatFileSize(response.input.media.sizeBytes)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-mono italic">
                No image/video artifact attached
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Mode: Text-only Assertion
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next Pipeline Stage Notice */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-100">Next Scheduled Phase:</strong> {response.nextStage}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>{showRawJson ? "Hide API Telemetry" : "View Server Telemetry JSON"}</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Raw JSON Debug Viewer */}
      {showRawJson && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              API Response Payload (/api/investigate)
            </span>
            <span className="text-[10px] text-slate-500">HTTP 200 OK</span>
          </div>
          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-emerald-300 font-mono overflow-x-auto max-h-60 leading-relaxed">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
