/**
 * EvidenceLens - Verification & Reasoning Type Definitions
 * Phase 5: Evidence Stance Classification, Claim Verification & Overall Verdicts
 */

export type Phase5EvidenceStance =
  | "SUPPORTS"
  | "CONTRADICTS"
  | "MIXED"
  | "INSUFFICIENT"
  | "NEUTRAL"
  | "UNCERTAIN";

export type ClaimVerdictType = "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";

export type VerificationConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface ClaimVerification {
  claimId: string;
  claimText: string;
  verdict: ClaimVerdictType;
  confidence: VerificationConfidence;
  reasoning: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  evidenceCount: number;
}

export type OverallVerdictType = "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED";

export interface OverallVerdictResult {
  verdict: OverallVerdictType;
  confidence: VerificationConfidence;
  summary: string;
  breakdown: {
    total: number;
    verifiedTrue: number;
    refutedFalse: number;
    mixed: number;
    unverified: number;
  };
}

export interface InvestigationVerificationResult {
  overallVerdict: OverallVerdictType;
  overallConfidence: VerificationConfidence;
  overallSummary: string;
  claimVerifications: ClaimVerification[];
  claimBreakdown: {
    total: number;
    verifiedTrue: number;
    refutedFalse: number;
    mixed: number;
    unverified: number;
  };
  verifiedAt: string;
}
