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
    <div className="bg-[#0D1017]/95 border border-[#D4AF37]/25 rounded-xl p-6 shadow-2xl shadow-black/60 space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/15 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#131720] border border-emerald-500/30 text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Investigation Session Initialized
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#E2C15C] border border-[#D4AF37]/30 font-semibold">
                STAGE: {response.stage.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {response.message}
            </p>
          </div>
        </div>

        {/* Session ID Badge with Copy */}
        <div className="flex items-center gap-2 bg-[#08090C] px-3.5 py-2 rounded-xl border border-[#D4AF37]/20 self-start sm:self-auto shadow-inner">
          <div className="text-left font-mono">
            <span className="text-[10px] text-[#94A3B8] block font-semibold">SESSION ID</span>
            <span className="text-xs text-[#E2C15C] font-semibold">{response.sessionId}</span>
          </div>
          <button
            type="button"
            onClick={handleCopySessionId}
            title="Copy Session ID"
            className="p-1.5 rounded-lg hover:bg-[#131720] text-[#94A3B8] hover:text-[#D4AF37] border border-transparent hover:border-[#D4AF37]/30 transition-all ml-1"
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
        <div className="bg-[#08090C] border border-[#D4AF37]/15 rounded-xl p-4 space-y-2 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#E2C15C]">
            <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Target Assertion</span>
          </div>
          <p className="text-xs text-[#F8F9FA] leading-relaxed font-sans line-clamp-3">
            &ldquo;{response.input.claim}&rdquo;
          </p>
          <div className="text-[10px] font-mono text-emerald-400 pt-1">
            ✓ Ingested & Validated ({response.input.claim.length} chars)
          </div>
        </div>

        {/* Context & Provenance URL */}
        <div className="bg-[#08090C] border border-[#D4AF37]/15 rounded-xl p-4 space-y-2 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#E2C15C]">
            <LinkIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Context / Source Reference</span>
          </div>
          {response.input.contextUrlReceived && response.input.contextUrl ? (
            <>
              <p className="text-xs text-[#F8F9FA] font-mono truncate">
                {response.input.contextUrl}
              </p>
              <div className="text-[10px] font-mono text-emerald-400 pt-1">
                ✓ Context URL Bound to Session
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-[#64748B] font-mono italic">
                No external context URL supplied
              </p>
              <div className="text-[10px] font-mono text-[#94A3B8] pt-1">
                Default: Open Web Provenance
              </div>
            </>
          )}
        </div>

        {/* Media Artifact Card */}
        <div className="bg-[#08090C] border border-[#D4AF37]/15 rounded-xl p-4 space-y-2 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#E2C15C]">
            {response.input.media?.type === "video" ? (
              <Video className="h-3.5 w-3.5 text-[#D4AF37]" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
            )}
            <span>Multimodal Artifact</span>
          </div>
          {response.input.mediaReceived && response.input.media ? (
            <>
              <p className="text-xs text-[#F8F9FA] font-mono truncate">
                {response.input.media.filename}
              </p>
              <div className="text-[10px] font-mono text-emerald-400 pt-1 flex items-center justify-between">
                <span>{response.input.media.mimeType}</span>
                <span>{formatFileSize(response.input.media.sizeBytes)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-[#64748B] font-mono italic">
                No image/video artifact attached
              </p>
              <div className="text-[10px] font-mono text-[#94A3B8] pt-1">
                Mode: Text-only Assertion
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next Pipeline Stage Notice */}
      <div className="bg-[#08090C]/60 border border-stone-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#C2C9D6]">
          <Clock className="h-4 w-4 text-[#D4AF37] shrink-0" />
          <span>
            <strong className="text-[#F8F9FA]">Next Scheduled Phase:</strong> {response.nextStage}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs font-mono text-[#D4AF37] hover:text-[#F3E5B8] flex items-center gap-1.5 transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>{showRawJson ? "Hide API Telemetry" : "View Server Telemetry JSON"}</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Raw JSON Debug Viewer */}
      {showRawJson && (
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-[#E2C15C]">
              <Layers className="h-3.5 w-3.5 text-[#D4AF37]" />
              API Response Payload (/api/investigate)
            </span>
            <span className="text-[10px] text-emerald-400">HTTP 200 OK</span>
          </div>
          <pre className="bg-[#050608] border border-[#D4AF37]/20 rounded-xl p-4 text-xs text-emerald-300 font-mono overflow-x-auto max-h-60 leading-relaxed shadow-inner">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
