/**
 * EvidenceLens - Multi-AI Evidence Consensus & Shared Evidence Jury Engine
 * Phase 12 & Phase 14: AI Battle / Shared Evidence Jury Architecture
 *
 * Core Fairness & Grounding Invariants:
 * 1. All participating models evaluate the EXACT SAME immutable evidence bundle.
 * 2. Models act as judges, NOT independent web searchers.
 * 3. Validation layer strips/rejects any invented evidence IDs not present in the bundle.
 * 4. Deterministic jury aggregation (Unanimous, Majority, Split, Single Model).
 * 5. Disagreement is transparently reported rather than concealed.
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
  ModelJuryVerdict,
  SharedEvidenceMetrics,
  EvidenceItem,
} from "@/types";

const JURY_EVALUATION_SYSTEM_INSTRUCTION = `You are an Independent Forensic Evidence Judge on the EvidenceLens AI Jury.
Your task is to evaluate atomic claims given ONLY the provided shared immutable evidence bundle.

STRICT GROUNDING PRINCIPLES:
1. Base your verdict ONLY on the provided evidence items. Do NOT search external sites or hallucinate knowledge.
2. Allowed Claim Verdicts:
   - "TRUE": The provided evidence corroborates/confirms the factual claim.
   - "FALSE": The provided evidence refutes/contradicts the factual claim.
   - "MIXED": The provided evidence contains conflicting or partially true assertions.
   - "UNVERIFIED": The provided evidence is insufficient or inconclusive.
3. Allowed Stances: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL"
4. Confidence: "HIGH" | "MEDIUM" | "LOW"
5. For supportingEvidenceIds and contradictingEvidenceIds, reference ONLY the exact evidence item IDs (e.g., "ev_1", "ev_2") provided in the prompt. Do NOT invent IDs.
6. Provide a concise 1-2 sentence factual explanation.`;

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
   * Calculates deterministic breakdown of all sources in the shared evidence bundle.
   */
  public calculateSharedEvidenceMetrics(bundles: ClaimEvidenceBundle[]): SharedEvidenceMetrics {
    const allSourcesMap = new Map<string, EvidenceItem>();
    const uniqueDomainsSet = new Set<string>();

    let webCount = 0;
    let youtubeCount = 0;
    let academicCount = 0;
    let provCount = 0;

    for (const bundle of bundles) {
      for (const src of bundle.sources) {
        if (!allSourcesMap.has(src.id)) {
          allSourcesMap.set(src.id, src);

          if (src.domain && src.domain !== "web-source") {
            uniqueDomainsSet.add(src.domain.toLowerCase());
          }

          const st = (src.sourceType || "web").toLowerCase();
          if (st === "youtube") {
            youtubeCount++;
          } else if (st === "academic") {
            academicCount++;
          } else if (st === "image" || st === "video") {
            provCount++;
          } else {
            webCount++;
          }
        }
      }
    }

    const totalSources = allSourcesMap.size;
    const uniqueDomains = Array.from(uniqueDomainsSet).sort();

    return {
      totalSources,
      webSourcesCount: webCount,
      youtubeSourcesCount: youtubeCount,
      academicSourcesCount: academicCount,
      imageProvenanceCount: provCount,
      uniqueDomainsCount: uniqueDomains.length,
      uniqueDomains,
      sharedNotice: `All models evaluated the same ${totalSources} retrieved sources across ${uniqueDomains.length} unique domains.`,
    };
  }

  /**
   * Validates and filters evidence IDs referenced by an AI model against the shared bundle.
   * Prevents models from hallucinating non-existent citations.
   */
  public validateEvidenceReferences(
    candidateIds: string[] | undefined,
    validIdsSet: Set<string>
  ): { valid: string[]; invalidCount: number } {
    if (!candidateIds || !Array.isArray(candidateIds)) {
      return { valid: [], invalidCount: 0 };
    }

    const valid: string[] = [];
    let invalidCount = 0;

    for (const id of candidateIds) {
      if (typeof id === "string" && validIdsSet.has(id.trim())) {
        valid.push(id.trim());
      } else {
        invalidCount++;
      }
    }

    return { valid, invalidCount };
  }

  /**
   * Evaluates a single claim against evidence using a Google Gemini model.
   */
  private async evaluateWithGemini(
    modelInfo: AIProviderModelInfo,
    claim: AtomicClaim,
    evidenceItems: EvidenceItem[]
  ): Promise<ModelClaimEvaluation | null> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const validIdsSet = new Set(evidenceItems.map((e) => e.id));

      const evidencePromptBlock = evidenceItems
        .map(
          (e) =>
            `[ID: ${e.id}] | Type: ${e.sourceType || "web"} | Domain: ${e.domain}\nTitle: "${e.title}"\nURL: ${e.url}\nExcerpt: "${e.snippet}"`
        )
        .join("\n\n");

      const prompt = `CLAIM TO EVALUATE:
ID: ${claim.id}
Statement: "${claim.text}"

SHARED RETRIEVED EVIDENCE BUNDLE:
${evidencePromptBlock || "(No external sources retrieved for this claim)"}

Evaluate this claim strictly against the shared evidence items above. Return valid JSON.`;

      const response = await ai.models.generateContent({
        model: modelInfo.modelId,
        contents: prompt,
        config: {
          systemInstruction: JURY_EVALUATION_SYSTEM_INSTRUCTION,
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
              supportingEvidenceIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              contradictingEvidenceIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
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

      const supporting = this.validateEvidenceReferences(parsed.supportingEvidenceIds, validIdsSet);
      const contradicting = this.validateEvidenceReferences(parsed.contradictingEvidenceIds, validIdsSet);

      return {
        modelId: modelInfo.modelId,
        provider: modelInfo.provider,
        modelDisplayName: modelInfo.displayName,
        claimId: claim.id,
        verdict: parsed.verdict || "UNVERIFIED",
        stance: parsed.stance || "INSUFFICIENT",
        confidence: parsed.confidence || "LOW",
        reasoning: parsed.reasoning || "Evaluation completed based on supplied shared evidence.",
        supportingEvidenceIds: supporting.valid,
        contradictingEvidenceIds: contradicting.valid,
      };
    } catch (err: unknown) {
      console.warn(
        `[MultiAIConsensus] Model ${modelInfo.modelId} evaluation warning:`,
        err instanceof Error ? err.message : String(err)
      );
      return null;
    }
  }

  /**
   * Evaluates a single claim against evidence using OpenAI (if configured).
   */
  private async evaluateWithOpenAI(
    modelInfo: AIProviderModelInfo,
    claim: AtomicClaim,
    evidenceItems: EvidenceItem[]
  ): Promise<ModelClaimEvaluation | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return null;

    try {
      const validIdsSet = new Set(evidenceItems.map((e) => e.id));

      const evidencePromptBlock = evidenceItems
        .map(
          (e) =>
            `[ID: ${e.id}] | Type: ${e.sourceType || "web"} | Domain: ${e.domain}\nTitle: "${e.title}"\nURL: ${e.url}\nExcerpt: "${e.snippet}"`
        )
        .join("\n\n");

      const prompt = `CLAIM TO EVALUATE:
ID: ${claim.id}
Statement: "${claim.text}"

SHARED RETRIEVED EVIDENCE BUNDLE:
${evidencePromptBlock || "(No external sources retrieved for this claim)"}

Respond ONLY with valid JSON having keys:
- verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED"
- stance: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL"
- confidence: "HIGH" | "MEDIUM" | "LOW"
- supportingEvidenceIds: array of strings (must match provided IDs)
- contradictingEvidenceIds: array of strings (must match provided IDs)
- reasoning: string`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelInfo.modelId,
          messages: [
            { role: "system", content: JURY_EVALUATION_SYSTEM_INSTRUCTION },
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
      const supporting = this.validateEvidenceReferences(parsed.supportingEvidenceIds, validIdsSet);
      const contradicting = this.validateEvidenceReferences(parsed.contradictingEvidenceIds, validIdsSet);

      return {
        modelId: modelInfo.modelId,
        provider: modelInfo.provider,
        modelDisplayName: modelInfo.displayName,
        claimId: claim.id,
        verdict: parsed.verdict || "UNVERIFIED",
        stance: parsed.stance || "INSUFFICIENT",
        confidence: parsed.confidence || "LOW",
        reasoning: parsed.reasoning || "Evaluation completed based on supplied shared evidence.",
        supportingEvidenceIds: supporting.valid,
        contradictingEvidenceIds: contradicting.valid,
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
   * Synthesizes overall model-level verdicts and confidence scores across claims.
   */
  public synthesizeModelVerdicts(
    models: AIProviderModelInfo[],
    claimsConsensus: ClaimConsensusDetail[],
    allValidEvidenceIds: Set<string>
  ): ModelJuryVerdict[] {
    const verdicts: ModelJuryVerdict[] = [];

    for (const model of models) {
      const modelClaimEvals: ModelClaimEvaluation[] = [];

      for (const cc of claimsConsensus) {
        const matchingEval = cc.evaluations.find((e) => e.modelId === model.modelId);
        if (matchingEval) {
          modelClaimEvals.push(matchingEval);
        }
      }

      if (modelClaimEvals.length === 0) continue;

      let trueCount = 0;
      let falseCount = 0;
      let mixedCount = 0;
      let unverifiedCount = 0;
      let highConfCount = 0;
      let validRefs = 0;
      let invalidRefs = 0;

      for (const e of modelClaimEvals) {
        if (e.verdict === "TRUE") trueCount++;
        else if (e.verdict === "FALSE") falseCount++;
        else if (e.verdict === "MIXED") mixedCount++;
        else unverifiedCount++;

        if (e.confidence === "HIGH") highConfCount++;

        const supportingValid = this.validateEvidenceReferences(e.supportingEvidenceIds, allValidEvidenceIds);
        const contradictingValid = this.validateEvidenceReferences(e.contradictingEvidenceIds, allValidEvidenceIds);

        validRefs += supportingValid.valid.length + contradictingValid.valid.length;
        invalidRefs += supportingValid.invalidCount + contradictingValid.invalidCount;
      }

      const total = modelClaimEvals.length;
      let overallVerdict: "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED" = "UNVERIFIED";

      if (unverifiedCount === total) {
        overallVerdict = "UNVERIFIED";
      } else if (falseCount > 0 && falseCount >= trueCount) {
        overallVerdict = "FALSE";
      } else if (trueCount > 0 && falseCount === 0 && mixedCount === 0) {
        overallVerdict = "VERIFIED";
      } else if (mixedCount > 0 || (trueCount > 0 && falseCount > 0)) {
        overallVerdict = "MIXED";
      } else {
        overallVerdict = "UNVERIFIED";
      }

      let overallConfidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (highConfCount >= total / 2) {
        overallConfidence = "HIGH";
      } else if (highConfCount > 0 || total > 1) {
        overallConfidence = "MEDIUM";
      }

      // Calibrate realistic quantitative score
      let quantitativeScore = 75;
      if (overallVerdict === "VERIFIED") {
        quantitativeScore = overallConfidence === "HIGH" ? 92 : 82;
      } else if (overallVerdict === "FALSE") {
        quantitativeScore = overallConfidence === "HIGH" ? 90 : 78;
      } else if (overallVerdict === "MIXED") {
        quantitativeScore = 70;
      } else {
        quantitativeScore = 40;
      }

      verdicts.push({
        provider: model.provider,
        modelId: model.modelId,
        modelDisplayName: model.displayName,
        overallVerdict,
        overallConfidence,
        quantitativeScore,
        claimVerdicts: modelClaimEvals.map((e) => ({
          claimId: e.claimId,
          verdict: e.verdict,
          confidence: e.confidence,
          reasoning: e.reasoning,
          supportingEvidenceIds: e.supportingEvidenceIds || [],
          contradictingEvidenceIds: e.contradictingEvidenceIds || [],
        })),
        validEvidenceReferencesCount: validRefs,
        invalidEvidenceReferencesCount: invalidRefs,
      });
    }

    return verdicts;
  }

  /**
   * Main Multi-AI Consensus & Shared Evidence Jury Orchestrator.
   * Concurrently queries all available configured AI models on the immutable shared evidence bundle.
   */
  public async evaluateConsensus(
    claims: AtomicClaim[],
    bundles: ClaimEvidenceBundle[]
  ): Promise<MultiAIConsensusResult> {
    const evaluatedAt = new Date().toISOString();
    const availableModels = this.getAvailableProviders();

    const sharedMetrics = this.calculateSharedEvidenceMetrics(bundles);
    const allEvidenceItemsMap = new Map<string, EvidenceItem>();
    const allEvidenceIdsSet = new Set<string>();

    for (const bundle of bundles) {
      for (const src of bundle.sources) {
        allEvidenceItemsMap.set(src.id, src);
        allEvidenceIdsSet.add(src.id);
      }
    }

    if (!claims || claims.length === 0 || availableModels.length === 0) {
      return {
        participatingModels: availableModels,
        totalModelsParticipating: 0,
        overallConsensusStatus: "INSUFFICIENT",
        overallAgreementRate: 0,
        sharedEvidenceSummary: sharedMetrics,
        modelVerdicts: [],
        claimsConsensus: [],
        evaluatedAt,
      };
    }

    // Map evidence items by claimId
    const evidenceByClaim = new Map<string, EvidenceItem[]>();
    for (const bundle of bundles) {
      evidenceByClaim.set(bundle.claimId, bundle.sources);
    }

    const claimConsensusList: ClaimConsensusDetail[] = [];
    const modelsActuallyResponded = new Set<string>();

    for (const claim of claims) {
      const evidenceItems = evidenceByClaim.get(claim.id) || [];

      // Concurrently run all available models for this claim on the identical evidence items
      const evaluationPromises = availableModels.map(async (modelInfo) => {
        if (modelInfo.provider === "google") {
          return this.evaluateWithGemini(modelInfo, claim, evidenceItems);
        } else if (modelInfo.provider === "openai") {
          return this.evaluateWithOpenAI(modelInfo, claim, evidenceItems);
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

    // Compute model-level jury verdicts
    const modelVerdicts = this.synthesizeModelVerdicts(
      participatingModels,
      claimConsensusList,
      allEvidenceIdsSet
    );

    // Compute overall jury consensus status & agreement
    let overallConsensusStatus: MultiAIConsensusStatus = "SINGLE_MODEL";
    let majorityVerdict: "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED" = "UNVERIFIED";
    let majorityConfidence: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    let agreementCount = 0;
    let disagreementCount = 0;
    let disagreementSummary: string | undefined = undefined;

    if (participatingModels.length === 0) {
      overallConsensusStatus = "INSUFFICIENT";
    } else if (participatingModels.length === 1) {
      overallConsensusStatus = "SINGLE_MODEL";
      majorityVerdict = modelVerdicts[0]?.overallVerdict || "UNVERIFIED";
      majorityConfidence = modelVerdicts[0]?.overallConfidence || "MEDIUM";
      agreementCount = 1;
      disagreementCount = 0;
    } else {
      // Tally model-level overall verdicts
      const overallCounts: Record<string, number> = { VERIFIED: 0, FALSE: 0, MIXED: 0, UNVERIFIED: 0 };
      for (const mv of modelVerdicts) {
        overallCounts[mv.overallVerdict] = (overallCounts[mv.overallVerdict] || 0) + 1;
      }

      let maxCount = -1;
      for (const [v, count] of Object.entries(overallCounts)) {
        if (count > maxCount) {
          maxCount = count;
          majorityVerdict = v as "VERIFIED" | "FALSE" | "MIXED" | "UNVERIFIED";
        }
      }

      agreementCount = maxCount;
      disagreementCount = participatingModels.length - agreementCount;

      if (agreementCount === participatingModels.length) {
        overallConsensusStatus = "UNANIMOUS";
        disagreementSummary = "All models reached unanimous agreement.";
      } else if (agreementCount > participatingModels.length / 2) {
        overallConsensusStatus = "MAJORITY";
        disagreementSummary = `${disagreementCount} ${
          disagreementCount === 1 ? "model" : "models"
        } disagreed with the majority verdict.`;
      } else {
        overallConsensusStatus = "SPLIT";
        disagreementSummary = "Models are evenly split across differing verdicts.";
      }

      const highConfCount = modelVerdicts.filter((m) => m.overallConfidence === "HIGH").length;
      if (highConfCount >= participatingModels.length / 2) {
        majorityConfidence = "HIGH";
      } else {
        majorityConfidence = "MEDIUM";
      }
    }

    // Overall claim-level agreement percentage
    let totalClaimAgreements = 0;
    let totalClaimVotes = 0;
    for (const c of claimConsensusList) {
      totalClaimAgreements += c.agreementCount;
      totalClaimVotes += c.totalEvaluations;
    }

    const overallAgreementRate =
      totalClaimVotes > 0 ? Math.round((totalClaimAgreements / totalClaimVotes) * 100) : 0;

    return {
      participatingModels,
      totalModelsParticipating: participatingModels.length,
      overallConsensusStatus,
      overallAgreementRate,
      majorityVerdict,
      majorityConfidence,
      agreementCount,
      disagreementCount,
      disagreementSummary,
      sharedEvidenceSummary: sharedMetrics,
      modelVerdicts,
      claimsConsensus: claimConsensusList,
      evaluatedAt,
    };
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
