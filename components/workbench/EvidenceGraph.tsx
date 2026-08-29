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
import { SourceProvenanceBadge } from "./SourceProvenanceBadge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  X,
  ExternalLink,
  ChevronsDown,
  ChevronsUp,
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
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);
  // Store explicitly collapsed claim IDs; by default all claims are expanded
  const [collapsedClaimIds, setCollapsedClaimIds] = useState<Set<string>>(() => new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleExpand = (claimId: string) => {
    setCollapsedClaimIds((prev) => {
      const next = new Set(prev);
      if (next.has(claimId)) {
        next.delete(claimId); // Expand
      } else {
        next.add(claimId); // Collapse
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedClaimIds(new Set());
  };

  const handleCollapseAll = () => {
    const claims = extraction?.claims || [];
    setCollapsedClaimIds(new Set(claims.map((c) => c.id)));
  };

  // Node selection and path highlighting
  const handleNodeClick = (node: GraphNodeData) => {
    setSelectedNode(node);
    if (node.type === "claim") {
      setHighlightedClaimId((prev) => (prev === node.id ? null : node.id));
    } else if (node.type === "evidence" && node.claimId) {
      setHighlightedClaimId(node.claimId);
    } else {
      setHighlightedClaimId(null);
    }
  };

  // Clear selection on background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setHighlightedClaimId(null);
      setSelectedNode(null);
    }
  };

  // Dynamic topological layout computation
  const { nodes, edges, canvasWidth, canvasHeight } = useMemo(() => {
    const nodeList: { node: GraphNodeData; x: number; y: number }[] = [];
    const edgeList: GraphEdgeData[] = [];

    const claims = extraction?.claims || [];
    const sources = evidence?.allSources || [];
    const candidates = imageProvenance?.candidates || [];

    const rootX = 40;
    const claimColX = 390;
    const evidenceColX = 760;

    let currentY = 40;

    // Track claim node Y positions for root centering
    const claimPositions: { id: string; y: number }[] = [];

    // 1. Process Claims & Attached Evidence Nodes
    claims.forEach((c) => {
      const isExpanded = !collapsedClaimIds.has(c.id);
      const claimSources = sources.filter((s) => s.claimId === c.id);

      if (!isExpanded || claimSources.length === 0) {
        // Collapsed Claim Footprint
        const cY = currentY;
        const cNode: GraphNodeData = {
          id: c.id,
          type: "claim",
          label: c.text,
          sublabel: c.category,
          evidenceCount: claimSources.length,
          isExpanded: false,
        };
        nodeList.push({ node: cNode, x: claimColX, y: cY });
        claimPositions.push({ id: c.id, y: cY });

        currentY += 105;
      } else {
        // Expanded Claim with Connected Evidence Footprint
        const evSpacing = 100;
        const sectionHeight = Math.max(110, claimSources.length * evSpacing);
        const cY = currentY + (sectionHeight - 80) / 2;

        const cNode: GraphNodeData = {
          id: c.id,
          type: "claim",
          label: c.text,
          sublabel: c.category,
          evidenceCount: claimSources.length,
          isExpanded: true,
        };
        nodeList.push({ node: cNode, x: claimColX, y: cY });
        claimPositions.push({ id: c.id, y: cY });

        // Add Connected Evidence Nodes
        claimSources.forEach((s, sIdx) => {
          const evY = currentY + sIdx * evSpacing;
          const evNode: GraphNodeData = {
            id: s.id,
            type: "evidence",
            label: s.title,
            url: s.url,
            domain: s.domain,
            snippet: s.snippet,
            stance: s.stance as "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT",
            sourceType: s.sourceType,
            claimId: c.id,
          };
          nodeList.push({ node: evNode, x: evidenceColX, y: evY });

          // Edge from Claim -> Evidence
          const edgeType: "supports" | "contradicts" | "insufficient" =
            s.stance === "SUPPORTS"
              ? "supports"
              : s.stance === "CONTRADICTS"
              ? "contradicts"
              : "insufficient";

          const isEdgeHighlighted = highlightedClaimId === c.id;
          const isEdgeDimmed = highlightedClaimId !== null && highlightedClaimId !== c.id;

          edgeList.push({
            id: `${c.id}-${s.id}`,
            sourceId: c.id,
            targetId: s.id,
            type: edgeType,
            fromX: claimColX + 288,
            fromY: cY + 40,
            toX: evidenceColX,
            toY: evY + 40,
            isHighlighted: isEdgeHighlighted,
            isDimmed: isEdgeDimmed,
          });
        });

        currentY += sectionHeight + 35;
      }
    });

    // 2. Media Candidates (if any)
    if (candidates.length > 0) {
      const mediaStartY = currentY + 15;
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
        nodeList.push({ node: mNode, x: evidenceColX, y: mY });
      });
      currentY = mediaStartY + Math.min(3, candidates.length) * 95 + 20;
    }

    // 3. Compute Root Node Position (centered with claims)
    const firstClaimY = claimPositions[0]?.y ?? 40;
    const lastClaimY = claimPositions[claimPositions.length - 1]?.y ?? 40;
    const rootY = Math.max(50, (firstClaimY + lastClaimY) / 2);

    const rootNode: GraphNodeData = {
      id: "root",
      type: "root",
      label: originalClaim || "Target Assertion",
      verdict: verification?.overallVerdict,
    };
    nodeList.unshift({ node: rootNode, x: rootX, y: rootY });

    // 4. Edges from Root -> All Claims
    claimPositions.forEach((cp) => {
      const isEdgeHighlighted = highlightedClaimId === cp.id;
      const isEdgeDimmed = highlightedClaimId !== null && highlightedClaimId !== cp.id;

      edgeList.unshift({
        id: `root-${cp.id}`,
        sourceId: "root",
        targetId: cp.id,
        type: "hierarchy",
        fromX: rootX + 288,
        fromY: rootY + 40,
        toX: claimColX,
        toY: cp.y + 40,
        isHighlighted: isEdgeHighlighted,
        isDimmed: isEdgeDimmed,
      });
    });

    // Edges from Root -> Media Candidates
    if (candidates.length > 0) {
      const mediaStartY = currentY - (Math.min(3, candidates.length) * 95 + 20) + 15;
      candidates.slice(0, 3).forEach((cand, idx) => {
        const mY = mediaStartY + idx * 95;
        edgeList.push({
          id: `root-${cand.id}`,
          sourceId: "root",
          targetId: cand.id,
          type: "provenance",
          fromX: rootX + 288,
          fromY: rootY + 40,
          toX: evidenceColX,
          toY: mY + 40,
          isHighlighted: highlightedClaimId === null,
          isDimmed: highlightedClaimId !== null,
        });
      });
    }

    const calculatedHeight = Math.max(540, currentY + 40);
    const calculatedWidth = Math.max(1100, evidenceColX + 300);

    return {
      nodes: nodeList,
      edges: edgeList,
      canvasWidth: calculatedWidth,
      canvasHeight: calculatedHeight,
    };
  }, [
    extraction,
    evidence,
    verification,
    imageProvenance,
    originalClaim,
    collapsedClaimIds,
    highlightedClaimId,
  ]);

  return (
    <div id="evidence-graph-panel" className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Graph Toolbar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[rgba(212,175,90,0.2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.35)] text-[#D4AF5A]">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
                Relational Evidence Map
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#050607] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold">
                FLOW PATHWAY TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#8D949D] font-sans mt-0.5">
              Interactive topological projection: Target claim → Atomic units → Grounded primary sources
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Semantic Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#D7DADF] pr-3 border-r border-[rgba(212,175,90,0.2)]">
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

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1 pr-2 border-r border-[rgba(212,175,90,0.2)]">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2 py-1 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] text-[10px] flex items-center gap-1 transition-colors"
              title="Expand all atomic claim sessions"
            >
              <ChevronsDown className="h-3 w-3 text-[#D4AF5A]" />
              <span className="hidden sm:inline">Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-2 py-1 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] text-[10px] flex items-center gap-1 transition-colors"
              title="Collapse all atomic claim sessions"
            >
              <ChevronsUp className="h-3 w-3 text-[#D4AF5A]" />
              <span className="hidden sm:inline">Collapse All</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
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
                setHighlightedClaimId(null);
              }}
              className="p-1.5 rounded bg-[#050607] hover:bg-[#131519] text-[#D7DADF] hover:text-[#F5F7FA] border border-[rgba(212,175,90,0.25)] transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Graph Visual Viewport */}
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="h-[540px] w-full rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.25)] relative overflow-x-auto overflow-y-auto select-none custom-scrollbar"
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
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              position: "relative",
              transition: "transform 0.2s ease-out",
            }}
          >
            {/* SVG Edges Layer with Animated Moving Semantic Particles */}
            <svg
              className="edges-layer absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            >
              {edges.map((edge) => (
                <EvidenceGraphEdge key={edge.id} edge={edge} />
              ))}
            </svg>

            {/* DOM Nodes Layer */}
            <div className="nodes-layer">
              {nodes.map(({ node, x, y }) => {
                const isSelected = selectedNode?.id === node.id;
                const isHighlighted =
                  highlightedClaimId !== null &&
                  (node.id === "root" ||
                    node.id === highlightedClaimId ||
                    node.claimId === highlightedClaimId);
                const isDimmed =
                  highlightedClaimId !== null && !isHighlighted && !isSelected;

                return (
                  <EvidenceGraphNode
                    key={node.id}
                    node={node}
                    x={x}
                    y={y}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    isDimmed={isDimmed}
                    onSelect={handleNodeClick}
                    onToggleExpand={handleToggleExpand}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 max-w-sm rounded-lg bg-[#0D0F12] border border-[rgba(212,175,90,0.4)] p-4 shadow-2xl space-y-2.5 z-30 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(212,175,90,0.2)]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#D4AF5A]">
                  {selectedNode.type === "root" ? "ROOT ASSERTION" : selectedNode.type === "claim" ? `CLAIM ${selectedNode.id}` : `SOURCE ${selectedNode.id}`}
                </span>
                {selectedNode.stance && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#050607] text-[#D7DADF] border border-[rgba(212,175,90,0.25)] uppercase font-bold">
                    {selectedNode.stance}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-[#8D949D] hover:text-[#F5F7FA] p-0.5 rounded hover:bg-[#131519]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-[#F5F7FA] font-sans leading-snug">
              {selectedNode.label}
            </h4>

            {selectedNode.snippet && (
              <p className="text-[11px] text-[#D7DADF] font-sans leading-relaxed bg-[#050607] p-2 rounded border border-[rgba(212,175,90,0.15)] line-clamp-3">
                &ldquo;{selectedNode.snippet}&rdquo;
              </p>
            )}

            {selectedNode.url && (
              <>
                <SourceProvenanceBadge
                  provenance={{
                    url: selectedNode.url,
                    domain: selectedNode.domain || "web",
                    sourceType: selectedNode.sourceType,
                    retrievalProvider: "Tavily",
                    analysisProviders: ["Gemini"],
                    modelName: "Gemini 2.5 Flash",
                  }}
                  compact={false}
                />
                <div className="pt-2 border-t border-[rgba(212,175,90,0.15)] flex items-center justify-between">
                  <span className="text-[10px] text-[#8D949D] truncate max-w-[180px]">
                    {selectedNode.domain}
                  </span>
                  <a
                    href={selectedNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4AF5A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
