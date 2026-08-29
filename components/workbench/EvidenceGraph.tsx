"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ClaimExtractionResult,
  EvidenceRetrievalResult,
  ImageProvenanceResult,
  InvestigationVerificationResult,
} from "@/types";
import {
  EvidenceGraphNode,
  GraphNodeData,
} from "./EvidenceGraphNode";
import {
  EvidenceGraphEdge,
  GraphEdgeData,
} from "./EvidenceGraphEdge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  X,
  ExternalLink,
} from "lucide-react";

interface EvidenceGraphProps {
  extraction?: ClaimExtractionResult | null;
  evidence?: EvidenceRetrievalResult | null;
  verification?: InvestigationVerificationResult | null;
  imageProvenance?: ImageProvenanceResult | null;
  originalClaim?: string;
  isInitializing?: boolean;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  extraction,
  evidence,
  verification,
  imageProvenance,
  originalClaim,
  isInitializing = false,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute Layout: Root -> Atomic Claims -> Grounded Evidence & Media Candidates
  const { nodes, edges } = useMemo(() => {
    const nodeList: { node: GraphNodeData; x: number; y: number }[] = [];
    const edgeList: GraphEdgeData[] = [];

    const rootX = 40;
    const rootY = 220;

    // 1. Root Node (Target Assertion)
    const rootNode: GraphNodeData = {
      id: "root",
      type: "root",
      label: originalClaim || "Target Assertion",
      verdict: verification?.overallVerdict,
    };
    nodeList.push({ node: rootNode, x: rootX, y: rootY });

    const claims = extraction?.claims || [];
    const sources = evidence?.allSources || [];
    const candidates = imageProvenance?.candidates || [];

    const claimColX = 360;
    const evidenceColX = 700;

    // Compute spacing
    const claimSpacing = Math.max(120, 480 / Math.max(1, claims.length));
    const startClaimY = Math.max(40, rootY - ((claims.length - 1) * claimSpacing) / 2);

    // 2. Atomic Claim Nodes
    claims.forEach((c, cIdx) => {
      const cY = startClaimY + cIdx * claimSpacing;
      const cNode: GraphNodeData = {
        id: c.id,
        type: "claim",
        label: c.text,
        sublabel: c.category,
      };
      nodeList.push({ node: cNode, x: claimColX, y: cY });

      // Edge from Root -> Claim
      edgeList.push({
        id: `root-${c.id}`,
        sourceId: "root",
        targetId: c.id,
        type: "hierarchy",
        fromX: rootX + 256,
        fromY: rootY + 36,
        toX: claimColX,
        toY: cY + 36,
      });

      // 3. Evidence Nodes linked to this Claim
      const claimSources = sources.filter((s) => s.claimId === c.id);
      const evSpacing = 95;
      const startEvY = Math.max(20, cY - ((claimSources.length - 1) * evSpacing) / 2);

      claimSources.forEach((s, sIdx) => {
        const evY = startEvY + sIdx * evSpacing;
        const evNode: GraphNodeData = {
          id: s.id,
          type: "evidence",
          label: s.title,
          url: s.url,
          domain: s.domain,
          stance: s.stance as "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT",
          sourceType: s.sourceType,
        };
        nodeList.push({ node: evNode, x: evidenceColX, y: evY });

        // Edge from Claim -> Evidence
        const edgeType: "supports" | "contradicts" | "insufficient" =
          s.stance === "SUPPORTS"
            ? "supports"
            : s.stance === "CONTRADICTS"
            ? "contradicts"
            : "insufficient";

        edgeList.push({
          id: `${c.id}-${s.id}`,
          sourceId: c.id,
          targetId: s.id,
          type: edgeType,
          fromX: claimColX + 256,
          fromY: cY + 36,
          toX: evidenceColX,
          toY: evY + 36,
        });
      });
    });

    // 4. Media Provenance Candidates (if any)
    if (candidates.length > 0) {
      const mediaColX = evidenceColX;
      const mediaStartY = startClaimY + claims.length * claimSpacing + 40;

      candidates.slice(0, 3).forEach((cand, idx) => {
        const mY = mediaStartY + idx * 95;
        const mNode: GraphNodeData = {
          id: cand.id,
          type: "media",
          label: cand.title,
          domain: cand.domain,
          url: cand.url,
          sourceType: cand.sourceType,
        };
        nodeList.push({ node: mNode, x: mediaColX, y: mY });

        // Edge from Root -> Media
        edgeList.push({
          id: `root-${cand.id}`,
          sourceId: "root",
          targetId: cand.id,
          type: "provenance",
          fromX: rootX + 256,
          fromY: rootY + 36,
          toX: mediaColX,
          toY: mY + 36,
        });
      });
    }

    return { nodes: nodeList, edges: edgeList };
  }, [extraction, evidence, verification, imageProvenance, originalClaim]);

  return (
    <div id="evidence-graph-panel" className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Graph Toolbar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
              Relational Evidence Map
            </h2>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Interactive topological projection: Target claim → Atomic units → Grounded primary sources
            </p>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#D7DADF] pr-3 border-r border-[rgba(212,175,90,0.2)]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#D4AF5A]" /> Claim
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Supports
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Contradicts
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> Media
            </span>
          </div>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setSelectedNode(null);
            }}
            className="p-1.5 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] transition-colors"
            title="Reset View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Visual Viewport */}
      <div
        ref={containerRef}
        className="h-[520px] w-full rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] relative overflow-x-auto overflow-y-hidden select-none"
        style={{
          backgroundImage: `radial-gradient(rgba(212, 175, 90, 0.12) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      >
        {isInitializing ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#D4AF5A]">
            <span>Synthesizing topological graph nodes...</span>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: "1050px",
              height: "520px",
              position: "relative",
            }}
          >
            {/* SVG Edges Layer */}
            <svg
              className="edges-layer absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            >
              {edges.map((edge) => (
                <EvidenceGraphEdge key={edge.id} edge={edge} />
              ))}
            </svg>

            {/* DOM Nodes Layer */}
            <div className="nodes-layer">
              {nodes.map(({ node, x, y }) => (
                <EvidenceGraphNode
                  key={node.id}
                  node={node}
                  x={x}
                  y={y}
                  isSelected={selectedNode?.id === node.id}
                  onSelect={(n) => setSelectedNode(n)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 max-w-sm rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.4)] p-4 shadow-xl space-y-2 z-30 font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(212,175,90,0.2)]">
              <span className="font-bold text-[#D4AF5A]">
                NODE: {selectedNode.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-[#8D949D] hover:text-[#F5F7FA]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#F5F7FA] font-sans leading-relaxed">
              {selectedNode.label}
            </p>

            {selectedNode.url && (
              <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between">
                <span className="text-[10px] text-[#8D949D] truncate max-w-[180px]">
                  {selectedNode.domain}
                </span>
                <a
                  href={selectedNode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#D4AF5A] hover:underline flex items-center gap-1"
                >
                  <span>Open URL</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
