/**
 * EvidenceLens - Claim Type Definitions
 * Shared types for multimodal claim extraction and processing.
 */

export type ClaimCategory = 
  | "factual"
  | "statistical"
  | "quote_attribution"
  | "media_provenance"
  | "temporal_sequence"
  | "contextual_manipulation";

export type ClaimVerificationStatus = 
  | "unverified"
  | "in_progress"
  | "supported"
  | "refuted"
  | "inconclusive"
  | "partially_true";

export type AtomicClaimCategory = 
  | "event"
  | "time"
  | "location"
  | "identity"
  | "media_context"
  | "causal"
  | "other";

export type ClaimCheckability = "high" | "medium" | "low";

export interface AtomicClaim {
  id: string; // e.g. "C1", "C2"
  text: string;
  category: AtomicClaimCategory;
  checkability: ClaimCheckability;
  entities: string[];
  timeReference?: string;
  locationReference?: string;
  dependsOn?: string[];
}

export interface ClaimExtractionResult {
  originalClaim: string;
  contextUrl?: string;
  claims: AtomicClaim[];
  overallExtractionNotes?: string;
  mediaContext?: string;
}

export interface Claim {
  id: string;
  text: string;
  sourceText?: string;
  sourceTimestamp?: string;
  category: ClaimCategory;
  extractedFrom: "text" | "image" | "video" | "audio" | "document";
  confidence: number; // 0 to 1
  keyEntities: string[];
  keywords: string[];
  metadata?: Record<string, unknown>;
}

export interface ClaimExtractionRequest {
  rawText?: string;
  mediaUrls?: string[];
  context?: string;
}

export interface ClaimExtractionResponse {
  claims: Claim[];
  language: string;
  summary: string;
}
