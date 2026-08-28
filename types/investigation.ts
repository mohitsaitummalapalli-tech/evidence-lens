/**
 * EvidenceLens - Investigation & Verdict Type Definitions
 * Shared types for workbench sessions, graph structures, and synthesis verdicts.
 */

import { Claim } from "./claim";
import { EvidenceSnippet, MediaItem } from "./evidence";

export type InvestigationStatus = 
  | "draft"
  | "extracting_claims"
  | "retrieving_evidence"
  | "analyzing_provenance"
  | "synthesizing_verdict"
  | "completed"
  | "failed";

export type VerdictRating = 
  | "VERIFIED_TRUE"
  | "SUBSTANTIALLY_TRUE"
  | "MIXTURE_OF_FACT_AND_FICTION"
  | "MISLEADING_CONTEXT"
  | "FABRICATED_UNTRUE"
  | "UNVERIFIABLE";

export interface ClaimVerdict {
  claimId: string;
  verdict: VerdictRating;
  confidence: number; // 0 to 1
  reasoning: string;
  keySupportingEvidenceIds: string[];
  keyRefutingEvidenceIds: string[];
}

export interface EvidenceGraphNode {
  id: string;
  type: "claim" | "evidence" | "media" | "entity" | "source";
  label: string;
  data: Record<string, unknown>;
}

export interface EvidenceGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: "supports" | "refutes" | "extracted_from" | "mentions" | "originates_from";
  weight: number;
}

export interface EvidenceGraph {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
}

export interface HumanReviewAudit {
  reviewedBy?: string;
  reviewedAt?: string;
  overrideVerdict?: VerdictRating;
  analystNotes?: string;
  isFlaggedForEscalation?: boolean;
}

export interface InvestigationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: InvestigationStatus;
  rawInputText?: string;
  mediaItems: MediaItem[];
  extractedClaims: Claim[];
  evidenceSnippets: EvidenceSnippet[];
  claimVerdicts: ClaimVerdict[];
  graph?: EvidenceGraph;
  overallSummary?: string;
  humanReview?: HumanReviewAudit;
}
