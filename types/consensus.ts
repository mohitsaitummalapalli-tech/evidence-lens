/**
 * EvidenceLens - Multi-AI Evidence Consensus Type Definitions
 * Phase 12: Heterogeneous AI Model Consensus Architecture
 */

export type AIModelProvider = "google" | "openai" | "anthropic" | "groq" | "local";

export interface AIProviderModelInfo {
  provider: AIModelProvider;
  modelId: string;
  displayName: string;
  isAvailable: boolean;
}

export type MultiAIConsensusStatus = "UNANIMOUS" | "MAJORITY" | "SPLIT" | "SINGLE_MODEL" | "INSUFFICIENT";

export interface ModelClaimEvaluation {
  modelId: string;
  provider: AIModelProvider;
  modelDisplayName: string;
  claimId: string;
  verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
  stance: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
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
  claimsConsensus: ClaimConsensusDetail[];
  evaluatedAt: string;
}
