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
