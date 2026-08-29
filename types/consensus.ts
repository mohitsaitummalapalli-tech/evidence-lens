/**
 * EvidenceLens - Multi-AI Evidence Consensus & AI Jury Type Definitions
 * Phase 12 & Phase 14: AI Battle / Shared Evidence Jury Architecture
 */

export type AIModelProvider = "google" | "openai" | "anthropic" | "groq" | "local";

export interface AIProviderModelInfo {
  provider: AIModelProvider;
  modelId: string;
  displayName: string;
  isAvailable: boolean;
}

export type MultiAIConsensusStatus =
  | "UNANIMOUS"
  | "MAJORITY"
  | "SPLIT"
  | "SINGLE_MODEL"
  | "INSUFFICIENT"
  | "NO_CONSENSUS";

export interface ModelClaimEvaluation {
  modelId: string;
  provider: AIModelProvider;
  modelDisplayName: string;
  claimId: string;
  verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
  stance: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
  supportingEvidenceIds?: string[];
  contradictingEvidenceIds?: string[];
}

export interface ModelJuryVerdict {
  provider: AIModelProvider;
  modelId: string;
  modelDisplayName: string;
  overallVerdict: "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED";
  overallConfidence: "HIGH" | "MEDIUM" | "LOW";
  quantitativeScore: number; // 0 to 100%
  claimVerdicts: Array<{
    claimId: string;
    verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
    confidence: "HIGH" | "MEDIUM" | "LOW";
    reasoning: string;
    supportingEvidenceIds: string[];
    contradictingEvidenceIds: string[];
  }>;
  validEvidenceReferencesCount: number;
  invalidEvidenceReferencesCount: number;
}

export interface SharedEvidenceMetrics {
  totalSources: number;
  webSourcesCount: number;
  youtubeSourcesCount: number;
  academicSourcesCount: number;
  imageProvenanceCount: number;
  uniqueDomainsCount: number;
  uniqueDomains: string[];
  sharedNotice: string;
}

export interface ClaimConsensusDetail {
  claimId: string;
  claimText: string;
  consensusVerdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
  consensusStance: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
  agreementCount: number;
  disagreementCount: number;
  totalEvaluations: number;
  status: MultiAIConsensusStatus;
  evaluations: ModelClaimEvaluation[];
}

export interface MultiAIConsensusResult {
  participatingModels: AIProviderModelInfo[];
  totalModelsParticipating: number;
  overallConsensusStatus: MultiAIConsensusStatus;
  overallAgreementRate: number; // 0 to 100%
  majorityVerdict?: "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED";
  majorityConfidence?: "HIGH" | "MEDIUM" | "LOW";
  agreementCount?: number;
  disagreementCount?: number;
  disagreementSummary?: string;
  sharedEvidenceSummary?: SharedEvidenceMetrics;
  modelVerdicts?: ModelJuryVerdict[];
  claimsConsensus: ClaimConsensusDetail[];
  evaluatedAt: string;
}
