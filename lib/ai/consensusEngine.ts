/**
 * EvidenceLens - Multi-AI Evidence Consensus Engine
 * Phase 12: Independent multi-model evaluation & deterministic consensus aggregation.
 */

import { GoogleGenAI, Type } from "@google/genai";
import {
  AtomicClaim,
  ClaimEvidenceBundle,
  MultiAIConsensusResult,
  MultiAIConsensusStatus,
  ClaimConsensusDetail,
  ModelClaimEvaluation,
  AIProviderModelInfo,
} from "@/types";

const CONSENSUS_EVALUATION_SYSTEM_INSTRUCTION = `You are an Independent Forensic Evidence Evaluator for EvidenceLens.
Your task is to independently evaluate whether an atomic claim is corroborated, contradicted, or unverified given ONLY the provided retrieved web evidence.

STRICT GROUNDING PRINCIPLES:
1. Base your verdict ONLY on the provided evidence snippets. Do not hallucinate external knowledge.
2. Allowed Claim Verdicts:
   - "TRUE": The evidence directly confirms/supports the factual claim.
   - "FALSE": The evidence directly refutes/contradicts the factual claim.
   - "MIXED": The evidence shows parts are true while other parts are false or conflicting.
   - "UNVERIFIED": The evidence is insufficient, irrelevant, or inconclusive.
3. Allowed Stances:
   - "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL"
4. Confidence: "HIGH" | "MEDIUM" | "LOW"
5. Provide a concise 1-2 sentence evidence-grounded justification.`;

export class MultiAIConsensusEngine {
  /**
   * Discovers which AI providers and models are currently configured and available.
   * Does NOT fabricate unconfigured providers.
   */
  public getAvailableProviders(): AIProviderModelInfo[] {
    const models: AIProviderModelInfo[] = [];

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      // Primary Fast Model
      models.push({
        provider: "google",
        modelId: "gemini-2.5-flash",
        displayName: "Google Gemini 2.5 Flash",
        isAvailable: true,
      });

      // Secondary Deep Reasoning Model
      models.push({
        provider: "google",
        modelId: "gemini-2.5-pro",
        displayName: "Google Gemini 2.5 Pro",
        isAvailable: true,
      });
    }

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    if (openaiKey) {
      models.push({
        provider: "openai",
        modelId: "gpt-4o-mini",
        displayName: "OpenAI GPT-4o Mini",
        isAvailable: true,
      });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (anthropicKey) {
      models.push({
        provider: "anthropic",
        modelId: "claude-3-5-haiku",
        displayName: "Anthropic Claude 3.5 Haiku",
        isAvailable: true,
      });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (groqKey) {
      models.push({
        provider: "groq",
        modelId: "llama-3.3-70b-versatile",
        displayName: "Groq Llama 3.3 70B",
        isAvailable: true,
      });
    }

    return models;
  }

  /**
   * Evaluates a single claim against evidence using a specific Google Gemini model.
   */
  private async evaluateWithGemini(
    modelInfo: AIProviderModelInfo,
    claim: AtomicClaim,
    evidenceSnippets: string[]
  ): Promise<ModelClaimEvaluation | null> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `CLAIM TO EVALUATE:
ID: ${claim.id}
Statement: "${claim.text}"

RETRIEVED GROUNDED EVIDENCE SNIPPETS:
${evidenceSnippets.map((snip, idx) => `[Source ${idx + 1}]: ${snip}`).join("\n\n")}

Evaluate this claim strictly against the provided snippets above.`;

      const response = await ai.models.generateContent({
        model: modelInfo.modelId,
        contents: prompt,
        config: {
          systemInstruction: CONSENSUS_EVALUATION_SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                enum: ["TRUE", "FALSE", "MIXED", "UNVERIFIED"],
              },
              stance: {
                type: Type.STRING,
                enum: ["SUPPORTS", "CONTRADICTS", "INSUFFICIENT", "NEUTRAL"],
              },
              confidence: {
                type: Type.STRING,
                enum: ["HIGH", "MEDIUM", "LOW"],
              },
              reasoning: {
                type: Type.STRING,
              },
            },
            required: ["verdict", "stance", "confidence", "reasoning"],
          },
        },
      });

      if (!response.text) return null;
      const parsed = JSON.parse(response.text);

      return {
        modelId: modelInfo.modelId,
        provider: modelInfo.provider,
        modelDisplayName: modelInfo.displayName,
        claimId: claim.id,
        verdict: parsed.verdict || "UNVERIFIED",
        stance: parsed.stance || "INSUFFICIENT",
        confidence: parsed.confidence || "LOW",
        reasoning: parsed.reasoning || "Evaluation completed based on available evidence.",
      };
    } catch (err: unknown) {
      console.warn(`[MultiAIConsensus] Model ${modelInfo.modelId} evaluation warning:`, err instanceof Error ? err.message : String(err));
      return null;
    }
  }

  /**
   * Evaluates a single claim against evidence using OpenAI (if configured).
   */
  private async evaluateWithOpenAI(
    modelInfo: AIProviderModelInfo,
    claim: AtomicClaim,
    evidenceSnippets: string[]
  ): Promise<ModelClaimEvaluation | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return null;

    try {
      const prompt = `CLAIM TO EVALUATE:
ID: ${claim.id}
Statement: "${claim.text}"

RETRIEVED GROUNDED EVIDENCE SNIPPETS:
${evidenceSnippets.map((snip, idx) => `[Source ${idx + 1}]: ${snip}`).join("\n\n")}

Respond ONLY with valid JSON having keys: verdict ("TRUE"|"FALSE"|"MIXED"|"UNVERIFIED"), stance ("SUPPORTS"|"CONTRADICTS"|"INSUFFICIENT"|"NEUTRAL"), confidence ("HIGH"|"MEDIUM"|"LOW"), reasoning (string).`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelInfo.modelId,
          messages: [
            { role: "system", content: CONSENSUS_EVALUATION_SYSTEM_INSTRUCTION },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        modelId: modelInfo.modelId,
        provider: modelInfo.provider,
        modelDisplayName: modelInfo.displayName,
        claimId: claim.id,
        verdict: parsed.verdict || "UNVERIFIED",
        stance: parsed.stance || "INSUFFICIENT",
        confidence: parsed.confidence || "LOW",
        reasoning: parsed.reasoning || "Evaluation completed based on available evidence.",
      };
    } catch {
      return null;
    }
  }

  /**
   * Deterministically calculates consensus across a set of model evaluations for a claim.
   */
  public aggregateClaimConsensus(
    claim: AtomicClaim,
    evaluations: ModelClaimEvaluation[]
  ): ClaimConsensusDetail {
    if (!evaluations || evaluations.length === 0) {
      return {
        claimId: claim.id,
        claimText: claim.text,
        consensusVerdict: "UNVERIFIED",
        consensusStance: "INSUFFICIENT",
        agreementCount: 0,
        disagreementCount: 0,
        totalEvaluations: 0,
        status: "INSUFFICIENT",
        evaluations: [],
      };
    }

    if (evaluations.length === 1) {
      return {
        claimId: claim.id,
        claimText: claim.text,
        consensusVerdict: evaluations[0].verdict,
        consensusStance: evaluations[0].stance,
        agreementCount: 1,
        disagreementCount: 0,
        totalEvaluations: 1,
        status: "SINGLE_MODEL",
        evaluations,
      };
    }

    // Tally verdicts
    const verdictCounts: Record<string, number> = { TRUE: 0, FALSE: 0, MIXED: 0, UNVERIFIED: 0 };
    const stanceCounts: Record<string, number> = { SUPPORTS: 0, CONTRADICTS: 0, INSUFFICIENT: 0, NEUTRAL: 0 };

    for (const ev of evaluations) {
      verdictCounts[ev.verdict] = (verdictCounts[ev.verdict] || 0) + 1;
      stanceCounts[ev.stance] = (stanceCounts[ev.stance] || 0) + 1;
    }

    // Find top verdict
    let topVerdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED" = "UNVERIFIED";
    let maxVerdictCount = -1;

    for (const [v, count] of Object.entries(verdictCounts)) {
      if (count > maxVerdictCount) {
        maxVerdictCount = count;
        topVerdict = v as "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
      }
    }

    // Find top stance
    let topStance: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL" = "INSUFFICIENT";
    let maxStanceCount = -1;

    for (const [s, count] of Object.entries(stanceCounts)) {
      if (count > maxStanceCount) {
        maxStanceCount = count;
        topStance = s as "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
      }
    }

    const total = evaluations.length;
    const agreementCount = maxVerdictCount;
    const disagreementCount = total - agreementCount;

    let status: MultiAIConsensusStatus = "SPLIT";
    if (agreementCount === total) {
      status = "UNANIMOUS";
    } else if (agreementCount > total / 2) {
      status = "MAJORITY";
    }

    return {
      claimId: claim.id,
      claimText: claim.text,
      consensusVerdict: topVerdict,
      consensusStance: topStance,
      agreementCount,
      disagreementCount,
      totalEvaluations: total,
      status,
      evaluations,
    };
  }

  /**
   * Main Multi-AI Consensus Orchestrator.
   * Concurrently queries all available configured AI models and computes cross-model consensus.
   */
  public async evaluateConsensus(
    claims: AtomicClaim[],
    bundles: ClaimEvidenceBundle[]
  ): Promise<MultiAIConsensusResult> {
    const evaluatedAt = new Date().toISOString();
    const availableModels = this.getAvailableProviders();

    if (!claims || claims.length === 0 || availableModels.length === 0) {
      return {
        participatingModels: availableModels,
        totalModelsParticipating: 0,
        overallConsensusStatus: "INSUFFICIENT",
        overallAgreementRate: 0,
        claimsConsensus: [],
        evaluatedAt,
      };
    }

    // Map evidence snippets by claimId
    const snippetsByClaim = new Map<string, string[]>();
    for (const bundle of bundles) {
      const snippets = bundle.sources
        .map((s) => s.snippet)
        .filter((snip): snip is string => Boolean(snip && snip.trim().length > 0));
      snippetsByClaim.set(bundle.claimId, snippets);
    }

    const claimConsensusList: ClaimConsensusDetail[] = [];
    const modelsActuallyResponded = new Set<string>();

    for (const claim of claims) {
      const snippets = snippetsByClaim.get(claim.id) || [];

      // Concurrently run all available models for this claim
      const evaluationPromises = availableModels.map(async (modelInfo) => {
        if (modelInfo.provider === "google") {
          return this.evaluateWithGemini(modelInfo, claim, snippets);
        } else if (modelInfo.provider === "openai") {
          return this.evaluateWithOpenAI(modelInfo, claim, snippets);
        }
        return null;
      });

      const settled = await Promise.allSettled(evaluationPromises);
      const validEvaluations: ModelClaimEvaluation[] = [];

      for (const res of settled) {
        if (res.status === "fulfilled" && res.value !== null) {
          validEvaluations.push(res.value);
          modelsActuallyResponded.add(res.value.modelId);
        }
      }

      const claimDetail = this.aggregateClaimConsensus(claim, validEvaluations);
      claimConsensusList.push(claimDetail);
    }

    // Filter participating models to only those that actually responded
    const participatingModels = availableModels.filter((m) =>
      modelsActuallyResponded.has(m.modelId)
    );

    // Compute overall metrics
    let totalAgreements = 0;
    let totalVotes = 0;
    let hasSplit = false;
    let hasMajority = false;

    for (const c of claimConsensusList) {
      totalAgreements += c.agreementCount;
      totalVotes += c.totalEvaluations;
      if (c.status === "SPLIT") hasSplit = true;
      if (c.status === "MAJORITY") hasMajority = true;
    }

    const overallAgreementRate =
      totalVotes > 0 ? Math.round((totalAgreements / totalVotes) * 100) : 0;

    let overallConsensusStatus: MultiAIConsensusStatus = "SINGLE_MODEL";
    if (participatingModels.length === 0) {
      overallConsensusStatus = "INSUFFICIENT";
    } else if (participatingModels.length === 1) {
      overallConsensusStatus = "SINGLE_MODEL";
    } else if (hasSplit) {
      overallConsensusStatus = "SPLIT";
    } else if (hasMajority) {
      overallConsensusStatus = "MAJORITY";
    } else {
      overallConsensusStatus = "UNANIMOUS";
    }

    return {
      participatingModels,
      totalModelsParticipating: participatingModels.length,
      overallConsensusStatus,
      overallAgreementRate,
      claimsConsensus: claimConsensusList,
      evaluatedAt,
    };
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
