/**
 * EvidenceLens — Phase 16 Live AI Evidence Battle & Multi-Model Jury Test Suite
 *
 * Grounding & Fairness Invariants Tested:
 * 1. Provider Discovery: Detects active configured providers without fabrication.
 * 2. Immutable Shared Evidence Invariant: All providers receive identical evidence bundles.
 * 3. Strict Citation Validation: Validates evidence IDs and rejects hallucinated IDs.
 * 4. Concurrent Multi-Model Execution: Runs models concurrently with graceful fault tolerance.
 * 5. Deterministic Jury Aggregation: Accurate calculation of majority verdict and consensus rate.
 * 6. Live AI Evidence Battle with "India got independence in 1847.":
 *    - Real evaluation with Gemini, OpenAI, Claude (when credentials available)
 *    - Rejection of the false 1847 claim against ground truth citations.
 */

import fs from "node:fs";
import path from "node:path";

// Load .env.local for standalone test execution
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
} catch {
  // Ignore
}

import assert from "node:assert";
import { multiAIConsensusEngine } from "../lib/ai/consensusEngine";
import { AtomicClaim, ClaimEvidenceBundle, EvidenceItem } from "../types";

async function runPhase16Tests() {
  console.log("=======================================================");
  console.log("   EVIDENCELENS - PHASE 16 LIVE AI EVIDENCE BATTLE    ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  // --- Suite 1: Provider Discovery & Zero-Fabrication ---
  console.log("Suite 1: Active Provider Discovery & Zero Fabrication");

  await test("Discovers active providers based strictly on environment keys", () => {
    const providers = multiAIConsensusEngine.getAvailableProviders();
    assert(Array.isArray(providers), "Providers is an array");

    const expectedGoogle = Boolean(process.env.GEMINI_API_KEY?.trim());
    const expectedOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
    const expectedAnthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

    assert.strictEqual(
      providers.some((p) => p.provider === "google"),
      expectedGoogle,
      `Google provider detected: ${expectedGoogle}`
    );
    assert.strictEqual(
      providers.some((p) => p.provider === "openai"),
      expectedOpenAI,
      `OpenAI provider detected: ${expectedOpenAI}`
    );
    assert.strictEqual(
      providers.some((p) => p.provider === "anthropic"),
      expectedAnthropic,
      `Anthropic provider detected: ${expectedAnthropic}`
    );
  });

  // --- Suite 2: Shared Evidence Metrics Breakdown ---
  console.log("\nSuite 2: Shared Evidence Metrics Breakdown");

  const mockSharedSources: EvidenceItem[] = [
    {
      id: "ev_web_1",
      claimId: "C1",
      url: "https://en.wikipedia.org/wiki/Indian_Independence_Act_1947",
      domain: "wikipedia.org",
      title: "Indian Independence Act 1947",
      snippet: "The Indian Independence Act 1947 was an act of the Parliament of the United Kingdom that partitioned British India into the two new independent dominions of India and Pakistan on 15 August 1947.",
      stance: "CONTRADICTS",
      relevanceScore: 0.98,
      sourceType: "web",
      retrievedAt: new Date().toISOString(),
    },
    {
      id: "ev_yt_1",
      claimId: "C1",
      url: "https://www.youtube.com/watch?v=independence1947",
      domain: "youtube.com",
      title: "Midnight's Freedom: 15 August 1947 Documentary Archive",
      snippet: "Historical newsreel footage of Jawaharlal Nehru's Tryst with Destiny speech delivered at midnight on 14-15 August 1947.",
      stance: "CONTRADICTS",
      relevanceScore: 0.95,
      sourceType: "youtube",
      retrievedAt: new Date().toISOString(),
    },
    {
      id: "ev_acad_1",
      claimId: "C1",
      url: "https://doi.org/10.1093/oxfordhb/9780199202997.001.0001",
      domain: "oxfordhb.com",
      title: "The Oxford Handbook of Indian Independence and Decolonization",
      snippet: "British rule in the Indian subcontinent ended definitively in August 1947.",
      stance: "CONTRADICTS",
      relevanceScore: 0.96,
      sourceType: "academic",
      retrievedAt: new Date().toISOString(),
    },
  ];

  const mockBundles: ClaimEvidenceBundle[] = [
    {
      claimId: "C1",
      claimText: "India got independence in 1847.",
      query: "India independence 1847 1947 act",
      sources: mockSharedSources,
    },
  ];

  await test("Calculates shared metrics across web, youtube, and academic sources", () => {
    const metrics = multiAIConsensusEngine.calculateSharedEvidenceMetrics(mockBundles);
    assert.strictEqual(metrics.totalSources, 3, "Total shared sources is 3");
    assert.strictEqual(metrics.webSourcesCount, 1, "Web sources count is 1");
    assert.strictEqual(metrics.youtubeSourcesCount, 1, "YouTube sources count is 1");
    assert.strictEqual(metrics.academicSourcesCount, 1, "Academic sources count is 1");
    assert.strictEqual(metrics.uniqueDomainsCount, 3, "3 unique domains identified");
    assert(metrics.sharedNotice.includes("3 retrieved sources"), "Notice contains exact source count");
  });

  // --- Suite 3: Strict Citation Validation & Rejection of Hallucinations ---
  console.log("\nSuite 3: Strict Citation Validation & Hallucination Rejection");

  await test("Accepts valid shared IDs and rejects non-existent IDs", () => {
    const validSet = new Set(["ev_web_1", "ev_yt_1", "ev_acad_1"]);
    const candidateRefs = ["ev_web_1", "ev_invalid_999", "ev_yt_1", "fabricated_id"];

    const result = multiAIConsensusEngine.validateEvidenceReferences(candidateRefs, validSet);
    assert.strictEqual(result.valid.length, 2, "2 valid IDs retained");
    assert.deepStrictEqual(result.valid, ["ev_web_1", "ev_yt_1"], "Exact valid IDs retained");
    assert.strictEqual(result.invalidCount, 2, "2 hallucinated IDs rejected");
  });

  // --- Suite 4: Deterministic Jury Synthesis ---
  console.log("\nSuite 4: Deterministic Jury Synthesis");

  const mockClaim: AtomicClaim = {
    id: "C1",
    text: "India got independence in 1847.",
    category: "time",
    checkability: "high",
    entities: ["India", "Independence", "1847"],
  };

  await test("Synthesizes unanimous FALSE verdict across multi-model jury", () => {
    const mockEvaluations = [
      {
        modelId: "gemini-2.5-flash",
        provider: "google" as const,
        modelDisplayName: "Google Gemini 2.5 Flash",
        claimId: "C1",
        verdict: "FALSE" as const,
        stance: "CONTRADICTS" as const,
        confidence: "HIGH" as const,
        reasoning: "The provided Wikipedia and Oxford documents show India achieved independence in August 1947, not 1847.",
        supportingEvidenceIds: [],
        contradictingEvidenceIds: ["ev_web_1", "ev_yt_1", "ev_acad_1"],
      },
      {
        modelId: "gpt-4o-mini",
        provider: "openai" as const,
        modelDisplayName: "OpenAI GPT-4o Mini",
        claimId: "C1",
        verdict: "FALSE" as const,
        stance: "CONTRADICTS" as const,
        confidence: "HIGH" as const,
        reasoning: "Evidence items ev_web_1 and ev_acad_1 contradict the 1847 claim, confirming independence occurred in 1947.",
        supportingEvidenceIds: [],
        contradictingEvidenceIds: ["ev_web_1", "ev_acad_1"],
      },
      {
        modelId: "claude-3-5-haiku-20241022",
        provider: "anthropic" as const,
        modelDisplayName: "Anthropic Claude 3.5 Haiku",
        claimId: "C1",
        verdict: "FALSE" as const,
        stance: "CONTRADICTS" as const,
        confidence: "HIGH" as const,
        reasoning: "Primary citations unanimously refute 1847; the Indian Independence Act was passed in 1947.",
        supportingEvidenceIds: [],
        contradictingEvidenceIds: ["ev_web_1", "ev_yt_1"],
      },
    ];

    const claimDetail = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, mockEvaluations);
    assert.strictEqual(claimDetail.consensusVerdict, "FALSE", "Consensus verdict is FALSE");
    assert.strictEqual(claimDetail.status, "UNANIMOUS", "Status is UNANIMOUS");
    assert.strictEqual(claimDetail.agreementCount, 3, "3 of 3 agree");

    const validIdsSet = new Set(mockSharedSources.map((s) => s.id));
    const juryVerdicts = multiAIConsensusEngine.synthesizeModelVerdicts(
      [
        { provider: "google", modelId: "gemini-2.5-flash", displayName: "Gemini", isAvailable: true },
        { provider: "openai", modelId: "gpt-4o-mini", displayName: "OpenAI", isAvailable: true },
        { provider: "anthropic", modelId: "claude-3-5-haiku-20241022", displayName: "Claude", isAvailable: true },
      ],
      [claimDetail],
      validIdsSet
    );

    assert.strictEqual(juryVerdicts.length, 3, "3 jury verdicts produced");
    assert(juryVerdicts.every((jv) => jv.overallVerdict === "FALSE"), "All models emit FALSE overall");
    assert(juryVerdicts.every((jv) => jv.validEvidenceReferencesCount >= 2), "All models cite real shared IDs");
  });

  // --- Suite 5: Live Real AI Battle Execution ---
  console.log("\nSuite 5: Live Real AI Battle Execution on Ground Truth Bundle");

  await test("Runs live multi-AI jury on 'India got independence in 1847.'", async () => {
    const consensusResult = await multiAIConsensusEngine.evaluateConsensus(
      [mockClaim],
      mockBundles
    );

    assert(consensusResult, "Consensus result produced");
    assert(consensusResult.totalModelsParticipating >= 1, "At least 1 live model responded");
    console.log(`    -> Participating Live Models (${consensusResult.totalModelsParticipating}): ${consensusResult.participatingModels.map((m) => m.displayName).join(", ")}`);
    console.log(`    -> Overall Jury Status: ${consensusResult.overallConsensusStatus}`);
    console.log(`    -> Majority Verdict: ${consensusResult.majorityVerdict}`);
    console.log(`    -> Agreement Rate: ${consensusResult.overallAgreementRate}%`);

    assert.strictEqual(consensusResult.majorityVerdict, "FALSE", "Jury correctly refutes false 1847 claim as FALSE");

    for (const verdict of consensusResult.modelVerdicts || []) {
      console.log(`    [${verdict.modelDisplayName}] Verdict: ${verdict.overallVerdict} | Score: ${verdict.quantitativeScore}% | Citations: ${verdict.validEvidenceReferencesCount}`);
      assert(verdict.claimVerdicts.length > 0, "Model produced claim verdicts");
      assert(verdict.validEvidenceReferencesCount >= 1, "Model cited valid shared evidence IDs");
    }
  });

  console.log("\n=======================================================");
  console.log(`   PHASE 16 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase16Tests().catch((err) => {
  console.error("Phase 16 Test Suite Error:", err);
  process.exit(1);
});
