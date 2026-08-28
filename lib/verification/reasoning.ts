/**
 * EvidenceLens - Evidence Reasoning & Claim Verification Service
 * Phase 5: Evidence Stance Classification, Claim-Level Verdicts & Deterministic Overall Synthesis
 */

import { GoogleGenAI, Type } from "@google/genai";
import {
  AtomicClaim,
  ClaimEvidenceBundle,
  EvidenceItem,
  EvidenceStance,
  ClaimVerification,
  ClaimVerdictType,
  VerificationConfidence,
  OverallVerdictResult,
  InvestigationVerificationResult,
} from "@/types";

export interface EvidenceStanceResult {
  evidenceId: string;
  claimId: string;
  stance: EvidenceStance;
  explanation: string;
}

const STANCE_REASONING_SYSTEM_INSTRUCTION = `You are the EvidenceLens Forensic Verification Engine.
Your task is to classify how each retrieved web evidence snippet relates to its paired atomic claim.

CRITICAL FACTUAL GROUNDING RULES:
1. Every evaluation MUST be strictly grounded ONLY in the provided claim text and evidence snippet.
2. DO NOT use unstated background training knowledge as if it came from the source.
3. Allowed Stances:
   - "SUPPORTS": The snippet explicitly confirms or provides direct factual evidence for the core assertion in the claim.
   - "CONTRADICTS": The snippet directly refutes, contradicts, or presents mutually exclusive facts against the claim.
   - "MIXED": The snippet partially supports one aspect while conflicting with another aspect of the claim.
   - "INSUFFICIENT": The snippet is off-topic, discusses unrelated matters, or is too vague to prove/disprove the claim.
4. Explanations must be concise, objective, and cite what the snippet specifically says.`;

export class VerificationReasoningService {
  private candidateModels = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"];

  private getClient(): GoogleGenAI {

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  /**
   * Classifies evidence snippets against their parent claims using Gemini.
   */
  public async classifyEvidenceStances(
    claims: AtomicClaim[],
    bundles: ClaimEvidenceBundle[]
  ): Promise<Record<string, EvidenceStanceResult>> {
    const itemsToEvaluate: Array<{
      evidenceId: string;
      claimId: string;
      claimText: string;
      sourceTitle: string;
      snippet: string;
    }> = [];

    const claimMap = new Map<string, string>();
    claims.forEach((c) => claimMap.set(c.id, c.text));

    for (const bundle of bundles) {
      const claimText = claimMap.get(bundle.claimId) || bundle.claimText;
      for (const src of bundle.sources) {
        if (src.snippet && src.snippet.trim().length > 0) {
          itemsToEvaluate.push({
            evidenceId: src.id,
            claimId: bundle.claimId,
            claimText,
            sourceTitle: src.title,
            snippet: src.snippet,
          });
        }
      }
    }

    if (itemsToEvaluate.length === 0) {
      return {};
    }

    const ai = this.getClient();
    const prompt = `Evaluate the factual stance for each evidence item relative to its paired claim:\n\n${JSON.stringify(
      itemsToEvaluate,
      null,
      2
    )}`;

    const config = {
      systemInstruction: STANCE_REASONING_SYSTEM_INSTRUCTION,
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evaluations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                evidenceId: { type: Type.STRING },
                claimId: { type: Type.STRING },
                stance: {
                  type: Type.STRING,
                  enum: ["SUPPORTS", "CONTRADICTS", "MIXED", "INSUFFICIENT"],
                },
                explanation: { type: Type.STRING },
              },
              required: ["evidenceId", "claimId", "stance", "explanation"],
            },
          },
        },
        required: ["evaluations"],
      },
    };

    let text = "";
    for (const model of this.candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [prompt],
          config,
        });
        text = response.text?.trim() || "";
        if (text) break;
      } catch {
        console.warn(`Model ${model} failed in stance reasoning, trying next candidate...`);
      }
    }

    if (!text) return {};

    try {
      const parsed = JSON.parse(text);
      const results: Record<string, EvidenceStanceResult> = {};

      if (Array.isArray(parsed.evaluations)) {
        for (const ev of parsed.evaluations) {
          if (ev.evidenceId && ev.stance) {
            results[ev.evidenceId] = {
              evidenceId: String(ev.evidenceId),
              claimId: String(ev.claimId),
              stance: ev.stance as EvidenceStance,
              explanation: String(ev.explanation || "Grounded analysis from citation."),
            };
          }
        }
      }

      return results;
    } catch (err: unknown) {
      console.warn("Evidence stance classification failed (falling back gracefully):", err);
      return {};
    }
  }

  /**
   * Evaluates a single atomic claim against its attached evidence items deterministically.
   */
  public verifyClaim(
    claim: AtomicClaim,
    evidenceSources: EvidenceItem[]
  ): ClaimVerification {
    const supportingEvidenceIds: string[] = [];
    const contradictingEvidenceIds: string[] = [];
    const mixedEvidenceIds: string[] = [];
    const insufficientEvidenceIds: string[] = [];

    for (const src of evidenceSources) {
      if (src.stance === "SUPPORTS") {
        supportingEvidenceIds.push(src.id);
      } else if (src.stance === "CONTRADICTS") {
        contradictingEvidenceIds.push(src.id);
      } else if (src.stance === "MIXED") {
        mixedEvidenceIds.push(src.id);
      } else {
        insufficientEvidenceIds.push(src.id);
      }
    }

    const totalSources = evidenceSources.length;
    let verdict: ClaimVerdictType = "UNVERIFIED";
    let confidence: VerificationConfidence = "LOW";
    let reasoning = "";

    const hasSupports = supportingEvidenceIds.length > 0;
    const hasContradicts = contradictingEvidenceIds.length > 0;
    const hasMixed = mixedEvidenceIds.length > 0;

    if (hasSupports && !hasContradicts && !hasMixed) {
      verdict = "TRUE";
      confidence = supportingEvidenceIds.length >= 2 ? "HIGH" : "MEDIUM";
      reasoning = `Supported by ${supportingEvidenceIds.length} credible web source${
        supportingEvidenceIds.length > 1 ? "s" : ""
      } with no detected contradictions.`;
    } else if (hasContradicts && !hasSupports && !hasMixed) {
      verdict = "FALSE";
      confidence = contradictingEvidenceIds.length >= 2 ? "HIGH" : "MEDIUM";
      reasoning = `Contradicted by ${contradictingEvidenceIds.length} credible source${
        contradictingEvidenceIds.length > 1 ? "s" : ""
      }.`;
    } else if (hasMixed || (hasSupports && hasContradicts)) {
      verdict = "MIXED";
      confidence = "MEDIUM";
      reasoning = `Conflicting evidence detected (${supportingEvidenceIds.length} supporting, ${contradictingEvidenceIds.length} contradicting, ${mixedEvidenceIds.length} mixed).`;
    } else {
      verdict = "UNVERIFIED";
      confidence = "LOW";
      reasoning =
        totalSources > 0
          ? `Retrieved ${totalSources} source(s), but evidence was insufficient or inconclusive to verify this specific assertion.`
          : "No external evidence citations found for this atomic claim.";
    }

    return {
      claimId: claim.id,
      claimText: claim.text,
      verdict,
      confidence,
      reasoning,
      supportingEvidenceIds,
      contradictingEvidenceIds,
      evidenceCount: totalSources,
    };
  }

  /**
   * Deterministically aggregates atomic claim verifications into an overall verdict.
   * Does NOT ask AI a black-box overall question; builds upon atomic claim verdicts.
   */
  public aggregateOverallVerdict(
    claimVerifications: ClaimVerification[]
  ): OverallVerdictResult {
    if (claimVerifications.length === 0) {
      return {
        verdict: "UNVERIFIED",
        confidence: "LOW",
        summary: "No atomic claims were available for verification.",
        breakdown: { total: 0, verifiedTrue: 0, refutedFalse: 0, mixed: 0, unverified: 0 },
      };
    }

    let verifiedTrue = 0;
    let refutedFalse = 0;
    let mixed = 0;
    let unverified = 0;

    for (const cv of claimVerifications) {
      if (cv.verdict === "TRUE") verifiedTrue++;
      else if (cv.verdict === "FALSE") refutedFalse++;
      else if (cv.verdict === "MIXED") mixed++;
      else unverified++;
    }

    const total = claimVerifications.length;
    let verdict: OverallVerdictResult["verdict"] = "UNVERIFIED";
    let confidence: VerificationConfidence = "LOW";
    let summary = "";

    if (verifiedTrue === total) {
      verdict = "VERIFIED";
      confidence = claimVerifications.every((c) => c.confidence === "HIGH") ? "HIGH" : "MEDIUM";
      summary = `All ${total} atomic claims were verified as TRUE by corroborating web evidence.`;
    } else if (refutedFalse > 0 && verifiedTrue === 0 && mixed === 0) {
      verdict = "FALSE";
      confidence = claimVerifications.some((c) => c.confidence === "HIGH") ? "HIGH" : "MEDIUM";
      summary = `Assertion is refuted: ${refutedFalse} of ${total} atomic claims were contradicted by evidence.`;
    } else if ((verifiedTrue > 0 && refutedFalse > 0) || mixed > 0 || (verifiedTrue > 0 && unverified > 0)) {
      verdict = "MIXED";
      confidence = "MEDIUM";
      summary = `Mixed factual veracity: ${verifiedTrue} claim(s) true, ${refutedFalse} false, ${mixed} mixed, ${unverified} unverified.`;
    } else {
      verdict = "UNVERIFIED";
      confidence = "LOW";
      summary = `Evidence was insufficient to establish verification across all ${total} atomic claims.`;
    }

    return {
      verdict,
      confidence,
      summary,
      breakdown: {
        total,
        verifiedTrue,
        refutedFalse,
        mixed,
        unverified,
      },
    };
  }

  /**
   * Main verification entry point: runs evidence reasoning, verifies each claim, and synthesizes overall verdict.
   */
  public async executeVerificationPipeline(
    claims: AtomicClaim[],
    bundles: ClaimEvidenceBundle[]
  ): Promise<InvestigationVerificationResult> {
    const verifiedAt = new Date().toISOString();

    if (!claims || claims.length === 0) {
      const overall = this.aggregateOverallVerdict([]);
      return {
        overallVerdict: overall.verdict,
        overallConfidence: overall.confidence,
        overallSummary: overall.summary,
        claimVerifications: [],
        claimBreakdown: overall.breakdown,
        verifiedAt,
      };
    }

    // 1. Classify stances for all evidence items in batch via Gemini
    const stanceMap = await this.classifyEvidenceStances(claims, bundles);

    // 2. Update evidence items with classified stances
    for (const bundle of bundles) {
      for (const src of bundle.sources) {
        if (stanceMap[src.id]) {
          src.stance = stanceMap[src.id].stance;
          src.stanceExplanation = stanceMap[src.id].explanation;
        }
      }
    }

    // 3. Verify each atomic claim deterministically based on its evidence bundle
    const claimVerifications: ClaimVerification[] = claims.map((claim) => {
      const bundle = bundles.find((b) => b.claimId === claim.id);
      const sources = bundle ? bundle.sources : [];
      return this.verifyClaim(claim, sources);
    });

    // 4. Aggregate overall verdict
    const overall = this.aggregateOverallVerdict(claimVerifications);

    return {
      overallVerdict: overall.verdict,
      overallConfidence: overall.confidence,
      overallSummary: overall.summary,
      claimVerifications,
      claimBreakdown: overall.breakdown,
      verifiedAt,
    };
  }
}

export const verificationReasoningService = new VerificationReasoningService();
