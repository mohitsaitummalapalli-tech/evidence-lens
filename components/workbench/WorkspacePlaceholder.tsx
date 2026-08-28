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
          <div className="p-1.5 rounded-md bg-[#131720] border border-[#D4AF37]/30 text-[#D4AF37]">
            <Layers className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-[#F8F9FA] tracking-wide uppercase font-mono">
            3. Investigation Workspace
          </h2>
        </div>
        <span
          className={`text-xs font-mono px-3 py-1 rounded-lg border shadow-sm ${
            hasVerification
              ? "bg-emerald-950/50 text-emerald-300 border-emerald-700/50"
              : hasEvidence
              ? "bg-[#D4AF37]/10 text-[#E2C15C] border-[#D4AF37]/30"
              : hasClaims
              ? "bg-[#D4AF37]/10 text-[#E2C15C] border-[#D4AF37]/30"
              : "bg-[#131720] text-[#94A3B8] border-stone-800"
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
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all shadow-xl shadow-black/40 ${
            hasClaims
              ? "bg-[#0D1017]/90 border-[#D4AF37]/30 shadow-[#D4AF37]/5"
              : "bg-[#0D1017]/70 border-[#D4AF37]/15"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F8F9FA] font-semibold">
                <Split className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Extracted Claims ({claims.length})</span>
              </div>
              <span className="text-[10px] font-mono text-[#E2C15C] uppercase bg-[#131720] px-2 py-0.5 rounded border border-[#D4AF37]/30 font-semibold">
                Panel A
              </span>
            </div>

            {hasClaims ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-[#08090C] border border-[#D4AF37]/15 text-xs space-y-1 shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#E2C15C] text-[11px]">
                        {c.id}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#131720] text-[#94A3B8] border border-stone-800">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-[#F8F9FA] font-sans leading-snug text-[11px] line-clamp-2">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-[#08090C] border border-stone-800 text-[#64748B]">
                  <Inbox className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-[#C2C9D6]">No Claims Deconstructed</p>
                <p className="text-[11px] text-[#64748B] leading-relaxed max-w-[220px]">
                  Input text or media above to extract atomic, individually verifiable claim nodes.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-800/80 text-[10px] font-mono flex items-center justify-between">
            <span className={hasClaims ? "text-emerald-400 flex items-center gap-1" : "text-[#64748B]"}>
              {hasClaims && <CheckCircle2 className="h-3 w-3" />}
              {hasClaims ? "Deconstructed via Gemini" : "Entity Extraction: Ready"}
            </span>
            <span className="text-[#64748B]">Taxonomy: PS3</span>
          </div>
        </div>

        {/* Column 2: Evidence & Provenance Corpus (Panel B) */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all shadow-xl shadow-black/40 ${
            hasEvidence
              ? "bg-[#0D1017]/90 border-[#D4AF37]/30 shadow-[#D4AF37]/5"
              : "bg-[#0D1017]/70 border-[#D4AF37]/15"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F8F9FA] font-semibold">
                <Database className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Evidence & Provenance ({totalEvidence})</span>
              </div>
              <span className="text-[10px] font-mono text-[#E2C15C] uppercase bg-[#131720] px-2 py-0.5 rounded border border-[#D4AF37]/30 font-semibold">
                Panel B
              </span>
            </div>

            {hasEvidence && evidence ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {evidence.allSources.slice(0, 6).map((src) => (
                  <div
                    key={src.id}
                    className="p-2.5 rounded-lg bg-[#08090C] border border-[#D4AF37]/15 text-xs space-y-1 shadow-inner"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#E2C15C] font-semibold flex items-center gap-1">
                        <Globe className="h-3 w-3 text-[#D4AF37]/70" />
                        {src.domain}
                      </span>
                      <span className="text-[#94A3B8]">
                        {src.claimId} • {src.stance}
                      </span>
                    </div>
                    <p className="text-[#F8F9FA] font-sans leading-snug text-[11px] line-clamp-1">
                      {src.title}
                    </p>
                  </div>
                ))}
                {totalEvidence > 6 && (
                  <p className="text-[10px] font-mono text-[#94A3B8] text-center pt-1">
                    +{totalEvidence - 6} more sources in evidence panel below
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-[#08090C] border border-stone-800 text-[#64748B]">
                  <Compass className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-[#C2C9D6]">Evidence Corpus Empty</p>
                <p className="text-[11px] text-[#64748B] leading-relaxed max-w-[220px]">
                  Primary sources, archived URLs, and reverse image matches will be logged here with stance metrics in Phase 4.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-800/80 text-[10px] font-mono flex items-center justify-between">
            <span className={hasEvidence ? "text-[#E2C15C] flex items-center gap-1" : "text-[#64748B]"}>
              {hasEvidence && <CheckCircle2 className="h-3 w-3" />}
              {hasEvidence ? "Tavily Multi-Source Indexed" : "Stance Scoring: Standby"}
            </span>
            <span className="text-[#64748B]">Citations: Active</span>
          </div>
        </div>

        {/* Column 3: Verdict Matrix & Reasoning (Panel C) */}
        <div
          className={`rounded-xl p-5 flex flex-col justify-between min-h-[300px] border transition-all shadow-xl shadow-black/40 ${
            hasVerification
              ? "bg-[#0D1017]/90 border-emerald-500/30 shadow-emerald-950/10"
              : "bg-[#0D1017]/70 border-[#D4AF37]/15"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F8F9FA] font-semibold">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verdict & Synthesis</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase bg-[#131720] px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                Panel C
              </span>
            </div>

            {hasVerification && verification ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-[#08090C] border border-stone-800 space-y-1 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#94A3B8]">OVERALL VERDICT</span>
                    <span className="text-emerald-400 font-bold">{verification.overallVerdict}</span>
                  </div>
                  <p className="text-[11px] text-[#C2C9D6] line-clamp-2">
                    {verification.overallSummary}
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {verification.claimVerifications.map((cv) => (
                    <div key={cv.claimId} className="flex items-center justify-between p-2 rounded bg-[#08090C] border border-stone-800 text-[10px] font-mono shadow-inner">
                      <span className="text-[#E2C15C] font-bold">{cv.claimId}</span>
                      <span className={cv.verdict === "TRUE" ? "text-emerald-400 font-semibold" : cv.verdict === "FALSE" ? "text-rose-400 font-semibold" : "text-amber-400 font-semibold"}>
                        {cv.verdict} ({cv.confidence})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 rounded-full bg-[#08090C] border border-stone-800 text-[#64748B]">
                  <Network className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-[#C2C9D6]">Synthesis Engine Idle</p>
                <p className="text-[11px] text-[#64748B] leading-relaxed max-w-[220px]">
                  Calibrated confidence ratings, relational graph edges, and human audit logs render upon verification.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-800/80 text-[10px] font-mono flex items-center justify-between">
            <span className={hasVerification ? "text-emerald-400 flex items-center gap-1" : "text-[#64748B]"}>
              {hasVerification && <ShieldCheck className="h-3 w-3" />}
              {hasVerification ? "Reasoning Complete" : "Graph Engine: Standby"}
            </span>
            <span className="text-[#64748B]">Audit: Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
