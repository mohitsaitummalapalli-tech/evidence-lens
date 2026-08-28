/**
 * EvidenceLens - Phase 4 Comprehensive Automated Test Suite
 * Tests A through G covering real web evidence retrieval, error handling, stance grounding, and claim associations.
 */

import { evidenceRetrievalService } from "../lib/evidence/retrieval";
import { TavilySearchClient } from "../lib/evidence/tavily";
import { AtomicClaim } from "../types";

async function runTests() {
  console.log("===============================================================");
  console.log("  EVIDENCELENS — PHASE 4 AUTOMATED TEST SUITE (TESTS A - G)   ");
  console.log("===============================================================\n");

  let passedCount = 0;
  const totalCount = 7;

  // Test A: Simple factual claim
  console.log("---------------------------------------------------------------");
  console.log("Test A: Simple Factual Claim Web Evidence Retrieval");
  try {
    const claimA: AtomicClaim = {
      id: "C1",
      text: "The James Webb Space Telescope was launched on December 25, 2021.",
      category: "event",
      checkability: "high",
      entities: ["James Webb Space Telescope"],
      timeReference: "December 25, 2021",
    };

    const resultA = await evidenceRetrievalService.retrieveEvidenceForClaims([claimA]);
    console.log(`- Retrieved sources: ${resultA.totalSourcesFound}`);
    console.log(`- Bundles count: ${resultA.bundles.length}`);
    if (resultA.allSources.length > 0) {
      console.log(`- Sample Source 1: "${resultA.allSources[0].title}" (${resultA.allSources[0].domain})`);
      console.log(`- Stance: ${resultA.allSources[0].stance}`);
      console.log(`- Stance explanation: ${resultA.allSources[0].stanceExplanation || "N/A"}`);
    }

    if (resultA.totalSourcesFound > 0 && resultA.allSources[0].claimId === "C1") {
      console.log("✅ Test A PASSED: Successfully retrieved and grounded evidence for simple factual claim.\n");
      passedCount++;
    } else {
      console.error("❌ Test A FAILED: No sources found or incorrect claimId linkage.\n");
    }
  } catch (err) {
    console.error("❌ Test A EXCEPTION:", err);
  }

  // Test B: Compound claim containing at least 3 atomic claims
  console.log("---------------------------------------------------------------");
  console.log("Test B: Compound Claim (>= 3 Atomic Claims)");
  try {
    const claimsB: AtomicClaim[] = [
      {
        id: "C1",
        text: "Apollo 11 landed humans on the Moon in July 1969.",
        category: "event",
        checkability: "high",
        entities: ["Apollo 11", "Moon"],
        timeReference: "July 1969",
      },
      {
        id: "C2",
        text: "Neil Armstrong was the commander of Apollo 11.",
        category: "identity",
        checkability: "high",
        entities: ["Neil Armstrong", "Apollo 11"],
      },
      {
        id: "C3",
        text: "The Apollo 11 crew returned safely to Earth splashing down in the Pacific Ocean.",
        category: "location",
        checkability: "high",
        entities: ["Apollo 11", "Pacific Ocean", "Earth"],
      },
    ];

    const resultB = await evidenceRetrievalService.retrieveEvidenceForClaims(claimsB);
    console.log(`- Total sources across 3 claims: ${resultB.totalSourcesFound}`);
    console.log(`- Bundles retrieved: ${resultB.bundles.length}`);

    const c1Sources = resultB.allSources.filter((s) => s.claimId === "C1");
    const c2Sources = resultB.allSources.filter((s) => s.claimId === "C2");
    const c3Sources = resultB.allSources.filter((s) => s.claimId === "C3");

    console.log(`  * C1 sources: ${c1Sources.length}`);
    console.log(`  * C2 sources: ${c2Sources.length}`);
    console.log(`  * C3 sources: ${c3Sources.length}`);

    if (
      resultB.bundles.length === 3 &&
      c1Sources.length > 0 &&
      c2Sources.length > 0 &&
      c3Sources.length > 0
    ) {
      console.log("✅ Test B PASSED: Multi-claim retrieval successfully fetched evidence for all 3 atomic claims.\n");
      passedCount++;
    } else {
      console.error("❌ Test B FAILED: Incomplete multi-claim evidence bundling.\n");
    }
  } catch (err) {
    console.error("❌ Test B EXCEPTION:", err);
  }

  // Test C: Claim with poor / no search results
  console.log("---------------------------------------------------------------");
  console.log("Test C: Claim with Poor / No Search Results");
  try {
    const claimC: AtomicClaim = {
      id: "C1",
      text: "Xj99kzz9824q19842a bizarre nonexistent entity 999901029xyz",
      category: "other",
      checkability: "low",
      entities: ["Xj99kzz9824q19842a"],
    };

    const resultC = await evidenceRetrievalService.retrieveEvidenceForClaims([claimC]);
    console.log(`- Retrieved sources for obscure claim: ${resultC.totalSourcesFound}`);
    console.log(`- Handled without crashing: true`);

    // Must return an EvidenceRetrievalResult structure without throwing
    if (resultC && Array.isArray(resultC.bundles) && Array.isArray(resultC.allSources)) {
      console.log("✅ Test C PASSED: Gracefully handled zero/sparse search results without application failure.\n");
      passedCount++;
    } else {
      console.error("❌ Test C FAILED: Malformed result structure for sparse search.\n");
    }
  } catch (err) {
    console.error("❌ Test C EXCEPTION:", err);
  }

  // Test D: Simulated search API failure
  console.log("---------------------------------------------------------------");
  console.log("Test D: Simulated Search API Failure Handling");
  try {
    const brokenClient = new TavilySearchClient();
    // Intentionally point to invalid endpoint or simulate network failure
    (brokenClient as unknown as { endpoint: string }).endpoint = "https://invalid-nonexistent-domain-12345.xyz/search";

    let failedGracefully = false;
    try {
      await brokenClient.search("test query");
    } catch (err) {
      failedGracefully = err instanceof Error && err.message.length > 0;
      console.log(`- Caught expected controlled error: "${err instanceof Error ? err.message : String(err)}"`);
    }

    if (failedGracefully) {
      console.log("✅ Test D PASSED: Network/API failures are intercepted and throw clean descriptive errors.\n");
      passedCount++;
    } else {
      console.error("❌ Test D FAILED: API failure was not caught cleanly.\n");
    }
  } catch (err) {
    console.error("❌ Test D EXCEPTION:", err);
  }

  // Test E: Missing TAVILY_API_KEY
  console.log("---------------------------------------------------------------");
  console.log("Test E: Missing TAVILY_API_KEY Handling");
  try {
    const originalKey = process.env.TAVILY_API_KEY;
    delete process.env.TAVILY_API_KEY;

    let missingKeyCaught = false;
    const testClient = new TavilySearchClient();
    try {
      await testClient.search("test query");
    } catch (err) {
      missingKeyCaught = err instanceof Error && err.message.includes("TAVILY_API_KEY is not configured");
      console.log(`- Caught expected missing key message: "${err instanceof Error ? err.message : String(err)}"`);
    } finally {
      // Restore key
      if (originalKey) {
        process.env.TAVILY_API_KEY = originalKey;
      }
    }

    if (missingKeyCaught) {
      console.log("✅ Test E PASSED: Missing TAVILY_API_KEY produces clear actionable guidance without leaking secrets.\n");
      passedCount++;
    } else {
      console.error("❌ Test E FAILED: Missing key was not detected or threw unexpected message.\n");
    }
  } catch (err) {
    console.error("❌ Test E EXCEPTION:", err);
  }

  // Test F: Duplicate source URLs
  console.log("---------------------------------------------------------------");
  console.log("Test F: URL Deduplication");
  try {
    const mockClaim: AtomicClaim = {
      id: "C1",
      text: "Global climate summit took place in Paris.",
      category: "event",
      checkability: "high",
      entities: ["Paris Climate Agreement"],
    };

    // Test the retrieval logic's URL deduplication mechanism
    const resultF = await evidenceRetrievalService.retrieveEvidenceForClaims([mockClaim]);
    const urls = resultF.bundles.flatMap((b) => b.sources.map((s) => s.url.toLowerCase()));
    const uniqueUrls = new Set(urls);

    console.log(`- Total URLs in bundle: ${urls.length}`);
    console.log(`- Unique URLs: ${uniqueUrls.size}`);

    if (urls.length === uniqueUrls.size) {
      console.log("✅ Test F PASSED: Duplicate source URLs were deduplicated successfully within claim bundles.\n");
      passedCount++;
    } else {
      console.error("❌ Test F FAILED: Found duplicate URLs in claim bundle.\n");
    }
  } catch (err) {
    console.error("❌ Test F EXCEPTION:", err);
  }

  // Test G: Verify each result is associated with correct claimId
  console.log("---------------------------------------------------------------");
  console.log("Test G: Strict claimId Linkage Verification");
  try {
    const claimsG: AtomicClaim[] = [
      {
        id: "C1",
        text: "The Eiffel Tower is in Paris, France.",
        category: "location",
        checkability: "high",
        entities: ["Eiffel Tower", "Paris", "France"],
      },
      {
        id: "C2",
        text: "Mount Everest is the highest mountain above sea level.",
        category: "other",
        checkability: "high",
        entities: ["Mount Everest"],
      },
    ];

    const resultG = await evidenceRetrievalService.retrieveEvidenceForClaims(claimsG);
    let allLinkedCorrectly = true;

    for (const bundle of resultG.bundles) {
      for (const src of bundle.sources) {
        if (src.claimId !== bundle.claimId) {
          allLinkedCorrectly = false;
          console.error(`- Mismatch: Source ${src.id} has claimId ${src.claimId} but bundle is ${bundle.claimId}`);
        }
      }
    }

    if (allLinkedCorrectly && resultG.bundles.length === 2) {
      console.log(`- Verified ${resultG.allSources.length} evidence sources across 2 distinct claims.`);
      console.log("✅ Test G PASSED: Every evidence item is strictly associated with its matching claimId.\n");
      passedCount++;
    } else {
      console.error("❌ Test G FAILED: Claim ID linkage mismatch detected.\n");
    }
  } catch (err) {
    console.error("❌ Test G EXCEPTION:", err);
  }

  // Summary
  console.log("===============================================================");
  console.log(`  TEST RESULTS: ${passedCount} / ${totalCount} TESTS PASSED  `);
  console.log("===============================================================");

  if (passedCount === totalCount) {
    console.log("🎉 All Phase 4 automated tests passed successfully!\n");
  } else {
    console.error(`⚠️ ${totalCount - passedCount} test(s) failed.\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test suite failure:", err);
  process.exit(1);
});
