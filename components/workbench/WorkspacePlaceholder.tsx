import React from "react";
import { 
  Split, 
  Database, 
  Network, 
  Scale, 
  Inbox, 
  Layers, 
  Compass,
  CheckCircle2,
  Globe,
  ShieldCheck
} from "lucide-react";
import { AtomicClaim, EvidenceRetrievalResult, InvestigationVerificationResult } from "@/types";

interface WorkspacePlaceholderProps {
  claims?: AtomicClaim[];
  evidence?: EvidenceRetrievalResult;
  verification?: InvestigationVerificationResult;
}

export const WorkspacePlaceholder: React.FC<WorkspacePlaceholderProps> = ({
  claims = [],
  evidence,
  verification,
}) => {
  const hasClaims = claims.length > 0;
  const hasEvidence = Boolean(evidence && evidence.allSources && evidence.allSources.length > 0);
  const hasVerification = Boolean(verification && verification.claimVerifications.length > 0);
  const totalEvidence = evidence?.allSources?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            3. Investigation Workspace
          </h2>
        </div>
        <span
          className={`text-xs font-mono px-2.5 py-1 rounded border ${
            hasVerification
              ? "bg-emerald-950/50 text-emerald-300 border-emerald-700/50"
              : hasEvidence
              ? "bg-blue-950/40 text-blue-300 border-blue-800/40"
              : hasClaims
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
              : "bg-slate-900 text-slate-400 border-slate-800"
          }`}
        >
          {hasVerification && verification
            ? `Status: Phase 5 Active (${verification.overallVerdict} | ${verification.overallConfidence} Confidence)`
            : hasEvidence
            ? `Status: Phase 4 Active (${claims.length} Claims | ${totalEvidence} Evidence Sources)`
            : hasClaims
            ? `Status: Phase 3 Active (${claims.length} Claims Indexed)`
            : "Status: Awaiting Session Initialization"}
        </span>
      </div>

      {/* 3-Column Analyst Grid (Deconstructed Claims | Evidence Corpus | Synthesis & Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Atomic Claims (Panel A) */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all ${
            hasClaims
              ? "bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/10"
              : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold">
                <Split className="h-3.5 w-3.5 text-cyan-400" />
                <span>Extracted Claims ({claims.length})</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
                Panel A
              </span>
            </div>

            {hasClaims ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-[11px]">
                        {c.id}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-slate-200 font-sans leading-snug text-[11px] line-clamp-2">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                  <Inbox className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-slate-400">No Claims Deconstructed</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                  Input text or media above to extract atomic, individually verifiable claim nodes.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono flex items-center justify-between">
            <span className={hasClaims ? "text-emerald-400 flex items-center gap-1" : "text-slate-500"}>
              {hasClaims && <CheckCircle2 className="h-3 w-3" />}
              {hasClaims ? "Deconstructed via Gemini" : "Entity Extraction: Ready"}
            </span>
            <span className="text-slate-500">Taxonomy: PS3</span>
          </div>
        </div>

        {/* Column 2: Evidence & Provenance Corpus (Panel B) */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all ${
            hasEvidence
              ? "bg-slate-900/80 border-blue-500/40 shadow-lg shadow-blue-950/10"
              : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span>Evidence & Provenance ({totalEvidence})</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 uppercase bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-800/40">
                Panel B
              </span>
            </div>

            {hasEvidence && evidence ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {evidence.allSources.slice(0, 6).map((src) => (
                  <div
                    key={src.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-500" />
                        {src.domain}
                      </span>
                      <span className="text-slate-400">
                        {src.claimId} • {src.stance}
                      </span>
                    </div>
                    <p className="text-slate-200 font-sans leading-snug text-[11px] line-clamp-1">
                      {src.title}
                    </p>
                  </div>
                ))}
                {totalEvidence > 6 && (
                  <p className="text-[10px] font-mono text-slate-500 text-center pt-1">
                    +{totalEvidence - 6} more sources in evidence panel below
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                  <Compass className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-slate-400">Evidence Corpus Empty</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                  Primary sources, archived URLs, and reverse image matches will be logged here with stance metrics in Phase 4.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono flex items-center justify-between">
            <span className={hasEvidence ? "text-blue-400 flex items-center gap-1" : "text-slate-500"}>
              {hasEvidence && <CheckCircle2 className="h-3 w-3" />}
              {hasEvidence ? "Tavily Multi-Source Indexed" : "Stance Scoring: Standby"}
            </span>
            <span className="text-slate-500">Citations: Active</span>
          </div>
        </div>

        {/* Column 3: Verdict Matrix & Reasoning (Panel C) */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all ${
            hasVerification
              ? "bg-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-950/10"
              : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verdict & Synthesis</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                Panel C
              </span>
            </div>

            {hasVerification && verification ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">OVERALL VERDICT</span>
                    <span className="text-emerald-400 font-bold">{verification.overallVerdict}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {verification.overallSummary}
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {verification.claimVerifications.map((cv) => (
                    <div key={cv.claimId} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
                      <span className="text-cyan-400 font-bold">{cv.claimId}</span>
                      <span className={cv.verdict === "TRUE" ? "text-emerald-400" : cv.verdict === "FALSE" ? "text-rose-400" : "text-amber-400"}>
                        {cv.verdict} ({cv.confidence})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                  <Network className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-slate-400">Synthesis Engine Idle</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                  Calibrated confidence ratings, relational graph edges, and human audit logs render upon verification.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono flex items-center justify-between">
            <span className={hasVerification ? "text-emerald-400 flex items-center gap-1" : "text-slate-500"}>
              {hasVerification && <ShieldCheck className="h-3 w-3" />}
              {hasVerification ? "Reasoning Complete" : "Graph Engine: Standby"}
            </span>
            <span className="text-slate-500">Audit: Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
