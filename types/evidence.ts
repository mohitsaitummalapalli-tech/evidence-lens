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

export type EvidenceStance = "SUPPORTS" | "CONTRADICTS" | "MIXED" | "INSUFFICIENT" | "NEUTRAL" | "UNCERTAIN";

export type EvidenceSourceType = "web" | "youtube" | "academic" | "social" | "video_portal" | "other";

export type SourceQualityTier = "HIGH" | "MEDIUM" | "LOW";

export interface SourceQualityProfile {
  tier: SourceQualityTier;
  reason: string;
  category: "institutional" | "academic" | "news_factcheck" | "reference" | "video_portal" | "social_forum" | "general_web";
}

export type EvidenceConsensusBalance = "SUPPORTING" | "CONTRADICTING" | "MIXED" | "INSUFFICIENT" | "NEUTRAL";

export interface EvidenceConsensusSummary {
  supportingCount: number;
  contradictingCount: number;
  neutralCount: number;
  totalCount: number;
  balance: EvidenceConsensusBalance;
  supportPercentage: number;
  contradictPercentage: number;
  neutralPercentage: number;
}

export interface SourceDiversitySummary {
  totalSources: number;
  webCount: number;
  youtubeCount: number;
  academicCount: number;
  socialCount: number;
  otherCount: number;
  uniqueDomainCount: number;
  uniqueDomains: string[];
  isMultiDomain: boolean;
  diversityLevel: "HIGH" | "MODERATE" | "LOW";
}

export interface EvidenceItem {
  id: string;
  claimId: string;
  title: string;
  url: string;
  domain: string;
  publisher?: string;
  publishedDate?: string;
  snippet: string;
  relevanceScore?: number;
  stance: EvidenceStance;
  stanceExplanation?: string;
  sourceType?: EvidenceSourceType;
  sourceQuality?: SourceQualityTier;
  qualityReason?: string;
  channelOrAuthor?: string;
  retrievedAt: string;
}

export interface ClaimEvidenceBundle {
  claimId: string;
  claimText: string;
  query: string;
  sources: EvidenceItem[];
}

export type EvidenceRetrievalStatus = "searching" | "found" | "empty" | "error";

export interface EvidenceRetrievalResult {
  status?: EvidenceRetrievalStatus;
  error?: string;
  totalSourcesFound: number;
  bundles: ClaimEvidenceBundle[];
  allSources: EvidenceItem[];
  retrievedAt: string;
}

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
