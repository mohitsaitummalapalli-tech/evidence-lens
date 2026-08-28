/**
 * EvidenceLens - Evidence & Provenance Type Definitions
 * Shared types for evidence retrieval, media provenance, and citation snippets.
 */

export type EvidenceType = 
  | "academic_source"
  | "news_outlet"
  | "government_data"
  | "fact_checking_archive"
  | "reverse_image_match"
  | "video_provenance"
  | "historical_archive";

export type Stance = "supports" | "refutes" | "neutral" | "unrelated";

export interface EvidenceSource {
  id: string;
  title: string;
  url: string;
  publisher?: string;
  domainAuthority?: number;
  publishedDate?: string;
  sourceType: EvidenceType;
  reliabilityScore: number; // 0 to 1
}

export interface EvidenceSnippet {
  id: string;
  claimId: string;
  sourceId: string;
  source: EvidenceSource;
  snippetText: string;
  stance: Stance;
  confidence: number; // 0 to 1
  retrievedAt: string;
  matchedKeywords: string[];
}

export interface ProvenanceRecord {
  id: string;
  mediaHash?: string;
  firstObservedDate?: string;
  originPlatform?: string;
  originalAuthor?: string;
  modificationsDetected?: string[];
  manipulationRiskScore: number; // 0 to 1
  similarMediaMatches: {
    url: string;
    similarityScore: number;
    earliestDate?: string;
    context?: string;
  }[];
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  url?: string;
  mimeType: string;
  uploadedAt: string;
  status: "pending" | "processing" | "analyzed" | "error";
  provenance?: ProvenanceRecord;
}
