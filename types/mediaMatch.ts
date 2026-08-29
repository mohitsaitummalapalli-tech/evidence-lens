/**
 * EvidenceLens - Multimodal Media Match Types (Phase 14)
 *
 * Defines data structures for exact and high-similarity media matching
 * across web sources, YouTube footage, and visual archives.
 */

export type MediaMatchType = "EXACT" | "HIGH_SIMILARITY" | "RELATED" | "NONE";

export type MediaMatchSourceType = "web" | "youtube" | "video" | "image";

export type MediaMatchStatus =
  | "MATCH_FOUND"
  | "NO_EXACT_MATCH"
  | "NO_CANDIDATES"
  | "SKIPPED";

export interface MediaMatchResult {
  id: string;
  type: MediaMatchType;
  confidence: number; // 0.0 to 1.0
  title: string;
  url: string;
  domain: string;
  thumbnail?: string;
  publishedAt?: string;
  sourceType: MediaMatchSourceType;
  explanation: string;
  matchFound: boolean;
}

export interface MultimodalMediaMatchSummary {
  hasMedia: boolean;
  mediaType?: "image" | "video" | "none";
  mediaFilename?: string;
  status: MediaMatchStatus;
  primaryMatch?: MediaMatchResult | null;
  candidates?: MediaMatchResult[];
  allMatches?: MediaMatchResult[];
  exactMatchCount: number;
  similarMatchCount: number;
  relatedMatchCount?: number;
  totalEvaluated?: number;
  summary?: string;
  summaryText?: string;
  matchedAt?: string;
}
