/**
 * EvidenceLens - Phase 6B Verification Test Suite
 * Web Image Provenance Discovery Testing
 */

import { ImageProvenanceService } from "../lib/evidence/imageProvenance";
import { TavilySearchClient, TavilySearchResult } from "../lib/evidence/tavily";
import { AtomicClaim } from "../types";

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

// Mock Tavily Search Client for Deterministic Testing
class MockTavilyClient extends TavilySearchClient {
  public mockResults: TavilySearchResult[] = [];
  public shouldFail = false;
  public failStatus = 500;

  public override async search(query: string, maxResults = 5): Promise<TavilySearchResult[]> {
    if (this.shouldFail) {
      throw new Error(`Mock Tavily HTTP error with status ${this.failStatus}`);
    }
    return this.mockResults.slice(0, maxResults);
  }
}

async function runPhase6bTests() {
  console.log("\n=======================================================");
  console.log("  EVIDENCELENS - PHASE 6B IMAGE PROVENANCE TEST SUITE  ");
  console.log("=======================================================\n");

  const mockClient = new MockTavilyClient();
  const service = new ImageProvenanceService(mockClient);

  // TEST 1: Empty image input -> Skipped status
  console.log("TEST 1: Empty image input -> SKIPPED");
  const emptyRes = await service.discoverProvenance({});
  assert(emptyRes.hasImage === false, "hasImage is false for empty params");
  assert(emptyRes.searchStatus === "SKIPPED", "searchStatus is SKIPPED");
  assert(emptyRes.candidates.length === 0, "No candidates returned for empty input");
  assert(emptyRes.totalCandidatesFound === 0, "totalCandidatesFound is 0");

  // TEST 2: Missing provenance data (no descriptive queries)
  console.log("\nTEST 2: Missing provenance query data -> NO_CANDIDATES");
  const missingDataRes = await service.discoverProvenance({
    hasImage: true,
    filename: "",
    claimText: "",
    atomicClaims: [],
  });
  assert(missingDataRes.hasImage === true, "hasImage is true");
  assert(missingDataRes.searchStatus === "NO_CANDIDATES", "searchStatus is NO_CANDIDATES");
  assert(missingDataRes.candidates.length === 0, "Candidate list is empty");

  // TEST 3: Domain Extraction
  console.log("\nTEST 3: Domain Extraction");
  assert(
    service.extractDomain("https://www.nasa.gov/missions/artemis/index.html") === "nasa.gov",
    "Strips www prefix and extracts base domain"
  );
  assert(
    service.extractDomain("https://bbc.com/news/world-12345") === "bbc.com",
    "Extracts standard domain"
  );
  assert(
    service.extractDomain("not-a-valid-url") === "web-source",
    "Falls back to web-source for invalid URLs"
  );

  // TEST 4: Match Type Validation
  console.log("\nTEST 4: Match Type Validation");
  assert(service.determineMatchType(0.85) === "POSSIBLE_MATCH", "Score >= 0.75 maps to POSSIBLE_MATCH");
  assert(service.determineMatchType(0.75) === "POSSIBLE_MATCH", "Boundary score 0.75 maps to POSSIBLE_MATCH");
  assert(service.determineMatchType(0.60) === "RELATED_SOURCE", "Score 0.60 maps to RELATED_SOURCE");
  assert(service.determineMatchType(0.35) === "RELATED_SOURCE", "Boundary score 0.35 maps to RELATED_SOURCE");
  assert(service.determineMatchType(0.20) === "NO_MATCH", "Score < 0.35 maps to NO_MATCH");
  // Confirm EXACT_MATCH is NOT returned
  assert(
    (service.determineMatchType(1.0) as string) !== "EXACT_MATCH",
    "Score 1.0 does NOT emit EXACT_MATCH (honest provenance boundary)"
  );

  // TEST 5: Duplicate URL Removal
  console.log("\nTEST 5: Duplicate URL Removal");
  mockClient.mockResults = [
    {
      title: "Artemis 1 Launch - NASA",
      url: "https://www.nasa.gov/feature/artemis-1",
      content: "NASA launched the Artemis 1 uncrewed mission around the moon.",
      score: 0.92,
    },
    {
      title: "Artemis 1 Launch Duplicate",
      url: "https://www.nasa.gov/feature/artemis-1", // duplicate url
      content: "Duplicate content excerpt from NASA.",
      score: 0.90,
    },
    {
      title: "ESA Artemis Partner",
      url: "https://www.esa.int/Space_Safety/Artemis",
      content: "ESA contributed the service module for Artemis 1.",
      score: 0.82,
    },
  ];

  const dedupRes = await service.discoverProvenance({
    hasImage: true,
    filename: "artemis_orion_moon.png",
    claimText: "NASA Artemis 1 mission lunar orbit",
  });

  assert(dedupRes.candidates.length === 2, "Deduplicated results to 2 unique URLs (from 3 items)");
  assert(dedupRes.uniqueDomains.includes("nasa.gov"), "Unique domains records nasa.gov");
  assert(dedupRes.uniqueDomains.includes("esa.int"), "Unique domains records esa.int");
  assert(dedupRes.searchStatus === "SUCCESS", "searchStatus is SUCCESS");

  // TEST 6: Candidate Schema Validation
  console.log("\nTEST 6: Candidate Schema Validation");
  const firstCand = dedupRes.candidates[0];
  assert(Boolean(firstCand.id), "Candidate has id");
  assert(Boolean(firstCand.url), "Candidate has url");
  assert(Boolean(firstCand.title), "Candidate has title");
  assert(Boolean(firstCand.domain), "Candidate has domain");
  assert(Boolean(firstCand.snippet), "Candidate has snippet");
  assert(typeof firstCand.relevanceScore === "number", "relevanceScore is numeric");
  assert(
    firstCand.matchType === "POSSIBLE_MATCH" || firstCand.matchType === "RELATED_SOURCE",
    "matchType is valid schema enum"
  );
  assert(Boolean(firstCand.discoveredAt), "discoveredAt timestamp exists");

  // TEST 7: Query Generation from Atomic Claims & Filename
  console.log("\nTEST 7: Focused Query Generation");
  const testClaims: AtomicClaim[] = [
    {
      id: "C1",
      text: "James Webb Space Telescope deployed gold mirrors in space",
      category: "event",
      checkability: "high",
      entities: ["James Webb Space Telescope", "gold mirrors"],
    },
  ];

  const generatedQueries = service.generateProvenanceQueries({
    filename: "jwst_mirror_deployment_deepspace.jpg",
    claimText: "JWST deployed gold mirrors in space",
    atomicClaims: testClaims,
  });

  assert(generatedQueries.length >= 1, "Generated at least 1 focused query");
  assert(generatedQueries.length <= 3, "Bounded to at most 3 focused queries");
  assert(
    generatedQueries.some((q) => q.toLowerCase().includes("james webb") || q.toLowerCase().includes("jwst")),
    "Query contains extracted subject/entity"
  );

  // TEST 8: Tavily Search Client Error Gracefully Handled
  console.log("\nTEST 8: Search Failure Graceful Handling");
  mockClient.shouldFail = true;
  mockClient.failStatus = 500;

  const failRes = await service.discoverProvenance({
    hasImage: true,
    filename: "artemis_launch.png",
    claimText: "Artemis 1 moon mission",
  });

  assert(failRes.hasImage === true, "hasImage is true");
  assert(failRes.searchStatus === "NO_CANDIDATES", "searchStatus falls back gracefully to NO_CANDIDATES on error");
  assert(failRes.candidates.length === 0, "Candidates array is empty without crashing");

  // Reset mock
  mockClient.shouldFail = false;

  // TEST 9: No API Key Leakage
  console.log("\nTEST 9: No API Key Leakage");
  const jsonStr = JSON.stringify(dedupRes);
  assert(!jsonStr.includes("tvly-"), "JSON output does not contain Tavily API key prefix");
  assert(!jsonStr.includes("AIzaSy"), "JSON output does not contain Gemini API key prefix");

  // TEST 10: Live Provenance Discovery (if TAVILY_API_KEY is in environment)
  console.log("\nTEST 10: Live Tavily Image Provenance Discovery");
  if (process.env.TAVILY_API_KEY) {
    try {
      const liveService = new ImageProvenanceService();
      const liveRes = await liveService.discoverProvenance({
        hasImage: true,
        filename: "eiffel_tower_paris_france.jpg",
        claimText: "The Eiffel Tower landmark in Paris France",
        atomicClaims: [
          {
            id: "C1",
            text: "The Eiffel Tower is located in Paris France",
            category: "location",
            checkability: "high",
            entities: ["Eiffel Tower", "Paris France"],
          },
        ],
      });

      assert(liveRes.hasImage === true, "Live provenance hasImage is true");
      assert(liveRes.candidates.length > 0, `Live discovery returned ${liveRes.candidates.length} web candidates`);
      assert(liveRes.searchStatus === "SUCCESS", "Live discovery searchStatus is SUCCESS");
      assert(liveRes.uniqueDomains.length > 0, "Live discovery populated unique domains");
    } catch (err: unknown) {
      assert(false, "Live image provenance discovery completed without unhandled exception", String(err));
    }
  } else {
    console.log("  [SKIP] TAVILY_API_KEY not configured, skipping live API call");
  }

  console.log("\n=======================================================");
  console.log(`  PHASE 6B TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase6bTests().catch((err) => {
  console.error("Phase 6B test execution failed:", err);
  process.exit(1);
});
