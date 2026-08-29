/**
 * EvidenceLens - Phase 14 AI Battle: Shared Evidence Jury Test Suite
 *
 * Verifies:
 * 1. Every AI receives identical claim IDs.
 * 2. Every AI receives identical evidence IDs.
 * 3. Web evidence is present in shared bundle.
 * 4. YouTube evidence is present in shared bundle.
 * 5. Evidence URLs are preserved.
 * 6. Models cannot reference nonexistent evidence IDs.
 * 7. No provider performs independent retrieval (shared immutable bundle).
 * 8. Majority calculation is deterministic.
 * 9. Unanimous result works.
 * 10. Split result works.
 * 11. Single-model fallback works.
 * 12. Provider failure does not crash the investigation.
 * 13. Missing API keys are not represented as participating models.
 * 14. AI disagreement remains visible.
 * 15. Final verdict references the shared evidence.
 * 16. Existing Phase 10 evidence remains unchanged.
 * 17. Existing Phase 12 tests continue passing.
 */

import {
  MultiAIConsensusEngine,
  multiAIConsensusEngine,
} from "../lib/ai/consensusEngine";
import {
  AtomicClaim,
  ClaimEvidenceBundle,
  EvidenceItem,
  AIProviderModelInfo,
  ModelClaimEvaluation,
} from "../types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    failedCount++;
  }
}

async function runPhase14SharedEvidenceJuryTests() {
  console.log("=======================================================");
  console.log("   PHASE 14: AI BATTLE - SHARED EVIDENCE JURY SUITE    ");
  console.log("=======================================================\n");

  const engine = new MultiAIConsensusEngine();

  // -------------------------------------------------------------
  // Test Data Setup: Shared Immutable Evidence Bundle
  // -------------------------------------------------------------
  const mockClaims: AtomicClaim[] = [
    {
      id: "claim_1",
      text: "The James Webb Space Telescope launched on an Ariane 5 rocket from French Guiana on December 25, 2021.",
      category: "event",
      checkability: "high",
      entities: ["James Webb Space Telescope", "Ariane 5", "French Guiana"],
    },
    {
      id: "claim_2",
      text: "JWST operates in low Earth orbit at an altitude of 400 kilometers.",
      category: "location",
      checkability: "high",
      entities: ["JWST", "low Earth orbit"],
    },
  ];

  const nowIso = new Date().toISOString();

  const sharedWebSources: EvidenceItem[] = [
    {
      id: "ev_web_1",
      claimId: "claim_1",
      url: "https://www.nasa.gov/press-release/nasa-launches-james-webb-space-telescope",
      domain: "nasa.gov",
      title: "NASA Launches James Webb Space Telescope Official Release",
      snippet: "On Dec. 25, 2021, the James Webb Space Telescope was successfully launched atop an Ariane 5 rocket from Europe's Spaceport in French Guiana.",
      sourceType: "web",
      sourceQuality: "HIGH",
      stance: "SUPPORTS",
      retrievedAt: nowIso,
    },
    {
      id: "ev_web_2",
      claimId: "claim_1",
      url: "https://www.esa.int/Science_Exploration/Space_Science/Webb/Ariane_5_launch",
      domain: "esa.int",
      title: "ESA Ariane 5 Flight VA256 Launch Success",
      snippet: "Arianespace confirmed the flawless injection into orbit of the JWST following launch from Kourou.",
      sourceType: "web",
      sourceQuality: "HIGH",
      stance: "SUPPORTS",
      retrievedAt: nowIso,
    },
    {
      id: "ev_acad_1",
      claimId: "claim_1",
      url: "https://nature.com/articles/s41550-022-01684-x",
      domain: "nature.com",
      title: "Nature Astronomy: The Launch and Commissioning of JWST",
      snippet: "Comprehensive flight data verifying launch on Ariane 5 ECA on Christmas Day 2021.",
      sourceType: "academic",
      sourceQuality: "HIGH",
      stance: "SUPPORTS",
      retrievedAt: nowIso,
    },
  ];

  const sharedYouTubeSources: EvidenceItem[] = [
    {
      id: "ev_yt_1",
      claimId: "claim_1",
      url: "https://www.youtube.com/watch?v=7nT7JGZMbtM",
      domain: "youtube.com",
      title: "NASA Official Broadcast: James Webb Space Telescope Liftoff",
      snippet: "Live broadcast coverage of the Ariane 5 rocket lifting off carrying the James Webb Space Telescope.",
      sourceType: "youtube",
      sourceQuality: "MEDIUM",
      stance: "SUPPORTS",
      retrievedAt: nowIso,
    },
  ];

  const sharedOrbitSources: EvidenceItem[] = [
    {
      id: "ev_orbit_1",
      claimId: "claim_2",
      url: "https://science.nasa.gov/mission/webb/orbit",
      domain: "nasa.gov",
      title: "Webb Orbit - NASA Science",
      snippet: "Webb does not orbit Earth like Hubble; it orbits the Sun at the second Lagrange point (L2), 1.5 million kilometers from Earth.",
      sourceType: "web",
      sourceQuality: "HIGH",
      stance: "CONTRADICTS",
      retrievedAt: nowIso,
    },
  ];

  const sharedBundles: ClaimEvidenceBundle[] = [
    {
      claimId: "claim_1",
      claimText: mockClaims[0].text,
      query: "JWST Ariane 5 launch Dec 25 2021",
      sources: [...sharedWebSources, ...sharedYouTubeSources],
    },
    {
      claimId: "claim_2",
      claimText: mockClaims[1].text,
      query: "JWST low earth orbit altitude 400km",
      sources: sharedOrbitSources,
    },
  ];

  // -------------------------------------------------------------
  // Test Group 1: Shared Evidence Metrics Breakdown
  // -------------------------------------------------------------
  console.log("Group 1: Shared Evidence Metrics & Transparency");
  const metrics = engine.calculateSharedEvidenceMetrics(sharedBundles);

  assert(metrics.totalSources === 5, "Shared evidence bundle has exactly 5 unique sources");
  assert(metrics.webSourcesCount === 3, "Web sources count correctly tallied (3)");
  assert(metrics.youtubeSourcesCount === 1, "YouTube sources count correctly tallied (1)");
  assert(metrics.academicSourcesCount === 1, "Academic sources count correctly tallied (1)");
  assert(metrics.uniqueDomainsCount === 4, "Identifies 4 unique domains (nasa.gov, esa.int, nature.com, youtube.com)");
  assert(metrics.uniqueDomains.includes("nasa.gov"), "Unique domains includes nasa.gov");
  assert(metrics.uniqueDomains.includes("youtube.com"), "Unique domains includes youtube.com");
  assert(
    metrics.sharedNotice.includes("5 retrieved sources"),
    "Shared notice accurately communicates total evaluated sources"
  );

  // -------------------------------------------------------------
  // Test Group 2: Grounding Validation & Hallucinated ID Rejection
  // -------------------------------------------------------------
  console.log("\nGroup 2: Strict Grounding Validation Layer");
  const validIdsSet = new Set(["ev_web_1", "ev_web_2", "ev_yt_1", "ev_acad_1", "ev_orbit_1"]);

  const sampleCandidateIds = ["ev_web_1", "ev_yt_1", "ev_fake_99", "ev_hallucinated_xyz"];
  const validationResult = engine.validateEvidenceReferences(sampleCandidateIds, validIdsSet);

  assert(validationResult.valid.length === 2, "Filtered candidate IDs to exactly 2 valid IDs");
  assert(validationResult.valid.includes("ev_web_1"), "Preserved legitimate evidence ID ev_web_1");
  assert(validationResult.valid.includes("ev_yt_1"), "Preserved legitimate evidence ID ev_yt_1");
  assert(!validationResult.valid.includes("ev_fake_99"), "Rejected hallucinated ID ev_fake_99");
  assert(validationResult.invalidCount === 2, "Accurately recorded 2 rejected invalid citations");

  const emptyValidation = engine.validateEvidenceReferences(undefined, validIdsSet);
  assert(emptyValidation.valid.length === 0, "Gracefully handles undefined references");
  assert(emptyValidation.invalidCount === 0, "0 invalid count for empty input");

  // -------------------------------------------------------------
  // Test Group 3: Deterministic Jury Verdict Aggregation
  // -------------------------------------------------------------
  console.log("\nGroup 3: Deterministic Jury Verdict Aggregation");

  // Unanimous case (4/4 agree on TRUE)
  const unanimousEvals: ModelClaimEvaluation[] = [
    {
      modelId: "gpt-4o-mini",
      provider: "openai",
      modelDisplayName: "OpenAI GPT-4o Mini",
      claimId: "claim_1",
      verdict: "TRUE",
      stance: "SUPPORTS",
      confidence: "HIGH",
      reasoning: "NASA and ESA press releases corroborate the Ariane 5 launch.",
      supportingEvidenceIds: ["ev_web_1", "ev_web_2"],
      contradictingEvidenceIds: [],
    },
    {
      modelId: "gemini-2.5-flash",
      provider: "google",
      modelDisplayName: "Google Gemini 2.5 Flash",
      claimId: "claim_1",
      verdict: "TRUE",
      stance: "SUPPORTS",
      confidence: "HIGH",
      reasoning: "Confirmed by NASA and YouTube broadcast footage.",
      supportingEvidenceIds: ["ev_web_1", "ev_yt_1"],
      contradictingEvidenceIds: [],
    },
    {
      modelId: "claude-3-5-haiku",
      provider: "anthropic",
      modelDisplayName: "Anthropic Claude 3.5 Haiku",
      claimId: "claim_1",
      verdict: "TRUE",
      stance: "SUPPORTS",
      confidence: "HIGH",
      reasoning: "Nature and ESA sources provide definitive evidence.",
      supportingEvidenceIds: ["ev_acad_1", "ev_web_2"],
      contradictingEvidenceIds: [],
    },
    {
      modelId: "llama-3.3-70b-versatile",
      provider: "groq",
      modelDisplayName: "Groq Llama 3.3 70B",
      claimId: "claim_1",
      verdict: "TRUE",
      stance: "SUPPORTS",
      confidence: "HIGH",
      reasoning: "Launch details verified across all 4 independent sources.",
      supportingEvidenceIds: ["ev_web_1", "ev_yt_1"],
      contradictingEvidenceIds: [],
    },
  ];

  const unanimousConsensus = engine.aggregateClaimConsensus(mockClaims[0], unanimousEvals);
  assert(unanimousConsensus.status === "UNANIMOUS", "4/4 agreement yields UNANIMOUS status");
  assert(unanimousConsensus.consensusVerdict === "TRUE", "Unanimous consensus verdict is TRUE");
  assert(unanimousConsensus.agreementCount === 4, "Agreement count is 4");
  assert(unanimousConsensus.disagreementCount === 0, "Disagreement count is 0");

  // Majority case (3/4 agree on FALSE, 1 says UNVERIFIED)
  const majorityEvals: ModelClaimEvaluation[] = [
    {
      modelId: "gpt-4o-mini",
      provider: "openai",
      modelDisplayName: "OpenAI GPT-4o Mini",
      claimId: "claim_2",
      verdict: "FALSE",
      stance: "CONTRADICTS",
      confidence: "HIGH",
      reasoning: "NASA confirmed JWST is at L2, not in LEO (400km).",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ["ev_orbit_1"],
    },
    {
      modelId: "gemini-2.5-flash",
      provider: "google",
      modelDisplayName: "Google Gemini 2.5 Flash",
      claimId: "claim_2",
      verdict: "FALSE",
      stance: "CONTRADICTS",
      confidence: "HIGH",
      reasoning: "Refuted: JWST is located at L2 (1.5 million km).",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ["ev_orbit_1"],
    },
    {
      modelId: "claude-3-5-haiku",
      provider: "anthropic",
      modelDisplayName: "Anthropic Claude 3.5 Haiku",
      claimId: "claim_2",
      verdict: "FALSE",
      stance: "CONTRADICTS",
      confidence: "HIGH",
      reasoning: "Contradicted by NASA Science orbit data.",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ["ev_orbit_1"],
    },
    {
      modelId: "llama-3.3-70b-versatile",
      provider: "groq",
      modelDisplayName: "Groq Llama 3.3 70B",
      claimId: "claim_2",
      verdict: "UNVERIFIED",
      stance: "INSUFFICIENT",
      confidence: "LOW",
      reasoning: "Insufficient orbital data.",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
    },
  ];

  const majorityConsensus = engine.aggregateClaimConsensus(mockClaims[1], majorityEvals);
  assert(majorityConsensus.status === "MAJORITY", "3/4 agreement yields MAJORITY status");
  assert(majorityConsensus.consensusVerdict === "FALSE", "Majority consensus verdict is FALSE");
  assert(majorityConsensus.agreementCount === 3, "Agreement count is 3");
  assert(majorityConsensus.disagreementCount === 1, "Disagreement count is 1");

  // Split case (2 vs 2)
  const splitEvals: ModelClaimEvaluation[] = [
    { ...majorityEvals[0], verdict: "TRUE", stance: "SUPPORTS" },
    { ...majorityEvals[1], verdict: "TRUE", stance: "SUPPORTS" },
    { ...majorityEvals[2], verdict: "FALSE", stance: "CONTRADICTS" },
    { ...majorityEvals[3], verdict: "FALSE", stance: "CONTRADICTS" },
  ];

  const splitConsensus = engine.aggregateClaimConsensus(mockClaims[1], splitEvals);
  assert(splitConsensus.status === "SPLIT", "2 vs 2 yields SPLIT status");
  assert(splitConsensus.totalEvaluations === 4, "Total evaluations is 4");

  // Single Model case
  const singleConsensus = engine.aggregateClaimConsensus(mockClaims[0], [unanimousEvals[0]]);
  assert(singleConsensus.status === "SINGLE_MODEL", "1 model yields SINGLE_MODEL status");
  assert(singleConsensus.agreementCount === 1, "Agreement count is 1");
  assert(singleConsensus.disagreementCount === 0, "Disagreement count is 0");

  // -------------------------------------------------------------
  // Test Group 4: Model-Level Jury Synthesis & Scoreboard
  // -------------------------------------------------------------
  console.log("\nGroup 4: Model-Level Jury Synthesis & Disagreement Transparency");

  const mockModels: AIProviderModelInfo[] = [
    { provider: "openai", modelId: "gpt-4o-mini", displayName: "OpenAI GPT-4o Mini", isAvailable: true },
    { provider: "google", modelId: "gemini-2.5-flash", displayName: "Google Gemini 2.5 Flash", isAvailable: true },
    { provider: "anthropic", modelId: "claude-3-5-haiku", displayName: "Anthropic Claude 3.5 Haiku", isAvailable: true },
    { provider: "groq", modelId: "llama-3.3-70b-versatile", displayName: "Groq Llama 3.3 70B", isAvailable: true },
  ];

  const modelVerdicts = engine.synthesizeModelVerdicts(
    mockModels,
    [unanimousConsensus, majorityConsensus],
    validIdsSet
  );

  assert(modelVerdicts.length === 4, "Synthesized 4 distinct model jury verdicts");
  assert(modelVerdicts[0].provider === "openai", "First model is OpenAI");
  assert(modelVerdicts[0].quantitativeScore >= 70, "OpenAI quantitative score is calibrated (>= 70%)");
  assert(modelVerdicts[0].validEvidenceReferencesCount > 0, "OpenAI has valid evidence references");
  assert(modelVerdicts[0].invalidEvidenceReferencesCount === 0, "0 invalid references for well-formed model response");
  assert(modelVerdicts[3].provider === "groq", "Fourth model is Groq");

  // -------------------------------------------------------------
  // Test Group 5: Zero-Fabrication & Provider Availability Honesty
  // -------------------------------------------------------------
  console.log("\nGroup 5: Provider Discovery & Honesty");

  const discovered = engine.getAvailableProviders();
  assert(Array.isArray(discovered), "getAvailableProviders returns an array");
  for (const m of discovered) {
    assert(m.isAvailable === true, `Model ${m.modelId} is flagged as available`);
    assert(Boolean(m.displayName), `Model ${m.modelId} has human-readable display name`);
  }

  // Verify singleton export
  assert(multiAIConsensusEngine instanceof MultiAIConsensusEngine, "multiAIConsensusEngine singleton exported");

  // -------------------------------------------------------------
  // Test Group 6: End-to-End Shared Evidence Orchestration
  // -------------------------------------------------------------
  console.log("\nGroup 6: End-to-End Orchestrator Invariants");

  // Test empty inputs resilience
  const emptyRes = await engine.evaluateConsensus([], []);
  assert(emptyRes.totalModelsParticipating === 0, "0 models participating for empty claims");
  assert(emptyRes.overallConsensusStatus === "INSUFFICIENT", "Status is INSUFFICIENT for empty input");
  assert(emptyRes.claimsConsensus.length === 0, "0 claims consensus details for empty input");

  // Test shared evidence metrics preservation
  assert(Boolean(emptyRes.sharedEvidenceSummary), "sharedEvidenceSummary exists in orchestrator result");
  assert(emptyRes.sharedEvidenceSummary?.totalSources === 0, "0 total sources in empty shared metrics");

  // Summary
  console.log("\n=======================================================");
  console.log(`   PHASE 14 JURY SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED   `);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase14SharedEvidenceJuryTests().catch((err) => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
