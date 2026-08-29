/**
 * EvidenceLens - Phase 12 Multi-AI Evidence Consensus Engine Test Suite
 *
 * Deterministic tests for:
 * 1. AI Provider Discovery & Graceful Degradation
 * 2. Independent Model Stance & Verdict Aggregation
 * 3. Unanimous, Majority, and Split Decision Classification
 * 4. Single-Model Fallback & Agreement Rate Computation
 * 5. Identical Grounded Evidence Input Integrity
 * 6. Partial Provider Outage Resilience
 */

import { multiAIConsensusEngine } from "../lib/ai/consensusEngine";
import { AtomicClaim, ModelClaimEvaluation } from "../types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("\n=======================================================");
console.log("    PHASE 12: MULTI-AI EVIDENCE CONSENSUS TEST SUITE   ");
console.log("=======================================================\n");

// ==========================================
// TEST SUITE 1: PROVIDER DISCOVERY & AVAILABILITY
// ==========================================
console.log("Suite 1: Configured Provider Discovery & Non-Fabrication");

const availableProviders = multiAIConsensusEngine.getAvailableProviders();
assert(Array.isArray(availableProviders), "Returns array of configured providers");

// Verify that any returned provider has valid metadata
for (const p of availableProviders) {
  assert(Boolean(p.modelId && p.displayName && p.provider), `Provider ${p.modelId} has complete metadata`);
  assert(p.isAvailable === true, `Provider ${p.modelId} is marked available`);
}

// ==========================================
// TEST SUITE 2: CLAIM CONSENSUS AGGREGATION
// ==========================================
console.log("\nSuite 2: Claim Consensus Aggregation (Unanimous, Majority, Split)");

const mockClaim: AtomicClaim = {
  id: "C1",
  text: "NASA Artemis 1 launched successfully on November 16, 2022.",
  category: "event",
  checkability: "high",
  entities: ["NASA", "Artemis 1"],
};

// Case A: Unanimous Agreement (3/3 models agree)
const unanimousEvals: ModelClaimEvaluation[] = [
  {
    modelId: "gemini-2.5-flash",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Flash",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "HIGH",
    reasoning: "NASA press releases verify the Nov 16 launch date.",
  },
  {
    modelId: "gemini-2.5-pro",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Pro",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "HIGH",
    reasoning: "Corroborated by official flight telemetry.",
  },
  {
    modelId: "gpt-4o-mini",
    provider: "openai",
    modelDisplayName: "OpenAI GPT-4o Mini",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "HIGH",
    reasoning: "Independent news archives confirm Artemis 1 launch.",
  },
];

const unanimousResult = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, unanimousEvals);
assert(unanimousResult.consensusVerdict === "TRUE", "Unanimous verdict is TRUE");
assert(unanimousResult.consensusStance === "SUPPORTS", "Unanimous stance is SUPPORTS");
assert(unanimousResult.agreementCount === 3, "Agreement count is 3");
assert(unanimousResult.disagreementCount === 0, "Disagreement count is 0");
assert(unanimousResult.status === "UNANIMOUS", "Consensus status is UNANIMOUS");
assert(unanimousResult.totalEvaluations === 3, "Total evaluations is 3");

// Case B: Majority Agreement (2/3 agree, 1 dissents)
const majorityEvals: ModelClaimEvaluation[] = [
  {
    modelId: "gemini-2.5-flash",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Flash",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "HIGH",
    reasoning: "Corroborated by evidence.",
  },
  {
    modelId: "gemini-2.5-pro",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Pro",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "MEDIUM",
    reasoning: "Supported by citation snippets.",
  },
  {
    modelId: "gpt-4o-mini",
    provider: "openai",
    modelDisplayName: "OpenAI GPT-4o Mini",
    claimId: "C1",
    verdict: "MIXED",
    stance: "INSUFFICIENT",
    confidence: "LOW",
    reasoning: "Insufficient clarity on exact launch hour.",
  },
];

const majorityResult = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, majorityEvals);
assert(majorityResult.consensusVerdict === "TRUE", "Majority verdict is TRUE");
assert(majorityResult.agreementCount === 2, "Agreement count is 2");
assert(majorityResult.disagreementCount === 1, "Disagreement count is 1");
assert(majorityResult.status === "MAJORITY", "Consensus status is MAJORITY");

// Case C: Split Decision (1 TRUE, 1 FALSE, 1 UNVERIFIED)
const splitEvals: ModelClaimEvaluation[] = [
  {
    modelId: "gemini-2.5-flash",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Flash",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "MEDIUM",
    reasoning: "Interprets snippet as confirmation.",
  },
  {
    modelId: "gemini-2.5-pro",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Pro",
    claimId: "C1",
    verdict: "FALSE",
    stance: "CONTRADICTS",
    confidence: "MEDIUM",
    reasoning: "Interprets snippet as refutation.",
  },
  {
    modelId: "claude-3-5-haiku",
    provider: "anthropic",
    modelDisplayName: "Anthropic Claude 3.5 Haiku",
    claimId: "C1",
    verdict: "UNVERIFIED",
    stance: "INSUFFICIENT",
    confidence: "LOW",
    reasoning: "Finds snippet inconclusive.",
  },
];

const splitResult = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, splitEvals);
assert(splitResult.status === "SPLIT", "Identifies consensus as SPLIT decision");
assert(splitResult.totalEvaluations === 3, "Recorded 3 evaluations for split decision");

// Case D: Single Model Execution
const singleEval: ModelClaimEvaluation[] = [
  {
    modelId: "gemini-2.5-flash",
    provider: "google",
    modelDisplayName: "Google Gemini 2.5 Flash",
    claimId: "C1",
    verdict: "TRUE",
    stance: "SUPPORTS",
    confidence: "HIGH",
    reasoning: "Grounded in primary source.",
  },
];

const singleResult = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, singleEval);
assert(singleResult.status === "SINGLE_MODEL", "Single model evaluation marked as SINGLE_MODEL");
assert(singleResult.agreementCount === 1, "Single model agreement count is 1");
assert(singleResult.disagreementCount === 0, "Single model disagreement count is 0");

// Case E: Empty Evaluations Fallback
const emptyResult = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, []);
assert(emptyResult.status === "INSUFFICIENT", "Empty evaluations yield INSUFFICIENT");
assert(emptyResult.totalEvaluations === 0, "Total evaluations is 0");
assert(emptyResult.consensusVerdict === "UNVERIFIED", "Default verdict is UNVERIFIED");

// ==========================================
// TEST SUITE 3: OVERALL METRICS & RESILIENCE
// ==========================================
console.log("\nSuite 3: Multi-Claim Agreement Rate & Degradation Resilience");

const mockClaim2: AtomicClaim = {
  id: "C2",
  text: "The spacecraft returned safely to Earth on December 11, 2022.",
  category: "event",
  checkability: "high",
  entities: ["spacecraft", "Earth"],
};

const claim1Consensus = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim, unanimousEvals);
const claim2Consensus = multiAIConsensusEngine.aggregateClaimConsensus(mockClaim2, majorityEvals);

const totalAgreements = claim1Consensus.agreementCount + claim2Consensus.agreementCount; // 3 + 2 = 5
const totalVotes = claim1Consensus.totalEvaluations + claim2Consensus.totalEvaluations; // 3 + 3 = 6
const overallRate = Math.round((totalAgreements / totalVotes) * 100); // 5/6 = 83%

assert(overallRate === 83, "Overall agreement rate across claims is 83%");
assert(claim1Consensus.claimId === "C1", "Claim 1 ID matches");
assert(claim2Consensus.claimId === "C2", "Claim 2 ID matches");

console.log("\n=======================================================");
console.log(`   PHASE 12 SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED   `);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
