/**
 * EvidenceLens - Media & Image Provenance Type Definitions
 * Phase 6B & Phase 10: Universal Web, Video & Image Provenance Discovery
 */

export type ImageProvenanceMatchType = "POSSIBLE_MATCH" | "RELATED_SOURCE" | "NO_MATCH";

export type ProvenanceSourceType = "web" | "youtube" | "video" | "image";

export interface ImageProvenanceCandidate {
  id: string;
  url: string;
  title: string;
  domain: string;
  snippet: string;
  relevanceScore: number; // 0 to 1 (Search relevance, not reverse-image similarity)
  matchType: ImageProvenanceMatchType;
  sourceType?: ProvenanceSourceType;
  channelOrAuthor?: string;
  discoveredAt: string;
  matchedQuery?: string;
}

export interface ImageProvenanceResult {
  hasImage: boolean;
  hasMedia?: boolean;
  mediaType?: "image" | "video" | "audio" | "document" | "none";
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

export type MediaProvenanceCandidate = ImageProvenanceCandidate;
export type MediaProvenanceResult = ImageProvenanceResult;
