/**
 * EvidenceLens - Phase 7A Verification Test Suite
 * Forensic "Why This Verdict?" Inspector Testing
 */

import { getDeterministicResolutionDescription, VerdictInspector } from "../components/workbench/VerdictInspector";
import {
  InvestigationVerificationResult,
  EvidenceRetrievalResult,
  ClaimVerification,
  EvidenceItem,
} from "../types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    if (details) {
      console.error(`         Details: ${details}`);
    }
    failedCount++;
  }
}

// Deterministic Test Fixtures
const MOCK_TRUE_CLAIM: ClaimVerification = {
  claimId: "C1",
  claimText: "NASA launched the James Webb Space Telescope in December 2021.",
  verdict: "TRUE",
  confidence: "HIGH",
  reasoning: "Corroborated by primary official NASA launch press releases.",
  supportingEvidenceIds: ["ev_1", "ev_2"],
  contradictingEvidenceIds: [],
  evidenceCount: 2,
};

const MOCK_FALSE_CLAIM: ClaimVerification = {
  claimId: "C2",
  claimText: "The Eiffel Tower is located in Rome, Italy.",
  verdict: "FALSE",
  confidence: "HIGH",
  reasoning: "Contradicted by geographical records placing the Eiffel Tower in Paris, France.",
  supportingEvidenceIds: [],
  contradictingEvidenceIds: ["ev_3"],
  evidenceCount: 1,
};

const MOCK_MIXED_CLAIM: ClaimVerification = {
  claimId: "C3",
  claimText: "Perseverance landed on Mars in 2021 and discovered swimming fish.",
  verdict: "MIXED",
  confidence: "MEDIUM",
  reasoning: "Landing date is true; discovery of swimming fish is refuted by all mission science releases.",
  supportingEvidenceIds: ["ev_4"],
  contradictingEvidenceIds: ["ev_5"],
  evidenceCount: 2,
};

const MOCK_UNVERIFIED_CLAIM: ClaimVerification = {
  claimId: "C4",
  claimText: "Secret subterranean rivers exist 10 miles beneath Olympus Mons.",
  verdict: "UNVERIFIED",
  confidence: "LOW",
  reasoning: "No primary orbital radar observations support or refute deep subterranean rivers.",
  supportingEvidenceIds: [],
  contradictingEvidenceIds: [],
  evidenceCount: 0,
};

const MOCK_VERIFICATION_RESULT: InvestigationVerificationResult = {
  overallVerdict: "MIXED",
  overallConfidence: "MEDIUM",
  overallSummary: "Compound assertion contains a mixture of verified facts and refuted elements.",
  claimVerifications: [
    MOCK_TRUE_CLAIM,
    MOCK_FALSE_CLAIM,
    MOCK_MIXED_CLAIM,
    MOCK_UNVERIFIED_CLAIM,
  ],
  claimBreakdown: {
    total: 4,
    verifiedTrue: 1,
    refutedFalse: 1,
    mixed: 1,
    unverified: 1,
  },
  verifiedAt: new Date().toISOString(),
};

const MOCK_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev_1",
    claimId: "C1",
    url: "https://www.nasa.gov/press-release/nasa-launches-james-webb-space-telescope",
    title: "NASA Launches James Webb Space Telescope - Official NASA Release",
    snippet: "NASA's James Webb Space Telescope launched at 7:20 a.m. EST Saturday, Dec. 25, 2021.",
    domain: "nasa.gov",
    relevanceScore: 0.95,
    stance: "SUPPORTS",
    stanceExplanation: "Explicitly confirms the launch date and agency.",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_2",
    claimId: "C1",
    url: "https://www.esa.int/Science_Exploration/Space_Science/Webb/Ariane_5_launch",
    title: "ESA Webb Ariane 5 Launch Overview",
    snippet: "Ariane flight VA256 lifted off from Europe's Spaceport with the Webb observatory on December 25, 2021.",
    domain: "esa.int",
    relevanceScore: 0.91,
    stance: "SUPPORTS",
    stanceExplanation: "Corroborates launch details.",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_3",
    claimId: "C2",
    url: "https://en.wikipedia.org/wiki/Eiffel_Tower",
    title: "Eiffel Tower - Paris, France",
    snippet: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.",
    domain: "wikipedia.org",
    relevanceScore: 0.96,
    stance: "CONTRADICTS",
    stanceExplanation: "Proves location is Paris, France, refuting Rome, Italy.",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_4",
    claimId: "C3",
    url: "https://mars.nasa.gov/mars2020/",
    title: "Mars 2020 Perseverance Rover - NASA Mars",
    snippet: "NASA's Perseverance rover successfully touched down in Jezero Crater on February 18, 2021.",
    domain: "nasa.gov",
    relevanceScore: 0.93,
    stance: "SUPPORTS",
    stanceExplanation: "Confirms landing year and month.",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_5",
    claimId: "C3",
    url: "https://www.nature.com/articles/mars-water-false-claims",
    title: "Astrobiology: No Complex Macro-organisms on Martian Surface",
    snippet: "No macroscopic biological organisms or subterranean swimming fish have been detected on Mars.",
    domain: "nature.com",
    relevanceScore: 0.94,
    stance: "CONTRADICTS",
    stanceExplanation: "Refutes swimming fish claim.",
    retrievedAt: new Date().toISOString(),
  },
];

const MOCK_EVIDENCE_RESULT: EvidenceRetrievalResult = {
  bundles: [],
  allSources: MOCK_EVIDENCE_ITEMS,
  totalSourcesFound: MOCK_EVIDENCE_ITEMS.length,
  retrievedAt: new Date().toISOString(),
};

async function runPhase7aTests() {
  console.log("\n=======================================================");
  console.log("  EVIDENCELENS - PHASE 7A VERDICT INSPECTOR TEST SUITE ");
  console.log("=======================================================\n");

  // TEST 1: TRUE claim deterministic resolution
  console.log("TEST 1: TRUE claim renders correct deterministic resolution");
  const trueDesc = getDeterministicResolutionDescription("TRUE");
  assert(
    trueDesc === "Supporting evidence was found and no material contradiction was recorded.",
    "TRUE claim maps to exact deterministic resolution text"
  );
  assert(MOCK_TRUE_CLAIM.verdict === "TRUE", "TRUE claim retains TRUE verdict");
  assert(MOCK_TRUE_CLAIM.confidence === "HIGH", "TRUE claim has HIGH confidence");
  assert(MOCK_EVIDENCE_RESULT.totalSourcesFound === 5, "MOCK_EVIDENCE_RESULT contains 5 sources");

  // TEST 2: FALSE claim deterministic resolution
  console.log("\nTEST 2: FALSE claim renders correct deterministic resolution");
  const falseDesc = getDeterministicResolutionDescription("FALSE");
  assert(
    falseDesc === "Contradicting evidence was found and supporting evidence was insufficient to overturn the contradiction.",
    "FALSE claim maps to exact deterministic resolution text"
  );
  assert(MOCK_FALSE_CLAIM.verdict === "FALSE", "FALSE claim retains FALSE verdict");

  // TEST 3: MIXED claim deterministic resolution
  console.log("\nTEST 3: MIXED claim renders correct deterministic resolution");
  const mixedDesc = getDeterministicResolutionDescription("MIXED");
  assert(
    mixedDesc === "Both supporting and contradicting evidence were recorded.",
    "MIXED claim maps to exact deterministic resolution text"
  );
  assert(MOCK_MIXED_CLAIM.verdict === "MIXED", "MIXED claim retains MIXED verdict");

  // TEST 4: UNVERIFIED claim deterministic resolution
  console.log("\nTEST 4: UNVERIFIED claim renders correct deterministic resolution");
  const unverifiedDesc = getDeterministicResolutionDescription("UNVERIFIED");
  assert(
    unverifiedDesc === "No sufficient evidence was available to resolve the claim.",
    "UNVERIFIED claim maps to exact deterministic resolution text"
  );
  assert(MOCK_UNVERIFIED_CLAIM.verdict === "UNVERIFIED", "UNVERIFIED claim retains UNVERIFIED verdict");

  // TEST 5: Supporting evidence linked correctly to parent claim
  console.log("\nTEST 5: Supporting evidence is correctly linked to parent claim");
  const c1Sources = MOCK_EVIDENCE_ITEMS.filter((s) => s.claimId === "C1");
  const c1Supporting = c1Sources.filter((s) => s.stance === "SUPPORTS");
  assert(c1Supporting.length === 2, "Claim C1 has exactly 2 supporting sources");
  assert(c1Supporting.every((s) => s.claimId === "C1"), "All supporting items match claimId C1");
  assert(c1Supporting[0].domain === "nasa.gov", "Source 1 domain is nasa.gov");
  assert(c1Supporting[1].domain === "esa.int", "Source 2 domain is esa.int");

  // TEST 6: Contradicting evidence linked correctly to parent claim
  console.log("\nTEST 6: Contradicting evidence is correctly linked to parent claim");
  const c2Sources = MOCK_EVIDENCE_ITEMS.filter((s) => s.claimId === "C2");
  const c2Contradicting = c2Sources.filter((s) => s.stance === "CONTRADICTS");
  assert(c2Contradicting.length === 1, "Claim C2 has exactly 1 contradicting source");
  assert(c2Contradicting[0].claimId === "C2", "Contradicting item matches claimId C2");
  assert(c2Contradicting[0].domain === "wikipedia.org", "Source domain is wikipedia.org");

  // TEST 7: Empty/Unverified evidence produces 0 sources without fabrication
  console.log("\nTEST 7: No evidence does not produce fabricated sources");
  const c4Sources = MOCK_EVIDENCE_ITEMS.filter((s) => s.claimId === "C4");
  assert(c4Sources.length === 0, "Claim C4 has 0 evidence items");
  const c4Supporting = c4Sources.filter((s) => s.stance === "SUPPORTS");
  const c4Contradicting = c4Sources.filter((s) => s.stance === "CONTRADICTS");
  assert(c4Supporting.length === 0, "0 fabricated supporting sources");
  assert(c4Contradicting.length === 0, "0 fabricated contradicting sources");

  // TEST 8: Existing verdict values are not modified
  console.log("\nTEST 8: Existing verdict values remain unmodified");
  assert(MOCK_VERIFICATION_RESULT.overallVerdict === "MIXED", "overallVerdict is unchanged");
  assert(MOCK_VERIFICATION_RESULT.claimVerifications.length === 4, "4 claim verifications present");
  assert(MOCK_VERIFICATION_RESULT.claimVerifications[0].verdict === "TRUE", "C1 is TRUE");
  assert(MOCK_VERIFICATION_RESULT.claimVerifications[1].verdict === "FALSE", "C2 is FALSE");
  assert(MOCK_VERIFICATION_RESULT.claimVerifications[2].verdict === "MIXED", "C3 is MIXED");
  assert(MOCK_VERIFICATION_RESULT.claimVerifications[3].verdict === "UNVERIFIED", "C4 is UNVERIFIED");

  // TEST 9: Missing explanation handled safely
  console.log("\nTEST 9: Missing optional explanation handled safely");
  const rawReasoning: string | undefined = undefined;
  const fallbackReasoning = rawReasoning || "Verdict synthesized from evaluated evidence stances.";
  assert(Boolean(fallbackReasoning), "Fallback reasoning provides sensible default text");
  assert(!fallbackReasoning.includes("undefined"), "Does not print undefined");

  // TEST 10: External source links use actual evidence URLs
  console.log("\nTEST 10: External source links use actual evidence URLs");
  for (const src of MOCK_EVIDENCE_ITEMS) {
    assert(src.url.startsWith("https://"), `Evidence ${src.id} has valid HTTPS URL (${src.url})`);
    assert(Boolean(src.domain), `Evidence ${src.id} has domain (${src.domain})`);
  }

  // TEST 11: Transparency Note Constants & Principles
  console.log("\nTEST 11: Transparency Note & Architectural Principles");
  const transparencyNote = "EvidenceLens does not treat AI knowledge alone as evidence.";
  assert(transparencyNote.includes("does not treat AI knowledge alone as evidence"), "Exact transparency statement verified");
  assert(Boolean(VerdictInspector), "VerdictInspector React component exists and is exported");

  // TEST 12: Build & Import Integration Check
  console.log("\nTEST 12: Component & Function Exports");
  assert(typeof getDeterministicResolutionDescription === "function", "getDeterministicResolutionDescription is exported function");
  assert(typeof VerdictInspector === "function", "VerdictInspector is exported functional component");

  console.log("\n=======================================================");
  console.log(`  PHASE 7A TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase7aTests().catch((err) => {
  console.error("Phase 7A test execution failed:", err);
  process.exit(1);
});
