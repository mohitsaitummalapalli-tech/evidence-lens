/**
 * EvidenceLens - Investigation & Verdict Type Definitions
 * Shared types for workbench sessions, graph structures, and synthesis verdicts.
 */

import { Claim, ClaimExtractionResult } from "./claim";
import { EvidenceRetrievalResult, EvidenceSnippet, MediaItem } from "./evidence";
import { InvestigationVerificationResult } from "./verification";
import { ImageProvenanceResult } from "./imageProvenance";
import { MultiAIConsensusResult } from "./consensus";
import { MultimodalMediaMatchSummary } from "./mediaMatch";

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

export type InvestigationUIState = 
  | "IDLE"
  | "READY"
  | "SUBMITTING"
  | "INPUT_RECEIVED"
  | "ERROR";

export interface UploadedMediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video";
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface InvestigationInputPayload {
  claim: string;
  contextUrl?: string;
  media?: {
    type: "image" | "video";
    filename: string;
    mimeType: string;
    sizeBytes: number;
  };
}

export interface InvestigationInputResponse {
  success: boolean;
  stage: "input_received" | "claim_extracted" | "evidence_retrieved" | "verified";
  sessionId: string;
  timestamp: string;
  message: string;
  input: {
    claim: string;
    claimReceived: boolean;
    contextUrlReceived: boolean;
    contextUrl?: string;
    mediaReceived: boolean;
    media?: {
      type: "image" | "video";
      filename: string;
      mimeType: string;
      sizeBytes: number;
    };
  };
  extraction?: ClaimExtractionResult;
  evidence?: EvidenceRetrievalResult;
  verification?: InvestigationVerificationResult;
  imageProvenance?: ImageProvenanceResult;
  consensus?: MultiAIConsensusResult;
  multiAIConsensus?: MultiAIConsensusResult;
  mediaMatch?: MultimodalMediaMatchSummary;
  nextStage: string;
}
