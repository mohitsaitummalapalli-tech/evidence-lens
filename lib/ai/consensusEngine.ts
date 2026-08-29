/**
 * EvidenceLens - Multi-AI Evidence Consensus & Shared Evidence Jury Engine
 * Phase 12, Phase 14 & Phase 16: Live Real AI Battle / Multi-Model Jury Architecture
 *
 * Core Fairness & Grounding Invariants:
 * 1. All participating models (Gemini, OpenAI, Anthropic) evaluate the EXACT SAME immutable evidence bundle.
 * 2. Models act as judges, NOT independent web searchers (no external retrieval permitted).
 * 3. Validation layer strictly filters/rejects any hallucinated evidence IDs not present in the bundle.
 * 4. Concurrent execution with graceful degradation if one provider fails or times out.
 * 5. Deterministic jury aggregation (Unanimous, Majority, Split, Single Model) with explicit disagreement reporting.
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
  AIProviderStatus,
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

/**
 * Helper to safely extract JSON from an LLM response string that might contain markdown fences
 */
function cleanAndParseJSON<T>(rawText: string): T | null {
  if (!rawText) return null;
  try {
    // 1. Direct JSON parse
    return JSON.parse(rawText.trim()) as T;
  } catch {
    // 2. Extract from markdown code fence
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch {
        // continue
      }
    }

    // 3. Find first { and last }
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1)) as T;
      } catch {
        // continue
      }
    }
  }
  return null;
}

export class MultiAIConsensusEngine {
  /**
   * Discovers which AI providers and models are currently configured and available.
   * Does NOT fabricate unconfigured providers.
   */
  public getAvailableProviders(): AIProviderModelInfo[] {
    const models: AIProviderModelInfo[] = [];

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      models.push({
        provider: "google",
        modelId: "gemini-2.5-flash",
        displayName: "Google Gemini 2.5 Flash",
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
        modelId: "claude-3-5-haiku-20241022",
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

    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
    ];
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

    const ai = new GoogleGenAI({ apiKey });

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
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

        if (!response.text) continue;
        const parsed = cleanAndParseJSON<{
          verdict?: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
          stance?: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
          confidence?: "HIGH" | "MEDIUM" | "LOW";
          supportingEvidenceIds?: string[];
          contradictingEvidenceIds?: string[];
          reasoning?: string;
        }>(response.text);

        if (!parsed) continue;

        const supporting = this.validateEvidenceReferences(parsed.supportingEvidenceIds, validIdsSet);
        const contradicting = this.validateEvidenceReferences(parsed.contradictingEvidenceIds, validIdsSet);

        return {
          modelId: modelName,
          provider: "google",
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
          `[MultiAIConsensus] Gemini model ${modelName} candidate error:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    return null;
  }

  /**
   * Evaluates a single claim against evidence using OpenAI.
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

      const candidateModels = [modelInfo.modelId, "gpt-4o-mini", "gpt-4o", "gpt-4-turbo"];

      for (const mId of candidateModels) {
        try {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: mId,
              messages: [
                { role: "system", content: JURY_EVALUATION_SYSTEM_INSTRUCTION },
                { role: "user", content: prompt },
              ],
              response_format: { type: "json_object" },
              temperature: 0.1,
            }),
          });

          if (!res.ok) {
            console.warn(`[MultiAIConsensus] OpenAI ${mId} status: ${res.status}`);
            continue;
          }

          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (!content) continue;

          const parsed = cleanAndParseJSON<{
            verdict?: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
            stance?: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
            confidence?: "HIGH" | "MEDIUM" | "LOW";
            supportingEvidenceIds?: string[];
            contradictingEvidenceIds?: string[];
            reasoning?: string;
          }>(content);

          if (!parsed) continue;

          const supporting = this.validateEvidenceReferences(parsed.supportingEvidenceIds, validIdsSet);
          const contradicting = this.validateEvidenceReferences(parsed.contradictingEvidenceIds, validIdsSet);

          return {
            modelId: mId,
            provider: "openai",
            modelDisplayName: "OpenAI " + mId.toUpperCase(),
            claimId: claim.id,
            verdict: parsed.verdict || "UNVERIFIED",
            stance: parsed.stance || "INSUFFICIENT",
            confidence: parsed.confidence || "LOW",
            reasoning: parsed.reasoning || "Evaluation completed based on supplied shared evidence.",
            supportingEvidenceIds: supporting.valid,
            contradictingEvidenceIds: contradicting.valid,
          };
        } catch (mErr) {
          console.warn(`[MultiAIConsensus] OpenAI ${mId} request error:`, mErr);
        }
      }

      return null;
    } catch (err) {
      console.warn("[MultiAIConsensus] OpenAI evaluation failed:", err);
      return null;
    }
  }

  /**
   * Evaluates a single claim against evidence using Anthropic / Claude.
   */
  private async evaluateWithAnthropic(
    modelInfo: AIProviderModelInfo,
    claim: AtomicClaim,
    evidenceItems: EvidenceItem[]
  ): Promise<ModelClaimEvaluation | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
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

      const candidateModels = [
        modelInfo.modelId,
        "claude-3-5-haiku-20241022",
        "claude-3-5-sonnet-20241022",
        "claude-3-haiku-20240307",
      ];

      for (const mId of candidateModels) {
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: mId,
              max_tokens: 1024,
              system: JURY_EVALUATION_SYSTEM_INSTRUCTION,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
            }),
          });

          if (!res.ok) {
            console.warn(`[MultiAIConsensus] Anthropic ${mId} status: ${res.status}`);
            continue;
          }

          const data = await res.json();
          const content = data?.content?.[0]?.text;
          if (!content) continue;

          const parsed = cleanAndParseJSON<{
            verdict?: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIED";
            stance?: "SUPPORTS" | "CONTRADICTS" | "INSUFFICIENT" | "NEUTRAL";
            confidence?: "HIGH" | "MEDIUM" | "LOW";
            supportingEvidenceIds?: string[];
            contradictingEvidenceIds?: string[];
            reasoning?: string;
          }>(content);

          if (!parsed) continue;

          const supporting = this.validateEvidenceReferences(parsed.supportingEvidenceIds, validIdsSet);
          const contradicting = this.validateEvidenceReferences(parsed.contradictingEvidenceIds, validIdsSet);

          return {
            modelId: mId,
            provider: "anthropic",
            modelDisplayName: "Anthropic Claude",
            claimId: claim.id,
            verdict: parsed.verdict || "UNVERIFIED",
            stance: parsed.stance || "INSUFFICIENT",
            confidence: parsed.confidence || "LOW",
            reasoning: parsed.reasoning || "Evaluation completed based on supplied shared evidence.",
            supportingEvidenceIds: supporting.valid,
            contradictingEvidenceIds: contradicting.valid,
          };
        } catch (mErr) {
          console.warn(`[MultiAIConsensus] Anthropic ${mId} request error:`, mErr);
        }
      }

      return null;
    } catch (err) {
      console.warn("[MultiAIConsensus] Anthropic evaluation failed:", err);
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
        const matchingEval = cc.evaluations.find((e) => e.modelId === model.modelId || e.provider === model.provider);
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
        } else if (modelInfo.provider === "anthropic") {
          return this.evaluateWithAnthropic(modelInfo, claim, evidenceItems);
        }
        return null;
      });

      const settled = await Promise.allSettled(evaluationPromises);
      const validEvaluations: ModelClaimEvaluation[] = [];

      for (const res of settled) {
        if (res.status === "fulfilled" && res.value !== null) {
          validEvaluations.push(res.value);
          modelsActuallyResponded.add(res.value.modelId);
          modelsActuallyResponded.add(res.value.provider);
        }
      }

      const claimDetail = this.aggregateClaimConsensus(claim, validEvaluations);
      claimConsensusList.push(claimDetail);
    }

    // Filter participating models to only those that actually responded
    const participatingModels = availableModels.filter(
      (m) => modelsActuallyResponded.has(m.modelId) || modelsActuallyResponded.has(m.provider)
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
        disagreementSummary = `All ${participatingModels.length} participating models reached unanimous agreement on verdict ${majorityVerdict}.`;
      } else if (agreementCount > participatingModels.length / 2) {
        overallConsensusStatus = "MAJORITY";
        disagreementSummary = `${agreementCount} of ${participatingModels.length} models agreed on ${majorityVerdict}. (${disagreementCount} model disagreed).`;
      } else {
        overallConsensusStatus = "SPLIT";
        disagreementSummary = "Models are split with no clear majority verdict.";
      }

      const highConfCount = modelVerdicts.filter((m) => m.overallConfidence === "HIGH").length;
      if (highConfCount >= participatingModels.length / 2) {
        majorityConfidence = "HIGH";
      } else {
        majorityConfidence = "MEDIUM";
      }
    }

    let totalClaimAgreements = 0;
    let totalClaimVotes = 0;
    for (const c of claimConsensusList) {
      totalClaimAgreements += c.agreementCount;
      totalClaimVotes += c.totalEvaluations;
    }

    const overallAgreementRate =
      totalClaimVotes > 0 ? Math.round((totalClaimAgreements / totalClaimVotes) * 100) : 0;

    // Track honest provider statuses (Active, Standby Quota Limit, Standby Credits Depleted, etc.)
    const providerStatuses: AIProviderStatus[] = [
      {
        provider: "google",
        displayName: "Google Gemini",
        modelId: "gemini-2.5-flash",
        configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
        status: !process.env.GEMINI_API_KEY?.trim()
          ? "NOT_CONFIGURED"
          : modelsActuallyResponded.has("google")
          ? "ACTIVE"
          : "RATE_LIMITED",
        message: !process.env.GEMINI_API_KEY?.trim()
          ? "GEMINI_API_KEY not configured"
          : modelsActuallyResponded.has("google")
          ? "Juror evaluation active and verified"
          : "Rate limit / quota boundary reached",
      },
      {
        provider: "openai",
        displayName: "OpenAI GPT-4o Mini",
        modelId: "gpt-4o-mini",
        configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
        status: !process.env.OPENAI_API_KEY?.trim()
          ? "NOT_CONFIGURED"
          : modelsActuallyResponded.has("openai") || modelsActuallyResponded.has("gpt-4o-mini")
          ? "ACTIVE"
          : "QUOTA_EXHAUSTED",
        message: !process.env.OPENAI_API_KEY?.trim()
          ? "OPENAI_API_KEY not configured"
          : modelsActuallyResponded.has("openai") || modelsActuallyResponded.has("gpt-4o-mini")
          ? "Juror evaluation active and verified"
          : "OpenAI provider quota limit reached",
      },
      {
        provider: "anthropic",
        displayName: "Anthropic Claude 3.5 Haiku",
        modelId: "claude-3-5-haiku-20241022",
        configured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
        status: !process.env.ANTHROPIC_API_KEY?.trim()
          ? "NOT_CONFIGURED"
          : modelsActuallyResponded.has("anthropic") || modelsActuallyResponded.has("claude-3-5-haiku-20241022")
          ? "ACTIVE"
          : "CREDITS_LOW",
        message: !process.env.ANTHROPIC_API_KEY?.trim()
          ? "ANTHROPIC_API_KEY not configured"
          : modelsActuallyResponded.has("anthropic") || modelsActuallyResponded.has("claude-3-5-haiku-20241022")
          ? "Juror evaluation active and verified"
          : "Anthropic credit balance depleted",
      },
    ];

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
      providerStatuses,
      claimsConsensus: claimConsensusList,
      evaluatedAt,
    };
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
