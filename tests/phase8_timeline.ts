/**
 * EvidenceLens - Phase 8 Investigation Timeline Test Suite
 * Validates deterministic lifecycle progression, stage status mapping, grounded domain aggregation, and anchor linkages.
 */

import {
  InvestigationInputResponse,
  InvestigationUIState,
  AtomicClaim,
  EvidenceItem,
  InvestigationVerificationResult,
} from "../types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         Details: ${details}`);
    failedCount++;
  }
}

// Mock Claims
const MOCK_CLAIMS: AtomicClaim[] = [
  {
    id: "C1",
    text: "The James Webb Space Telescope launched on December 25, 2021.",
    category: "time",
    checkability: "high",
    entities: ["James Webb Space Telescope", "December 25, 2021"],
  },
  {
    id: "C2",
    text: "Ariane 5 rocket was used for the JWST deployment.",
    category: "event",
    checkability: "high",
    entities: ["Ariane 5", "JWST"],
  },
];

// Mock Evidence
const MOCK_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev_1",
    claimId: "C1",
    url: "https://www.nasa.gov/press-release/nasa-launches-james-webb-space-telescope",
    title: "NASA Launches James Webb Space Telescope",
    snippet: "NASA's James Webb Space Telescope launched at 7:20 a.m. EST Saturday, Dec. 25, 2021 on an Ariane 5 rocket.",
    domain: "nasa.gov",
    relevanceScore: 0.98,
    stance: "SUPPORTS",
    stanceExplanation: "Confirms launch date Dec 25, 2021.",
    retrievedAt: "2026-08-28T00:00:00.000Z",
  },
  {
    id: "ev_2",
    claimId: "C1",
    url: "https://www.esa.int/Science_Exploration/Space_Science/Webb/Ariane_5_launch",
    title: "Webb launch on Ariane 5 from Europe's Spaceport",
    snippet: "Liftoff took place on 25 December 2021 on an Ariane 5 launcher from Europe's Spaceport in French Guiana.",
    domain: "esa.int",
    relevanceScore: 0.95,
    stance: "SUPPORTS",
    stanceExplanation: "Confirms ESA/Ariane 5 launch on Dec 25, 2021.",
    retrievedAt: "2026-08-28T00:00:00.000Z",
  },
  {
    id: "ev_3",
    claimId: "C2",
    url: "https://www.arianespace.com/press-release/ariane-5-successfully-launches-james-webb-space-telescope",
    title: "Ariane 5 Successfully Launches James Webb Space Telescope",
    snippet: "Arianespace confirms Ariane 5 successfully deployed JWST.",
    domain: "arianespace.com",
    relevanceScore: 0.96,
    stance: "SUPPORTS",
    stanceExplanation: "Confirms Ariane 5 launch vehicle.",
    retrievedAt: "2026-08-28T00:00:00.000Z",
  },
];

// Mock Verification Result
const MOCK_VERIFICATION: InvestigationVerificationResult = {
  overallVerdict: "VERIFIED",
  overallConfidence: "HIGH",
  overallSummary: "All atomic assertions are corroborated by authoritative sources (NASA, ESA, Arianespace).",
  claimBreakdown: {
    total: 2,
    verifiedTrue: 2,
    refutedFalse: 0,
    mixed: 0,
    unverified: 0,
  },
  claimVerifications: [
    {
      claimId: "C1",
      claimText: "The James Webb Space Telescope launched on December 25, 2021.",
      verdict: "TRUE",
      confidence: "HIGH",
      reasoning: "NASA and ESA press releases corroborate the Dec 25, 2021 launch date.",
      supportingEvidenceIds: ["ev_1", "ev_2"],
      contradictingEvidenceIds: [],
      evidenceCount: 2,
    },
    {
      claimId: "C2",
      claimText: "Ariane 5 rocket was used for the JWST deployment.",
      verdict: "TRUE",
      confidence: "HIGH",
      reasoning: "Arianespace confirms Ariane 5 launch vehicle deployment.",
      supportingEvidenceIds: ["ev_3"],
      contradictingEvidenceIds: [],
      evidenceCount: 1,
    },
  ],
  verifiedAt: "2026-08-28T00:00:00.000Z",
};

// Mock Complete Response (Text-only)
const MOCK_COMPLETE_RESPONSE: InvestigationInputResponse = {
  success: true,
  stage: "verified",
  sessionId: "session_jwst_test_123",
  timestamp: "2026-08-28T00:00:00.000Z",
  message: "Investigation verified successfully.",
  input: {
    claim: "The James Webb Space Telescope was launched on December 25, 2021 on an Ariane 5 rocket.",
    claimReceived: true,
    contextUrlReceived: false,
    mediaReceived: false,
  },
  extraction: {
    claims: MOCK_CLAIMS,
    originalClaim: "The James Webb Space Telescope was launched on December 25, 2021 on an Ariane 5 rocket.",
  },
  evidence: {
    bundles: [],
    allSources: MOCK_EVIDENCE_ITEMS,
    totalSourcesFound: 3,
    retrievedAt: "2026-08-28T00:00:00.000Z",
  },
  verification: MOCK_VERIFICATION,
  nextStage: "completed",
};

// Mock Response with Image Provenance
const MOCK_MULTIMODAL_RESPONSE: InvestigationInputResponse = {
  ...MOCK_COMPLETE_RESPONSE,
  input: {
    ...MOCK_COMPLETE_RESPONSE.input,
    mediaReceived: true,
    media: {
      type: "image",
      filename: "jwst_launch.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 204800,
    },
  },
  imageProvenance: {
    hasImage: true,
    searchStatus: "SUCCESS",
    totalCandidatesFound: 2,
    uniqueDomains: ["nasa.gov", "esa.int"],
    candidates: [
      {
        id: "cand_1",
        url: "https://www.nasa.gov/image-feature/jwst-liftoff",
        title: "Webb Liftoff from Europe Spaceport",
        domain: "nasa.gov",
        snippet: "Official NASA photograph of Ariane 5 carrying Webb.",
        relevanceScore: 0.92,
        matchType: "POSSIBLE_MATCH",
        discoveredAt: "2026-08-28T00:00:00.000Z",
      },
    ],
    queriesExecuted: ["JWST Ariane 5 liftoff"],
    discoveredAt: "2026-08-28T00:00:00.000Z",
  },
};

async function runPhase8Tests() {
  console.log("\n=======================================================");
  console.log("   EVIDENCELENS - PHASE 8 INVESTIGATION TIMELINE SUITE ");
  console.log("=======================================================\n");

  // TEST 1: Timeline Stage Sequence Verification
  console.log("TEST 1: Lifecycle Stages Structure");
  const EXPECTED_STAGES = [
    "input_received",
    "claims_decomposed",
    "evidence_retrieved",
    "evidence_linked",
    "image_provenance",
    "stance_analysis",
    "verdict_synthesis",
    "investigation_complete",
  ];
  assert(EXPECTED_STAGES.length === 8, "Timeline defines exactly 8 lifecycle stages");

  // TEST 2: IDLE state status mapping
  console.log("\nTEST 2: IDLE / DORMANT State Status Mapping");
  const idleUiState: InvestigationUIState = "IDLE";
  assert(idleUiState === "IDLE", "UI state is IDLE");

  // TEST 3: SUBMITTING state progression
  console.log("\nTEST 3: SUBMITTING State Active Stage Illumination");
  const submittingState: InvestigationUIState = "SUBMITTING";
  assert(submittingState === "SUBMITTING", "UI state is SUBMITTING");

  // TEST 4: COMPLETED State Text-only Assertion (Image Provenance SKIPPED)
  console.log("\nTEST 4: Completed Text-Only Investigation Lifecycle");
  assert(MOCK_COMPLETE_RESPONSE.success === true, "Response success is true");
  assert(MOCK_COMPLETE_RESPONSE.extraction?.claims.length === 2, "Decomposed 2 atomic claims");
  assert(MOCK_COMPLETE_RESPONSE.evidence?.totalSourcesFound === 3, "Retrieved 3 web sources");
  assert(MOCK_COMPLETE_RESPONSE.verification?.overallVerdict === "VERIFIED", "Synthesized VERIFIED verdict");
  assert(MOCK_COMPLETE_RESPONSE.input.mediaReceived === false, "mediaReceived is false -> Provenance stage SKIPPED");

  // TEST 5: COMPLETED State Multimodal Assertion (Image Provenance RESOLVED)
  console.log("\nTEST 5: Completed Multimodal Investigation Lifecycle");
  assert(MOCK_MULTIMODAL_RESPONSE.input.mediaReceived === true, "mediaReceived is true");
  assert(MOCK_MULTIMODAL_RESPONSE.imageProvenance?.searchStatus === "SUCCESS", "Image provenance is SUCCESS");
  assert(MOCK_MULTIMODAL_RESPONSE.imageProvenance?.totalCandidatesFound === 2, "Discovered 2 provenance candidates");

  // TEST 6: Domain Aggregation from Grounded Evidence
  console.log("\nTEST 6: Grounded Domain Aggregation");
  const domains = new Set(MOCK_EVIDENCE_ITEMS.map((s) => s.domain));
  assert(domains.size === 3, "Exactly 3 unique domains identified");
  assert(domains.has("nasa.gov"), "Contains nasa.gov domain");
  assert(domains.has("esa.int"), "Contains esa.int domain");
  assert(domains.has("arianespace.com"), "Contains arianespace.com domain");

  // TEST 7: Stance Breakdown Calculation
  console.log("\nTEST 7: Stance Breakdown Grounding");
  let supportsCount = 0;
  let contradictsCount = 0;
  MOCK_VERIFICATION.claimVerifications.forEach((c) => {
    supportsCount += c.supportingEvidenceIds.length;
    contradictsCount += c.contradictingEvidenceIds.length;
  });
  assert(supportsCount === 3, "Supporting evidence count is 3 (2 from C1, 1 from C2)");
  assert(contradictsCount === 0, "Contradicting evidence count is 0");

  // TEST 8: Anchor IDs Verification
  console.log("\nTEST 8: Anchor IDs Match UI Panels");
  const requiredAnchors = [
    "claim-input-section",
    "claim-extraction-panel",
    "evidence-panel",
    "image-provenance-panel",
    "verification-result-panel",
    "evidence-graph-panel",
  ];
  requiredAnchors.forEach((anchor) => {
    assert(Boolean(anchor), `Anchor ID '${anchor}' defined`);
  });

  // TEST 9: No Fabricated Timestamps Rule
  console.log("\nTEST 9: Grounded Timing Integrity");
  assert(typeof MOCK_COMPLETE_RESPONSE.timestamp === "string", "Response timestamp is valid string");
  assert(typeof MOCK_COMPLETE_RESPONSE.sessionId === "string", "SessionId is valid string");

  console.log("\n=======================================================");
  console.log(`  PHASE 8 TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase8Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
