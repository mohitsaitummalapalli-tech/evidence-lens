import React from "react";
import { 
  Split, 
  Database, 
  Network, 
  Scale, 
  Inbox, 
  Layers, 
  Compass 
} from "lucide-react";

export const WorkspacePlaceholder: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            3. Investigation Workspace
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          Status: Awaiting Session Initialization
        </span>
      </div>

      {/* 3-Column Analyst Grid (Deconstructed Claims | Evidence Corpus | Synthesis & Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Atomic Claims */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[280px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                <Split className="h-3.5 w-3.5 text-cyan-400" />
                <span>Extracted Claims (0)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Panel A</span>
            </div>

            <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                <Inbox className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-slate-400">No Claims Deconstructed</p>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                Input text or media above to extract atomic, individually verifiable claim nodes.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Entity Extraction: Ready</span>
            <span>Taxonomy: PS3</span>
          </div>
        </div>

        {/* Column 2: Evidence & Provenance Corpus */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[280px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span>Evidence & Provenance (0)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Panel B</span>
            </div>

            <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                <Compass className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-slate-400">Evidence Corpus Empty</p>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                Primary sources, archived URLs, and reverse image matches will be logged here with stance metrics.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Stance Scoring: Ready</span>
            <span>Citations: Indexed</span>
          </div>
        </div>

        {/* Column 3: Graph Topology & Verdict Matrix */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[280px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verdict & Synthesis</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Panel C</span>
            </div>

            <div className="p-6 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                <Network className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-slate-400">Synthesis Engine Idle</p>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                Calibrated confidence ratings, relational graph edges, and human audit logs will render here.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Graph Engine: Standby</span>
            <span>Audit Trail: Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
