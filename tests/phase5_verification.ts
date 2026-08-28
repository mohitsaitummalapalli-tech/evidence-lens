/**
 * EvidenceLens - Phase 5 Verification Test Suite
 * Validates Evidence Reasoning, Stance Grounding, Claim-Level Verdicts, and Overall Deterministic Aggregation.
 *
 * Run with: npx tsx tests/phase5_verification.ts
 */

import fs from "fs";
import path from "path";

// Load .env.local without requiring external dotenv package
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

import {
  VerificationReasoningService,
} from "../lib/verification/reasoning";
import {
  AtomicClaim,
  ClaimEvidenceBundle,
  EvidenceItem,
  ClaimVerification,
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

async function runPhase5Tests() {
  console.log("\n=======================================================");
  console.log("  EVIDENCELENS - PHASE 5 VERIFICATION TEST SUITE");
  console.log("=======================================================\n");

  const service = new VerificationReasoningService();

  // -------------------------------------------------------------
  // Test 1: Single Supporting Evidence -> Claim Verdict TRUE
  // -------------------------------------------------------------
  console.log("TEST 1: Supporting evidence -> Claim Verdict TRUE");
  const claim1: AtomicClaim = {
    id: "C1",
    text: "James Webb Space Telescope was launched on December 25, 2021.",
    category: "time",
    checkability: "high",
    entities: ["JWST", "launch date"],
  };
  const supportEvidence: EvidenceItem[] = [
    {
      id: "ev_1",
      claimId: "C1",
      title: "NASA Webb Launch Milestone",
      url: "https://nasa.gov/webb-launch",
      domain: "nasa.gov",
      snippet: "The James Webb Space Telescope was successfully launched on Christmas Day, December 25, 2021 from Kourou.",
      stance: "SUPPORTS",
      retrievedAt: new Date().toISOString(),
    },
    {
      id: "ev_2",
      claimId: "C1",
      title: "ESA JWST Mission Overview",
      url: "https://esa.int/jwst",
      domain: "esa.int",
      snippet: "Webb lifted off on an Ariane 5 rocket on 25 December 2021.",
      stance: "SUPPORTS",
      retrievedAt: new Date().toISOString(),
    },
  ];

  const result1 = service.verifyClaim(claim1, supportEvidence);
  assert(result1.verdict === "TRUE", "Claim 1 verdict is TRUE");
  assert(result1.confidence === "HIGH", "Claim 1 confidence is HIGH with 2 supporting sources");
  assert(result1.supportingEvidenceIds.length === 2, "Claim 1 has 2 supporting evidence IDs");
  assert(result1.contradictingEvidenceIds.length === 0, "Claim 1 has 0 contradicting evidence IDs");

  // -------------------------------------------------------------
  // Test 2: Contradicting Evidence -> Claim Verdict FALSE
  // -------------------------------------------------------------
  console.log("\nTEST 2: Contradicting evidence -> Claim Verdict FALSE");
  const claim2: AtomicClaim = {
    id: "C2",
    text: "The Eiffel Tower is located in Rome, Italy.",
    category: "location",
    checkability: "high",
    entities: ["Eiffel Tower", "Rome"],
  };
  const refuteEvidence: EvidenceItem[] = [
    {
      id: "ev_3",
      claimId: "C2",
      title: "Eiffel Tower Official Guide",
      url: "https://toureiffel.paris/en",
      domain: "toureiffel.paris",
      snippet: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.",
      stance: "CONTRADICTS",
      retrievedAt: new Date().toISOString(),
    },
  ];

  const result2 = service.verifyClaim(claim2, refuteEvidence);
  assert(result2.verdict === "FALSE", "Claim 2 verdict is FALSE");
  assert(result2.contradictingEvidenceIds.includes("ev_3"), "Claim 2 links to contradicting evidence ev_3");

  // -------------------------------------------------------------
  // Test 3: Conflicting / Mixed Evidence -> Claim Verdict MIXED
  // -------------------------------------------------------------
  console.log("\nTEST 3: Mixed/Conflicting evidence -> Claim Verdict MIXED");
  const claim3: AtomicClaim = {
    id: "C3",
    text: "Global carbon emissions decreased by 15% during 2020.",
    category: "other",
    checkability: "high",
    entities: ["carbon emissions", "2020"],
  };
  const mixedEvidence: EvidenceItem[] = [
    {
      id: "ev_4",
      claimId: "C3",
      title: "IEA Global Energy Review 2020",
      url: "https://iea.org/reports/global-energy-review-2020",
      domain: "iea.org",
      snippet: "Global CO2 emissions fell by 5.8% in 2020, significantly less than early 15% projections.",
      stance: "CONTRADICTS",
      retrievedAt: new Date().toISOString(),
    },
    {
      id: "ev_5",
      claimId: "C3",
      title: "Regional Aviation Study 2020",
      url: "https://nature.com/articles/aviation-2020",
      domain: "nature.com",
      snippet: "In certain peak lockdown months, daily carbon emissions temporarily plunged by up to 15%.",
      stance: "SUPPORTS",
      retrievedAt: new Date().toISOString(),
    },
  ];

  const result3 = service.verifyClaim(claim3, mixedEvidence);
  assert(result3.verdict === "MIXED", "Claim 3 verdict is MIXED");
  assert(result3.supportingEvidenceIds.length === 1, "Claim 3 records 1 support");
  assert(result3.contradictingEvidenceIds.length === 1, "Claim 3 records 1 refute");

  // -------------------------------------------------------------
  // Test 4: Insufficient Evidence -> Claim Verdict UNVERIFIED
  // -------------------------------------------------------------
  console.log("\nTEST 4: Insufficient evidence -> Claim Verdict UNVERIFIED");
  const claim4: AtomicClaim = {
    id: "C4",
    text: "Extraterrestrial microbial life was confirmed in Europa subterranean oceans.",
    category: "event",
    checkability: "medium",
    entities: ["Europa", "alien life"],
  };
  const insufficientEvidence: EvidenceItem[] = [
    {
      id: "ev_6",
      claimId: "C4",
      title: "Europa Clipper Mission Goals",
      url: "https://jpl.nasa.gov/missions/europa-clipper",
      domain: "jpl.nasa.gov",
      snippet: "Europa Clipper will investigate whether the icy moon has conditions suitable for life, but has not found life.",
      stance: "INSUFFICIENT",
      retrievedAt: new Date().toISOString(),
    },
  ];

  const result4 = service.verifyClaim(claim4, insufficientEvidence);
  assert(result4.verdict === "UNVERIFIED", "Claim 4 verdict is UNVERIFIED");
  assert(result4.confidence === "LOW", "Claim 4 confidence is LOW");

  // -------------------------------------------------------------
  // Test 5: Empty Evidence Bundle -> UNVERIFIED
  // -------------------------------------------------------------
  console.log("\nTEST 5: Empty evidence bundle -> UNVERIFIED");
  const result5 = service.verifyClaim(claim4, []);
  assert(result5.verdict === "UNVERIFIED", "Empty sources returns UNVERIFIED");
  assert(result5.evidenceCount === 0, "Evidence count is 0");

  // -------------------------------------------------------------
  // Test 6: Overall Verdict Aggregation - All TRUE -> VERIFIED
  // -------------------------------------------------------------
  console.log("\nTEST 6: Overall Aggregation - All TRUE -> VERIFIED");
  const allTrueVerifications: ClaimVerification[] = [
    {
      claimId: "C1",
      claimText: "Assertion 1",
      verdict: "TRUE",
      confidence: "HIGH",
      reasoning: "Corroborated by sources.",
      supportingEvidenceIds: ["ev_1", "ev_2"],
      contradictingEvidenceIds: [],
      evidenceCount: 2,
    },
    {
      claimId: "C2",
      claimText: "Assertion 2",
      verdict: "TRUE",
      confidence: "HIGH",
      reasoning: "Corroborated by source.",
      supportingEvidenceIds: ["ev_3"],
      contradictingEvidenceIds: [],
      evidenceCount: 1,
    },
  ];
  const overall1 = service.aggregateOverallVerdict(allTrueVerifications);
  assert(overall1.verdict === "VERIFIED", "All true yields overall VERIFIED");
  assert(overall1.breakdown.verifiedTrue === 2, "Verified true count is 2");

  // -------------------------------------------------------------
  // Test 7: Overall Verdict Aggregation - False claims -> FALSE
  // -------------------------------------------------------------
  console.log("\nTEST 7: Overall Aggregation - All FALSE -> FALSE");
  const allFalseVerifications: ClaimVerification[] = [
    {
      claimId: "C1",
      claimText: "False Assertion 1",
      verdict: "FALSE",
      confidence: "HIGH",
      reasoning: "Refuted by sources.",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ["ev_1"],
      evidenceCount: 1,
    },
  ];
  const overall2 = service.aggregateOverallVerdict(allFalseVerifications);
  assert(overall2.verdict === "FALSE", "All false yields overall FALSE");

  // -------------------------------------------------------------
  // Test 8: Overall Verdict Aggregation - Mixed claims -> MIXED
  // -------------------------------------------------------------
  console.log("\nTEST 8: Overall Aggregation - TRUE + FALSE -> MIXED");
  const mixedVerifications: ClaimVerification[] = [
    ...allTrueVerifications,
    ...allFalseVerifications,
  ];
  const overall3 = service.aggregateOverallVerdict(mixedVerifications);
  assert(overall3.verdict === "MIXED", "TRUE + FALSE yields overall MIXED");
  assert(overall3.breakdown.verifiedTrue === 2 && overall3.breakdown.refutedFalse === 1, "Breakdown accurately tallies counts");

  // -------------------------------------------------------------
  // Test 9: Overall Verdict Aggregation - All UNVERIFIED -> UNVERIFIED
  // -------------------------------------------------------------
  console.log("\nTEST 9: Overall Aggregation - All UNVERIFIED -> UNVERIFIED");
  const unverifiedList: ClaimVerification[] = [
    {
      claimId: "C1",
      claimText: "Unproven claim",
      verdict: "UNVERIFIED",
      confidence: "LOW",
      reasoning: "No citations found.",
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      evidenceCount: 0,
    },
  ];
  const overall4 = service.aggregateOverallVerdict(unverifiedList);
  assert(overall4.verdict === "UNVERIFIED", "All unverified yields overall UNVERIFIED");

  // -------------------------------------------------------------
  // Test 10: Evidence-to-Claim Linkage Integrity
  // -------------------------------------------------------------
  console.log("\nTEST 10: Evidence-to-claim linkage integrity");
  const testBundle: ClaimEvidenceBundle = {
    claimId: "C1",
    claimText: "Test assertion",
    query: "Test query",
    sources: [
      {
        id: "ev_link_1",
        claimId: "C1",
        title: "Test Domain",
        url: "https://example.com/test",
        domain: "example.com",
        snippet: "Test snippet",
        stance: "SUPPORTS",
        retrievedAt: new Date().toISOString(),
      },
    ],
  };
  assert(testBundle.sources.every((s) => s.claimId === testBundle.claimId), "Every evidence source matches bundle claimId");

  // -------------------------------------------------------------
  // Test 11: Resilience to Empty Claim Pipeline
  // -------------------------------------------------------------
  console.log("\nTEST 11: Resilience to empty claims array");
  const emptyRes = await service.executeVerificationPipeline([], []);
  assert(emptyRes.overallVerdict === "UNVERIFIED", "Empty pipeline returns UNVERIFIED overall");
  assert(emptyRes.claimVerifications.length === 0, "Claim verifications array is empty");

  // -------------------------------------------------------------
  // Test 12: Live Gemini Stance Reasoning (if GEMINI_API_KEY present)
  // -------------------------------------------------------------
  console.log("\nTEST 12: Live Gemini Stance Reasoning");
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    try {
      const liveClaims: AtomicClaim[] = [
        {
          id: "C1",
          text: "Apollo 11 landed on the Moon in July 1969.",
          category: "event",
          checkability: "high",
          entities: ["Apollo 11", "Moon landing", "1969"],
        },
      ];
      const liveBundles: ClaimEvidenceBundle[] = [
        {
          claimId: "C1",
          claimText: "Apollo 11 landed on the Moon in July 1969.",
          query: "Apollo 11 moon landing July 1969",
          sources: [
            {
              id: "ev_live_1",
              claimId: "C1",
              title: "NASA Apollo 11 Mission Overview",
              url: "https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html",
              domain: "nasa.gov",
              snippet: "On July 20, 1969, American astronauts Neil Armstrong and Buzz Aldrin landed the Apollo Lunar Module Eagle on the Moon.",
              stance: "UNCERTAIN",
              retrievedAt: new Date().toISOString(),
            },
          ],
        },
      ];

      const liveResult = await service.executeVerificationPipeline(liveClaims, liveBundles);
      assert(
        liveResult.claimVerifications.length === 1,
        "Live pipeline processed 1 claim"
      );
      assert(
        liveResult.claimVerifications[0].verdict === "TRUE",
        `Live Apollo 11 claim verified as TRUE (received: ${liveResult.claimVerifications[0].verdict})`
      );
      assert(
        liveResult.overallVerdict === "VERIFIED",
        `Live overall verdict is VERIFIED (received: ${liveResult.overallVerdict})`
      );
      assert(
        liveBundles[0].sources[0].stance === "SUPPORTS",
        `Live evidence item classified as SUPPORTS (received: ${liveBundles[0].sources[0].stance})`
      );
    } catch (liveErr) {
      console.warn("Live Gemini verification test failed:", liveErr);
      assert(false, "Live Gemini stance reasoning executed successfully", String(liveErr));
    }
  } else {
    console.log("  [SKIPPED] GEMINI_API_KEY not present; skipping live API call.");
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`  PHASE 5 TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase5Tests().catch((err) => {
  console.error("Unhandled error in Phase 5 verification test suite:", err);
  process.exit(1);
});
