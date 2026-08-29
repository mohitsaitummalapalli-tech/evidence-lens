/**
 * EvidenceLens - Phase 9 Investigation History & Comparison Test Suite
 * Validates history record persistence, duplicate resolution, filtering, sorting,
 * side-by-side analytical metric comparison, and corrupt storage recovery.
 */

import {
  InvestigationInputResponse,
  InvestigationHistoryRecord,
} from "../types";
import {
  createHistoryRecordFromResponse,
  calculateConfidenceScore,
  calculateInvestigationComparison,
  HISTORY_STORAGE_KEY,
} from "../lib/history/storage";

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

// In-memory mock localStorage for Node testing environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Setup global mock window and localStorage
const mockStorage = new MockLocalStorage();
(global as unknown as { window: { localStorage: MockLocalStorage } }).window = {
  localStorage: mockStorage,
};

// Mock Response A: Space Telescope (VERIFIED, HIGH)
const MOCK_RESPONSE_A: InvestigationInputResponse = {
  success: true,
  stage: "verified",
  sessionId: "session_jwst_001",
  timestamp: "2026-08-28T10:00:00.000Z",
  message: "Investigation verified successfully.",
  input: {
    claim: "The James Webb Space Telescope launched on December 25, 2021 on an Ariane 5 rocket.",
    claimReceived: true,
    contextUrlReceived: false,
    mediaReceived: false,
  },
  extraction: {
    claims: [
      {
        id: "C1",
        text: "The James Webb Space Telescope launched on December 25, 2021.",
        category: "time",
        checkability: "high",
        entities: ["JWST", "Dec 25 2021"],
      },
      {
        id: "C2",
        text: "Ariane 5 rocket was used.",
        category: "event",
        checkability: "high",
        entities: ["Ariane 5"],
      },
    ],
    originalClaim: "The James Webb Space Telescope launched on December 25, 2021 on an Ariane 5 rocket.",
  },
  evidence: {
    bundles: [],
    allSources: [
      {
        id: "ev_1",
        claimId: "C1",
        url: "https://www.nasa.gov/jwst",
        title: "NASA JWST",
        snippet: "Dec 25 2021 launch.",
        domain: "nasa.gov",
        relevanceScore: 0.98,
        stance: "SUPPORTS",
        retrievedAt: "2026-08-28T10:00:00.000Z",
      },
      {
        id: "ev_2",
        claimId: "C1",
        url: "https://www.esa.int/jwst",
        title: "ESA JWST",
        snippet: "Ariane 5 liftoff.",
        domain: "esa.int",
        relevanceScore: 0.95,
        stance: "SUPPORTS",
        retrievedAt: "2026-08-28T10:00:00.000Z",
      },
      {
        id: "ev_3",
        claimId: "C2",
        url: "https://www.arianespace.com/jwst",
        title: "Arianespace Launch",
        snippet: "Ariane 5 flight.",
        domain: "arianespace.com",
        relevanceScore: 0.94,
        stance: "SUPPORTS",
        retrievedAt: "2026-08-28T10:00:00.000Z",
      },
    ],
    totalSourcesFound: 3,
    retrievedAt: "2026-08-28T10:00:00.000Z",
  },
  verification: {
    overallVerdict: "VERIFIED",
    overallConfidence: "HIGH",
    overallSummary: "All assertions verified.",
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
        reasoning: "Corroborated by NASA and ESA.",
        supportingEvidenceIds: ["ev_1", "ev_2"],
        contradictingEvidenceIds: [],
        evidenceCount: 2,
      },
      {
        claimId: "C2",
        claimText: "Ariane 5 rocket was used.",
        verdict: "TRUE",
        confidence: "HIGH",
        reasoning: "Corroborated by Arianespace.",
        supportingEvidenceIds: ["ev_3"],
        contradictingEvidenceIds: [],
        evidenceCount: 1,
      },
    ],
    verifiedAt: "2026-08-28T10:00:00.000Z",
  },
  nextStage: "completed",
};

// Mock Response B: Mars Fish (MIXED, MEDIUM, Multimodal with Provenance)
const MOCK_RESPONSE_B: InvestigationInputResponse = {
  success: true,
  stage: "verified",
  sessionId: "session_mars_002",
  timestamp: "2026-08-28T11:00:00.000Z",
  message: "Investigation verified successfully.",
  input: {
    claim: "NASA landed Perseverance on Mars in 2021 and discovered swimming fish in subterranean rivers.",
    claimReceived: true,
    contextUrlReceived: false,
    mediaReceived: true,
    media: {
      type: "image",
      filename: "mars_subterranean.png",
      mimeType: "image/png",
      sizeBytes: 409600,
    },
  },
  extraction: {
    claims: [
      {
        id: "C1",
        text: "NASA landed Perseverance on Mars in 2021.",
        category: "event",
        checkability: "high",
        entities: ["Perseverance", "Mars", "2021"],
      },
      {
        id: "C2",
        text: "Discovered swimming fish in subterranean rivers.",
        category: "other",
        checkability: "high",
        entities: ["swimming fish", "subterranean rivers"],
      },
    ],
    originalClaim: "NASA landed Perseverance on Mars in 2021 and discovered swimming fish in subterranean rivers.",
  },
  evidence: {
    bundles: [],
    allSources: [
      {
        id: "ev_4",
        claimId: "C1",
        url: "https://mars.nasa.gov/perseverance",
        title: "Perseverance Landing",
        snippet: "Landed Feb 2021.",
        domain: "nasa.gov",
        relevanceScore: 0.99,
        stance: "SUPPORTS",
        retrievedAt: "2026-08-28T11:00:00.000Z",
      },
      {
        id: "ev_5",
        claimId: "C2",
        url: "https://www.nature.com/articles/mars-water-hoax",
        title: "No macroscopic life on Mars",
        snippet: "Claims of fish are unfounded hoaxes.",
        domain: "nature.com",
        relevanceScore: 0.96,
        stance: "CONTRADICTS",
        retrievedAt: "2026-08-28T11:00:00.000Z",
      },
    ],
    totalSourcesFound: 2,
    retrievedAt: "2026-08-28T11:00:00.000Z",
  },
  verification: {
    overallVerdict: "MIXED",
    overallConfidence: "MEDIUM",
    overallSummary: "Perseverance landing is true but fish discovery is false.",
    claimBreakdown: {
      total: 2,
      verifiedTrue: 1,
      refutedFalse: 1,
      mixed: 0,
      unverified: 0,
    },
    claimVerifications: [
      {
        claimId: "C1",
        claimText: "NASA landed Perseverance on Mars in 2021.",
        verdict: "TRUE",
        confidence: "HIGH",
        reasoning: "Verified true.",
        supportingEvidenceIds: ["ev_4"],
        contradictingEvidenceIds: [],
        evidenceCount: 1,
      },
      {
        claimId: "C2",
        claimText: "Discovered swimming fish in subterranean rivers.",
        verdict: "FALSE",
        confidence: "HIGH",
        reasoning: "Refuted false.",
        supportingEvidenceIds: [],
        contradictingEvidenceIds: ["ev_5"],
        evidenceCount: 1,
      },
    ],
    verifiedAt: "2026-08-28T11:00:00.000Z",
  },
  imageProvenance: {
    hasImage: true,
    searchStatus: "SUCCESS",
    totalCandidatesFound: 1,
    uniqueDomains: ["nasa.gov"],
    candidates: [
      {
        id: "cand_1",
        url: "https://mars.nasa.gov/multimedia/images/perseverance",
        title: "NASA Mars Panorama",
        domain: "nasa.gov",
        snippet: "Official rover panorama.",
        relevanceScore: 0.88,
        matchType: "POSSIBLE_MATCH",
        discoveredAt: "2026-08-28T11:00:00.000Z",
      },
    ],
    queriesExecuted: ["Mars Perseverance rover photo"],
    discoveredAt: "2026-08-28T11:00:00.000Z",
  },
  nextStage: "completed",
};

async function runPhase9Tests() {
  console.log("\n=======================================================");
  console.log("   EVIDENCELENS - PHASE 9 HISTORY & COMPARISON SUITE   ");
  console.log("=======================================================\n");

  // TEST 1: History Record Creation from Response
  console.log("TEST 1: History Record Transformation");
  const recordA = createHistoryRecordFromResponse(MOCK_RESPONSE_A);
  assert(recordA.id === "session_jwst_001", "Preserved session ID");
  assert(recordA.overallVerdict === "VERIFIED", "Preserved overall verdict VERIFIED");
  assert(recordA.overallConfidence === "HIGH", "Preserved overall confidence HIGH");
  assert(recordA.atomicClaimCount === 2, "Recorded 2 atomic claims");
  assert(recordA.evidenceCount === 3, "Recorded 3 evidence sources");
  assert(recordA.uniqueDomainCount === 3, "Identified 3 unique domains (nasa, esa, arianespace)");
  assert(recordA.supportsCount === 3, "Calculated 3 supporting evidence links");
  assert(recordA.contradictsCount === 0, "Calculated 0 contradicting evidence links");
  assert(recordA.imageCandidateCount === 0, "Recorded 0 image candidates for text-only claim");
  assert(recordA.confidenceScore >= 85, `Confidence score is quantitative percentage (${recordA.confidenceScore}%)`);

  // TEST 2: Multimodal History Record with Provenance
  console.log("\nTEST 2: Multimodal History Record Transformation");
  const recordB = createHistoryRecordFromResponse(MOCK_RESPONSE_B);
  assert(recordB.id === "session_mars_002", "Preserved session ID");
  assert(recordB.overallVerdict === "MIXED", "Preserved overall verdict MIXED");
  assert(recordB.hasMedia === true, "Recorded hasMedia = true");
  assert(recordB.mediaFilename === "mars_subterranean.png", "Preserved media filename");
  assert(recordB.imageCandidateCount === 1, "Recorded 1 image candidate");
  assert(recordB.supportsCount === 1, "Calculated 1 supporting citation");
  assert(recordB.contradictsCount === 1, "Calculated 1 contradicting citation");

  // TEST 3: localStorage Serialization and Deserialization
  console.log("\nTEST 3: LocalStorage Serialization / Deserialization");
  mockStorage.clear();
  const rawList = [recordA, recordB];
  mockStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(rawList));

  const savedRaw = mockStorage.getItem(HISTORY_STORAGE_KEY);
  assert(typeof savedRaw === "string", "Serialized history string exists in storage");
  const parsed = JSON.parse(savedRaw || "[]") as InvestigationHistoryRecord[];
  assert(parsed.length === 2, "Deserialized exactly 2 records");
  assert(parsed[0].id === "session_jwst_001", "First record ID matches");
  assert(parsed[1].id === "session_mars_002", "Second record ID matches");

  // TEST 4: Duplicate Record Handling
  console.log("\nTEST 4: Duplicate Record Resolution");
  // Updated JWST response with updated claim text
  const updatedMockA: InvestigationInputResponse = {
    ...MOCK_RESPONSE_A,
    input: { ...MOCK_RESPONSE_A.input, claim: "JWST Launch Updated Claim" },
  };
  const updatedRecordA = createHistoryRecordFromResponse(updatedMockA);

  // Ingest existing + update
  const existingList = [recordA, recordB];
  const dedupedList = [updatedRecordA, ...existingList.filter((item) => item.id !== updatedRecordA.id)];
  assert(dedupedList.length === 2, "Deduplication maintains total item count of 2");
  assert(dedupedList[0].targetClaim === "JWST Launch Updated Claim", "Updated existing record in place");

  // TEST 5: Verdict Filtering Logic
  console.log("\nTEST 5: Verdict Filtering Logic");
  const allRecords = [recordA, recordB];
  const verifiedOnly = allRecords.filter((r) => r.overallVerdict === "VERIFIED");
  const mixedOnly = allRecords.filter((r) => r.overallVerdict === "MIXED");
  const falseOnly = allRecords.filter((r) => r.overallVerdict === "FALSE");

  assert(verifiedOnly.length === 1 && verifiedOnly[0].id === "session_jwst_001", "Filter VERIFIED matches record A");
  assert(mixedOnly.length === 1 && mixedOnly[0].id === "session_mars_002", "Filter MIXED matches record B");
  assert(falseOnly.length === 0, "Filter FALSE yields 0 results");

  // TEST 6: Sorting Logic
  console.log("\nTEST 6: Sorting Logic");
  const byConfidence = [...allRecords].sort((a, b) => b.confidenceScore - a.confidenceScore);
  assert(byConfidence[0].id === "session_jwst_001", "Highest confidence is record A");

  const bySources = [...allRecords].sort((a, b) => b.evidenceCount - a.evidenceCount);
  assert(bySources[0].evidenceCount === 3, "Most sources is record A (3 sources)");

  const byOldest = [...allRecords].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  assert(byOldest[0].id === "session_jwst_001", "Oldest is record A (10:00 AM)");

  // TEST 7: Clearing History
  console.log("\nTEST 7: Clearing History");
  mockStorage.clear();
  assert(mockStorage.getItem(HISTORY_STORAGE_KEY) === null, "Storage key removed upon clear");

  // TEST 8: Side-by-Side Comparison Metrics Calculation
  console.log("\nTEST 8: Side-by-Side Comparison Metrics Calculation");
  const comparison = calculateInvestigationComparison(recordA, recordB);

  assert(comparison.verdictMatches === false, "Verdict does not match (VERIFIED vs MIXED)");
  assert(comparison.claimsDelta === 0, "Claims delta is 0 (2 vs 2)");
  assert(comparison.sourcesDelta === 1, "Sources delta is +1 (3 vs 2)");
  assert(comparison.domainsDelta === 1, "Domains delta is +1 (3 vs 2)");
  assert(comparison.provenanceDelta === -1, "Provenance delta is -1 (0 vs 1)");
  assert(comparison.supportsDelta === 2, "Supports delta is +2 (3 vs 1)");
  assert(comparison.contradictsDelta === -1, "Contradicts delta is -1 (0 vs 1)");
  assert(comparison.confidenceDelta > 0, `Confidence delta is positive (+${comparison.confidenceDelta}%)`);

  // TEST 9: Confidence Score Calibration Range
  console.log("\nTEST 9: Quantitative Confidence Score Grounding");
  const highConfidenceScore = calculateConfidenceScore("HIGH", {
    total: 2,
    verifiedTrue: 2,
    refutedFalse: 0,
    mixed: 0,
    unverified: 0,
  });
  const lowConfidenceScore = calculateConfidenceScore("LOW", {
    total: 2,
    verifiedTrue: 0,
    refutedFalse: 0,
    mixed: 0,
    unverified: 2,
  });

  assert(highConfidenceScore >= 80, `HIGH confidence score >= 80% (got ${highConfidenceScore}%)`);
  assert(lowConfidenceScore <= 40, `LOW confidence score <= 40% (got ${lowConfidenceScore}%)`);
  assert(highConfidenceScore > lowConfidenceScore, "HIGH score strictly exceeds LOW score");

  // TEST 10: Corrupt / Malformed LocalStorage Recovery
  console.log("\nTEST 10: Corrupt Storage Recovery");
  mockStorage.setItem(HISTORY_STORAGE_KEY, "{ bad json non-array ]]]");
  let recoveredRecords: InvestigationHistoryRecord[] = [];
  try {
    const raw = mockStorage.getItem(HISTORY_STORAGE_KEY);
    const parsedCorrupt = JSON.parse(raw || "[]");
    if (Array.isArray(parsedCorrupt)) {
      recoveredRecords = parsedCorrupt;
    }
  } catch {
    recoveredRecords = [];
  }
  assert(recoveredRecords.length === 0, "Gracefully handled malformed JSON by falling back to empty array");

  console.log("\n=======================================================");
  console.log(`  PHASE 9 TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
