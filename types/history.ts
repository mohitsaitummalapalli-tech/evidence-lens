import { InvestigationInputResponse } from "./investigation";
import { OverallVerdictType, VerificationConfidence } from "./verification";

export interface InvestigationHistoryRecord {
  id: string; // Session ID or generated identifier
  timestamp: string; // ISO 8601 string
  targetClaim: string;
  contextUrl?: string;
  mediaFilename?: string;
  mediaMimeType?: string;
  hasMedia: boolean;
  overallVerdict: OverallVerdictType;
  overallConfidence: VerificationConfidence;
  confidenceScore: number; // Normalized 0 - 100 percentage for quantitative delta
  atomicClaimCount: number;
  evidenceCount: number;
  uniqueDomainCount: number;
  imageCandidateCount: number;
  claimBreakdown: {
    total: number;
    verifiedTrue: number;
    refutedFalse: number;
    mixed: number;
    unverified: number;
  };
  supportsCount: number;
  contradictsCount: number;
  fullResponse: InvestigationInputResponse;
}

export type HistorySortOption = "newest" | "oldest" | "confidence" | "sources";

export type HistoryVerdictFilter = "ALL" | OverallVerdictType;

export interface InvestigationComparisonMetrics {
  investigationA: InvestigationHistoryRecord;
  investigationB: InvestigationHistoryRecord;
  confidenceDelta: number; // confidenceA - confidenceB (-100 to +100)
  claimsDelta: number;
  sourcesDelta: number;
  domainsDelta: number;
  provenanceDelta: number;
  supportsDelta: number;
  contradictsDelta: number;
  verdictMatches: boolean;
}
