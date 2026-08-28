/**
 * EvidenceLens - Image Provenance Type Definitions
 * Phase 6B: Web Image Provenance Discovery
 */

export type ImageProvenanceMatchType = "POSSIBLE_MATCH" | "RELATED_SOURCE" | "NO_MATCH";

export interface ImageProvenanceCandidate {
  id: string;
  url: string;
  title: string;
  domain: string;
  snippet: string;
  relevanceScore: number; // 0 to 1 (Search relevance, not reverse-image similarity)
  matchType: ImageProvenanceMatchType;
  discoveredAt: string;
  matchedQuery?: string;
}

export interface ImageProvenanceResult {
  hasImage: boolean;
  mediaFilename?: string;
  mediaMimeType?: string;
  searchStatus: "SUCCESS" | "NO_CANDIDATES" | "ERROR" | "SKIPPED";
  totalCandidatesFound: number;
  uniqueDomains: string[];
  queriesExecuted: string[];
  candidates: ImageProvenanceCandidate[];
  discoveredAt: string;
  errorMessage?: string;
}
