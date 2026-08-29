"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  ClaimExtractionResult,
  EvidenceRetrievalResult,
  InvestigationVerificationResult,
  ImageProvenanceResult,
} from "@/types";
import { EvidenceGraphNode, GraphNodeData } from "./EvidenceGraphNode";
import { EvidenceGraphEdge, GraphEdgeData } from "./EvidenceGraphEdge";
import {
  Network,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Focus,
  ExternalLink,
  Shield,
  HelpCircle,
  Play,
  FastForward,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export type GraphAnimationStage =
  | "INITIALIZING"
  | "ROOT_REVEALED"
  | "BUILDING_CLAIMS"
  | "CONNECTING_EVIDENCE"
  | "SYNTHESIZING_VERDICTS"
  | "COMPLETE";

interface EvidenceGraphProps {
  extraction?: ClaimExtractionResult;
  evidence?: EvidenceRetrievalResult;
  verification?: InvestigationVerificationResult;
  imageProvenance?: ImageProvenanceResult;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform state: Pan (x, y) & Zoom (scale)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 550 });

  // Progressive Live Animation State
  const [animationStage, setAnimationStage] = useState<GraphAnimationStage>("INITIALIZING");
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());
  const [visibleEdgeIds, setVisibleEdgeIds] = useState<Set<string>>(new Set());
  const [verdictsRevealed, setVerdictsRevealed] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  // Selection & Hover state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    node: GraphNodeData;
    screenX: number;
    screenY: number;
  } | null>(null);

  const rawClaimText = originalClaim || extraction?.originalClaim || "Target Claim to Verify";
  const claims = useMemo(() => extraction?.claims || [], [extraction?.claims]);
  const allSources = useMemo(() => evidence?.allSources || [], [evidence?.allSources]);
  const provCandidates = useMemo(
    () => imageProvenance?.candidates || [],
    [imageProvenance?.candidates]
  );
  const claimVerifications = useMemo(
    () => verification?.claimVerifications || [],
    [verification?.claimVerifications]
  );

  // 1. Construct Layout Geometry with Wide Whitespace
  const { nodes, edges, bounds } = useMemo(() => {
    const nodesList: GraphNodeData[] = [];
    const edgesList: GraphEdgeData[] = [];

    const hasImageProv = provCandidates.length > 0;

    // Group evidence by claimId
    const evidenceByClaim: Record<string, typeof allSources> = {};
    allSources.forEach((src) => {
      if (!evidenceByClaim[src.claimId]) {
        evidenceByClaim[src.claimId] = [];
      }
      evidenceByClaim[src.claimId].push(src);
    });

    // Dynamic horizontal spacing per claim column
    const claimColumnWidths = claims.map((c) => {
      const srcCount = (evidenceByClaim[c.id] || []).length;
      const cols = Math.min(Math.max(srcCount, 1), 3);
      return Math.max(cols * 290, 360);
    });

    const totalClaimsWidth = claimColumnWidths.reduce((sum, w) => sum + w, 0) + (hasImageProv ? 420 : 0);
    const canvasWidth = Math.max(totalClaimsWidth + 600, 1500);
    const centerX = canvasWidth / 2;

    // Root Node (Tier 1: Top Center)
    const rootWidth = 420;
    const rootHeight = 110;
    const rootX = centerX - rootWidth / 2;
    const rootY = 50;

    const rootNode: GraphNodeData = {
      id: "node-root",
      type: "root",
      x: rootX,
      y: rootY,
      width: rootWidth,
      height: rootHeight,
      label: "TARGET CLAIM",
      title: rawClaimText,
    };
    nodesList.push(rootNode);

    // Atomic Claims Tier (Tier 2: Y = 260)
    const claimWidth = 320;
    const claimHeight = 115;
    const claimY = 260;

    let currentClaimX = centerX - (totalClaimsWidth / 2) + (hasImageProv ? 380 : 0);
    const claimPositions: Record<string, { x: number; y: number; width: number; height: number }> = {};

    claims.forEach((claim, idx) => {
      const colWidth = claimColumnWidths[idx] || 360;
      const claimX = currentClaimX + (colWidth - claimWidth) / 2;
      claimPositions[claim.id] = { x: claimX, y: claimY, width: claimWidth, height: claimHeight };

      const verObj = claimVerifications.find((v) => v.claimId === claim.id);

      const claimNode: GraphNodeData = {
        id: `claim-${claim.id}`,
        type: "claim",
        x: claimX,
        y: claimY,
        width: claimWidth,
        height: claimHeight,
        label: claim.id,
        title: claim.text,
        category: claim.category,
        verdict: verObj?.verdict,
        confidence: verObj?.confidence,
        rawClaim: claim,
      };
      nodesList.push(claimNode);

      // Edge from Root -> Claim
      const startX = rootX + rootWidth / 2;
      const startY = rootY + rootHeight;
      const endX = claimX + claimWidth / 2;
      const endY = claimY;
      const midY = (startY + endY) / 2;

      edgesList.push({
        id: `edge-root-${claim.id}`,
        fromId: "node-root",
        toId: `claim-${claim.id}`,
        startX,
        startY,
        endX,
        endY,
        pathD: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
        type: "root_to_claim",
      });

      currentClaimX += colWidth + 40;
    });

    let maxY = 500;

    // Image Provenance / Media Matches Branch (Left Column)
    if (hasImageProv) {
      const imgWidth = 260;
      const imgHeight = 105;
      const imgX = Math.max(60, centerX - (totalClaimsWidth / 2));
      const imgY = claimY;

      const imgNode: GraphNodeData = {
        id: "node-image-artifact",
        type: "provenance",
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
        label: "UPLOADED MEDIA",
        title: imageProvenance?.mediaFilename || "Uploaded Media",
      };
      nodesList.push(imgNode);

      // Edge from Root -> Media
      const startX = rootX + rootWidth / 2;
      const startY = rootY + rootHeight;
      const endX = imgX + imgWidth / 2;
      const endY = imgY;
      const midY = (startY + endY) / 2;

      edgesList.push({
        id: "edge-root-image",
        fromId: "node-root",
        toId: "node-image-artifact",
        startX,
        startY,
        endX,
        endY,
        pathD: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
        type: "root_to_claim",
      });

      // Candidate Media Matches Tier (Y = 480+)
      provCandidates.slice(0, 4).forEach((cand, cIdx) => {
        const candWidth = 250;
        const candHeight = 95;
        const candX = imgX + (cIdx % 2) * 270 - 20;
        const candY = 480 + Math.floor(cIdx / 2) * 135;

        maxY = Math.max(maxY, candY + candHeight + 100);

        const candNode: GraphNodeData = {
          id: `cand-${cand.id}`,
          type: "provenance",
          x: candX,
          y: candY,
          width: candWidth,
          height: candHeight,
          label: `MATCH • ${cand.id}`,
          title: cand.title,
          domain: cand.domain,
          url: cand.url,
          matchType: cand.matchType,
          relevanceScore: cand.relevanceScore,
          rawProvenance: cand,
        };
        nodesList.push(candNode);

        const sX = imgX + imgWidth / 2;
        const sY = imgY + imgHeight;
        const eX = candX + candWidth / 2;
        const eY = candY;
        const mY = (sY + eY) / 2;

        edgesList.push({
          id: `edge-img-${cand.id}`,
          fromId: "node-image-artifact",
          toId: `cand-${cand.id}`,
          startX: sX,
          startY: sY,
          endX: eX,
          endY: eY,
          pathD: `M ${sX} ${sY} C ${sX} ${mY}, ${eX} ${mY}, ${eX} ${eY}`,
          type: "image_to_provenance",
        });
      });
    }

    // Evidence Sources Tier (Tier 3: Y = 480+)
    const evidenceWidth = 260;
    const evidenceHeight = 100;
    const evidenceSpacing = 280;

    claims.forEach((claim) => {
      const claimPos = claimPositions[claim.id];
      if (!claimPos) return;

      const sourcesForClaim = evidenceByClaim[claim.id] || [];
      const sourcesCount = sourcesForClaim.length;

      if (sourcesCount === 0) return;

      sourcesForClaim.forEach((source, sIdx) => {
        const rowOffset = Math.floor(sIdx / 3) * 140;
        const colInRow = sIdx % 3;
        const cols = Math.min(sourcesCount, 3);
        const sourceX =
          claimPos.x +
          claimPos.width / 2 -
          (cols * evidenceSpacing) / 2 +
          colInRow * evidenceSpacing +
          (evidenceSpacing - evidenceWidth) / 2;
        const sourceY = 480 + rowOffset;

        maxY = Math.max(maxY, sourceY + evidenceHeight + 120);

        const evNode: GraphNodeData = {
          id: `ev-${source.id}`,
          type: "evidence",
          x: sourceX,
          y: sourceY,
          width: evidenceWidth,
          height: evidenceHeight,
          label: `${claim.id} • ${source.id}`,
          title: source.title,
          domain: source.domain,
          url: source.url,
          sourceType: source.sourceType,
          stance: source.stance,
          rawEvidence: source,
        };
        nodesList.push(evNode);

        // Edge from Claim -> Evidence
        const startX = claimPos.x + claimPos.width / 2;
        const startY = claimPos.y + claimPos.height;
        const endX = sourceX + evidenceWidth / 2;
        const endY = sourceY;
        const midY = (startY + endY) / 2;

        edgesList.push({
          id: `edge-${claim.id}-${source.id}`,
          fromId: `claim-${claim.id}`,
          toId: `ev-${source.id}`,
          startX,
          startY,
          endX,
          endY,
          pathD: `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
          stance: source.stance,
          type: "claim_to_evidence",
        });
      });
    });

    return {
      nodes: nodesList,
      edges: edgesList,
      bounds: {
        width: Math.max(canvasWidth, 1400),
        height: Math.max(maxY, 700),
      },
    };
  }, [claims, allSources, provCandidates, imageProvenance?.mediaFilename, claimVerifications, rawClaimText]);

  // 2. Safe Container Resizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 900,
          height: containerRef.current.clientHeight || 550,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 3. Progressive Animation Sequence
  useEffect(() => {
    let isCancelled = false;
    const timeouts: NodeJS.Timeout[] = [];

    // If initializing or empty, show static view
    if (isInitializing || (claims.length === 0 && allSources.length === 0)) {
      const tStatic = setTimeout(() => {
        if (isCancelled) return;
        setVisibleNodeIds(new Set(nodes.map((n) => n.id)));
        setVisibleEdgeIds(new Set(edges.map((e) => e.id)));
        setVerdictsRevealed(true);
        setAnimationStage("COMPLETE");
      }, 0);
      timeouts.push(tStatic);
      return () => {
        isCancelled = true;
        clearTimeout(tStatic);
      };
    }

    // Step 1: Root Revealed
    const tRoot = setTimeout(() => {
      if (isCancelled) return;
      setAnimationStage("ROOT_REVEALED");
      setVisibleNodeIds(new Set(["node-root"]));
      setVisibleEdgeIds(new Set());
      setVerdictsRevealed(false);
    }, 0);
    timeouts.push(tRoot);

    let cumulativeTime = 350;

    // Step 2: Populate Claims
    const tClaims = setTimeout(() => {
      if (isCancelled) return;
      setAnimationStage("BUILDING_CLAIMS");
      const currentNodes = new Set(["node-root"]);
      const currentEdges = new Set<string>();

      claims.forEach((c) => currentNodes.add(`claim-${c.id}`));
      edges.filter((e) => e.type === "root_to_claim").forEach((e) => currentEdges.add(e.id));

      if (provCandidates.length > 0) {
        currentNodes.add("node-image-artifact");
        currentEdges.add("edge-root-image");
      }

      setVisibleNodeIds(currentNodes);
      setVisibleEdgeIds(currentEdges);
    }, cumulativeTime);
    timeouts.push(tClaims);

    cumulativeTime += 450;

    // Step 3: Connect Evidence
    const tEvidence = setTimeout(() => {
      if (isCancelled) return;
      setAnimationStage("CONNECTING_EVIDENCE");
      setVisibleNodeIds(new Set(nodes.map((n) => n.id)));
      setVisibleEdgeIds(new Set(edges.map((e) => e.id)));
    }, cumulativeTime);
    timeouts.push(tEvidence);

    cumulativeTime += 450;

    // Step 4: Synthesize Verdicts
    const tVerdicts = setTimeout(() => {
      if (isCancelled) return;
      setAnimationStage("SYNTHESIZING_VERDICTS");
      setVerdictsRevealed(true);
    }, cumulativeTime);
    timeouts.push(tVerdicts);

    const tComplete = setTimeout(() => {
      if (isCancelled) return;
      setAnimationStage("COMPLETE");
      setVisibleNodeIds(new Set(nodes.map((n) => n.id)));
      setVisibleEdgeIds(new Set(edges.map((e) => e.id)));
    }, cumulativeTime + 250);
    timeouts.push(tComplete);

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [claims, allSources, provCandidates, nodes, edges, isInitializing, replayCount]);

  // Instant Skip Animation Trigger
  const skipAnimation = useCallback(() => {
    setVisibleNodeIds(new Set(nodes.map((n) => n.id)));
    setVisibleEdgeIds(new Set(edges.map((e) => e.id)));
    setVerdictsRevealed(true);
    setAnimationStage("COMPLETE");
  }, [nodes, edges]);

  // Replay Animation Trigger
  const replayAnimation = () => {
    setSelectedNodeId(null);
    setReplayCount((c) => c + 1);
  };

  // 4. Centering / Fit View Calculation
  const fitGraph = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 550;

    const padding = 60;
    const scaleX = (containerWidth - padding * 2) / bounds.width;
    const scaleY = (containerHeight - padding * 2) / bounds.height;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 1.15);

    const x = (containerWidth - bounds.width * scale) / 2;
    const y = 20;

    setTransform({ x, y, scale });
  }, [bounds.width, bounds.height]);

  const resetView = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const scale = 0.85;
    const x = (containerWidth - bounds.width * scale) / 2;
    const y = 20;
    setTransform({ x, y, scale });
    setSelectedNodeId(null);
  };

  useEffect(() => {
    fitGraph();
  }, [fitGraph]);

  // 5. Pan & Zoom Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * delta, 0.35), 2.5);
      if (!containerRef.current) return { ...prev, scale: newScale };

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);

      return { x: newX, y: newY, scale: newScale };
    });
  };

  const handleZoom = (direction: "in" | "out") => {
    const factor = direction === "in" ? 1.2 : 0.83;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * factor, 0.35), 2.5),
    }));
  };

  // 6. Node Click & Double Click
  const handleNodeClick = (node: GraphNodeData) => {
    if (animationStage !== "COMPLETE") {
      skipAnimation();
    }
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(node.id);
    }
  };

  const handleNodeDoubleClick = (node: GraphNodeData) => {
    if (node.url) {
      window.open(node.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleNodeMouseEnter = (node: GraphNodeData, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredNode({
      node,
      screenX: e.clientX - rect.left,
      screenY: e.clientY - rect.top,
    });
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  // 7. Active Node Highlighting Set
  const highlightedNodeIds = useMemo(() => {
    if (!selectedNodeId) return null;

    const set = new Set<string>();
    set.add(selectedNodeId);

    edges.forEach((edge) => {
      if (edge.fromId === selectedNodeId) {
        set.add(edge.toId);
      } else if (edge.toId === selectedNodeId) {
        set.add(edge.fromId);
      }
    });

    return set;
  }, [selectedNodeId, edges]);

  // Selected Node Details
  const selectedNodeDetails = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const visibleClaimsCount = useMemo(() => {
    return claims.filter((c) => visibleNodeIds.has(`claim-${c.id}`)).length;
  }, [claims, visibleNodeIds]);

  const visibleEvidenceCount = useMemo(() => {
    return allSources.filter((s) => visibleNodeIds.has(`ev-${s.id}`)).length;
  }, [allSources, visibleNodeIds]);

  const isBuilding = animationStage !== "COMPLETE" && animationStage !== "INITIALIZING";

  return (
    <div
      id="evidence-graph-panel"
      ref={containerRef}
      className={`bg-[#11141A] border border-stone-800 rounded-xl shadow-2xl flex flex-col transition-all duration-300 relative overflow-hidden ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-2xl bg-[#0B0D11] border-stone-700"
          : "min-h-[580px] w-full"
      }`}
    >
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-stone-800 bg-[#0B0D11]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#161B24] border border-stone-800 text-red-400 shadow-sm">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8F9FA] tracking-wide">
                Interactive Evidence Map
              </h3>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase border flex items-center gap-1.5 ${
                  animationStage === "COMPLETE"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                    : isBuilding
                    ? "bg-red-950/40 text-red-300 border-red-500/40 animate-pulse"
                    : "bg-[#161B24] text-[#94A3B8] border-stone-800"
                }`}
              >
                {isBuilding && <Loader2 className="h-3 w-3 animate-spin text-red-400" />}
                {animationStage === "COMPLETE" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                <span>
                  {animationStage === "COMPLETE"
                    ? "COMPLETE"
                    : animationStage === "BUILDING_CLAIMS"
                    ? "POPULATING CLAIMS..."
                    : animationStage === "CONNECTING_EVIDENCE"
                    ? "CONNECTING SOURCES..."
                    : animationStage === "SYNTHESIZING_VERDICTS"
                    ? "CALCULATING VERDICTS..."
                    : "INITIALIZING..."}
                </span>
              </span>
            </div>

            {/* Counts Line */}
            <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-mono mt-1">
              <span className="text-[#F8F9FA] font-semibold">
                CLAIMS: {visibleClaimsCount}/{claims.length}
              </span>
              <span className="text-stone-700">•</span>
              <span className="text-[#F8F9FA] font-semibold">
                SOURCES: {visibleEvidenceCount}/{allSources.length}
              </span>
              {provCandidates.length > 0 && (
                <>
                  <span className="text-stone-700">•</span>
                  <span className="text-red-400 font-semibold">
                    MEDIA: {provCandidates.length}
                  </span>
                </>
              )}
              <span className="text-stone-700">•</span>
              <span>RELATIONS: {visibleEdgeIds.size}/{edges.length}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Skip Animation (when active) */}
          {isBuilding && (
            <button
              type="button"
              onClick={skipAnimation}
              title="Skip Animation"
              className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-red-400 border border-stone-800 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>
          )}

          {/* Replay */}
          {animationStage === "COMPLETE" && (
            <button
              type="button"
              onClick={replayAnimation}
              title="Replay Map Ingestion"
              className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-800 text-xs font-sans flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current text-red-400" />
              <span>Replay</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#161B24] border border-stone-800">
            <button
              type="button"
              onClick={() => handleZoom("out")}
              title="Zoom Out"
              className="p-1.5 rounded hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] transition-colors"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-[#CBD5E1]">
              {Math.round(transform.scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom("in")}
              title="Zoom In"
              className="p-1.5 rounded hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Fit & Reset */}
          <button
            type="button"
            onClick={fitGraph}
            title="Fit Map to View"
            className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-800 text-xs font-sans flex items-center gap-1 transition-colors shadow-sm"
          >
            <Focus className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Fit</span>
          </button>

          <button
            type="button"
            onClick={resetView}
            title="Reset View"
            className="p-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#94A3B8] hover:text-[#F8F9FA] border border-stone-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Legend Toggle */}
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            title="Toggle Legend"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans flex items-center gap-1 transition-colors ${
              showLegend
                ? "bg-red-950/40 text-red-300 border-red-500/40 font-semibold"
                : "bg-[#161B24] text-[#94A3B8] border-stone-800"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Legend</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-1.5 rounded-lg bg-[#161B24] hover:bg-[#1E2430] text-[#CBD5E1] hover:text-white border border-stone-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          className="w-full h-full min-h-[480px]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        >
          {/* Zoom & Pan Main Transformation Group */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* 1. Render Edges */}
            <g className="edges-layer">
              {edges.map((edge) => {
                if (!visibleEdgeIds.has(edge.id)) return null;

                const isEdgeHighlighted =
                  highlightedNodeIds !== null &&
                  highlightedNodeIds.has(edge.fromId) &&
                  highlightedNodeIds.has(edge.toId);

                const isEdgeDimmed =
                  highlightedNodeIds !== null && !isEdgeHighlighted;

                return (
                  <EvidenceGraphEdge
                    key={edge.id}
                    edge={edge}
                    isHighlighted={isEdgeHighlighted}
                    isDimmed={isEdgeDimmed}
                  />
                );
              })}
            </g>

            {/* 2. Render Nodes */}
            <g className="nodes-layer">
              {nodes.map((node) => {
                if (!visibleNodeIds.has(node.id)) return null;

                const isSelected = selectedNodeId === node.id;
                const isNodeHighlighted = highlightedNodeIds !== null && highlightedNodeIds.has(node.id);
                const isNodeDimmed = highlightedNodeIds !== null && !isNodeHighlighted;

                const effectiveNode =
                  !verdictsRevealed && node.type === "claim"
                    ? { ...node, verdict: undefined }
                    : node;

                return (
                  <EvidenceGraphNode
                    key={node.id}
                    node={effectiveNode}
                    isSelected={isSelected}
                    isHighlighted={isNodeHighlighted}
                    isDimmed={isNodeDimmed}
                    onClick={handleNodeClick}
                    onDoubleClick={handleNodeDoubleClick}
                    onMouseEnter={handleNodeMouseEnter}
                    onMouseLeave={handleNodeMouseLeave}
                  />
                );
              })}
            </g>
          </g>
        </svg>

        {/* Floating Compact Tooltip on Hover */}
        {hoveredNode && !selectedNodeId && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#0B0D11]/95 border border-stone-800 shadow-2xl max-w-xs text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(hoveredNode.screenX + 15, containerSize.width - 280)}px`,
              top: `${Math.min(hoveredNode.screenY + 15, containerSize.height - 180)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1">
              <span className="font-mono font-bold text-[#F8F9FA] text-[11px]">
                {hoveredNode.node.label}
              </span>
              {hoveredNode.node.stance && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#161B24] text-[#CBD5E1] border border-stone-800">
                  {hoveredNode.node.stance}
                </span>
              )}
              {hoveredNode.node.matchType && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {hoveredNode.node.matchType}
                </span>
              )}
              {hoveredNode.node.verdict && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {hoveredNode.node.verdict}
                </span>
              )}
            </div>

            <p className="text-[#F8F9FA] text-[11px] leading-snug line-clamp-3">
              {hoveredNode.node.title}
            </p>

            {hoveredNode.node.rawEvidence?.snippet && (
              <div className="p-2 rounded bg-[#050608] border border-stone-800 text-[10px] text-[#94A3B8] font-sans line-clamp-3">
                &ldquo;{hoveredNode.node.rawEvidence.snippet}&rdquo;
              </div>
            )}

            {hoveredNode.node.rawProvenance?.snippet && (
              <div className="p-2 rounded bg-[#050608] border border-stone-800 text-[10px] text-[#94A3B8] font-sans line-clamp-3">
                &ldquo;{hoveredNode.node.rawProvenance.snippet}&rdquo;
              </div>
            )}

            {hoveredNode.node.url && (
              <p className="text-[10px] text-red-400 font-sans truncate">
                Double-click to open link ↗
              </p>
            )}
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNodeDetails && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20 p-4 rounded-xl bg-[#0B0D11]/95 border border-stone-700 shadow-2xl space-y-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#161B24] border border-stone-800 text-[#F8F9FA] font-bold font-mono">
                  {selectedNodeDetails.label}
                </span>
                <span className="text-[#94A3B8] uppercase text-[10px]">
                  {selectedNodeDetails.type}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedNodeDetails.url && (
                  <a
                    href={selectedNodeDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-[#161B24] text-red-400 hover:text-white border border-stone-800 transition-colors"
                    title="Open Source Link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="text-xs font-sans text-[#94A3B8] hover:text-white px-1.5 py-0.5 rounded bg-[#161B24]"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <p className="text-xs font-medium text-[#F8F9FA] leading-snug">
              {selectedNodeDetails.title}
            </p>

            {selectedNodeDetails.rawEvidence?.snippet && (
              <div className="p-2.5 rounded-lg bg-[#11141A] border border-stone-800 text-[11px] text-[#CBD5E1] leading-relaxed max-h-24 overflow-y-auto">
                <span className="text-[10px] text-red-400 font-bold block uppercase mb-0.5">
                  Source Excerpt:
                </span>
                &ldquo;{selectedNodeDetails.rawEvidence.snippet}&rdquo;
              </div>
            )}

            {selectedNodeDetails.rawProvenance?.snippet && (
              <div className="p-2.5 rounded-lg bg-[#11141A] border border-stone-800 text-[11px] text-[#CBD5E1] leading-relaxed max-h-24 overflow-y-auto">
                <span className="text-[10px] text-red-400 font-bold block uppercase mb-0.5">
                  Match Excerpt:
                </span>
                &ldquo;{selectedNodeDetails.rawProvenance.snippet}&rdquo;
              </div>
            )}

            {selectedNodeDetails.rawClaim?.entities && (
              <div className="flex flex-wrap gap-1 text-[10px] text-[#94A3B8]">
                <span>Entities:</span>
                {selectedNodeDetails.rawClaim.entities.map((e, idx) => (
                  <span key={idx} className="px-1.5 py-0.2 rounded bg-[#161B24] text-[#CBD5E1]">
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Relationship Legend */}
        {showLegend && (
          <div className="absolute top-4 left-4 z-20 p-3 rounded-xl bg-[#0B0D11]/90 border border-stone-800 shadow-xl backdrop-blur-sm text-[10px] space-y-2 hidden sm:block">
            <span className="text-[#94A3B8] font-bold block pb-1 border-b border-stone-800">
              MAP LEGEND
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 font-medium">Supports Claim (Green)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-300 font-medium">Contradicts / Refutes (Red)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-amber-300 font-medium">Mixed / Partial (Amber)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-stone-400" />
                <span className="text-stone-300 font-medium">Insufficient / Neutral (Slate)</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[#CBD5E1] font-medium">Claim Relationship</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="p-3 border-t border-stone-800 bg-[#0B0D11]/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8] z-10">
        <div className="flex items-center gap-2 text-[#CBD5E1]">
          <Shield className="h-3.5 w-3.5 text-red-400" />
          <span>Interactive Multimodal Evidence Map</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Drag to Pan • Scroll to Zoom</span>
          <span className="text-stone-700">|</span>
          <span>Click node to inspect details</span>
        </div>
      </div>
    </div>
  );
};
