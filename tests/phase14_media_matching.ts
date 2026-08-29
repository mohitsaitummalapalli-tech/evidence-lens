/**
 * EvidenceLens - Phase 14 Exact Multimodal Media Match Test Suite
 *
 * Deterministic tests for:
 * 1. Exact & Similarity Match Normalization
 * 2. URL Normalization & Domain Extraction
 * 3. Duplicate Candidate Deduplication
 * 4. Calibrated Confidence Bounds (0.0 to 1.0)
 * 5. Match Type Classification (EXACT, HIGH_SIMILARITY, RELATED, NONE)
 * 6. Zero Fabrication & No-Match Transparency
 * 7. YouTube vs Web Source Type Identification
 * 8. Malformed & Error Provider Resilience
 * 9. Integration Summary Aggregation
 * 10. Backward Compatibility with Investigation Responses
 */

import {
  DefaultMediaMatchProvider,
  matchMultimodalMedia,
  MediaMatchProvider,
  RawMediaCandidate,
} from "../lib/evidence/mediaMatcher";
import {
  InvestigationInputResponse,
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

async function runPhase14Tests() {
  console.log("\n=======================================================");
  console.log("   PHASE 14: MULTIMODAL MEDIA MATCHING TEST SUITE      ");
  console.log("=======================================================\n");

  const provider = new DefaultMediaMatchProvider();

  // -------------------------------------------------------------
  // Test Suite 1: Domain Extraction & URL Normalization
  // -------------------------------------------------------------
  console.log("Suite 1: Domain Extraction & URL Normalization");
  assert(
    provider.extractDomain("https://www.youtube.com/watch?v=dQw4w9WgXcQ") === "youtube.com",
    "Strips www. prefix and extracts youtube.com"
  );
  assert(
    provider.extractDomain("http://news.bbc.co.uk/world/article") === "news.bbc.co.uk",
    "Extracts multi-segment subdomain news.bbc.co.uk"
  );
  assert(
    provider.extractDomain("invalid-url-string") === "web-source",
    "Falls back to 'web-source' for malformed string"
  );
  assert(
    provider.extractDomain("") === "web-source",
    "Handles empty string gracefully"
  );

  // -------------------------------------------------------------
  // Test Suite 2: Match Type Classification Thresholds
  // -------------------------------------------------------------
  console.log("\nSuite 2: Match Type Classification Thresholds");
  assert(provider.classifyMatchType(0.99) === "EXACT", "0.99 maps to EXACT match");
  assert(provider.classifyMatchType(0.95) === "EXACT", "0.95 boundary maps to EXACT match");
  assert(provider.classifyMatchType(0.85) === "HIGH_SIMILARITY", "0.85 maps to HIGH_SIMILARITY");
  assert(provider.classifyMatchType(0.75) === "HIGH_SIMILARITY", "0.75 boundary maps to HIGH_SIMILARITY");
  assert(provider.classifyMatchType(0.50) === "RELATED", "0.50 maps to RELATED source");
  assert(provider.classifyMatchType(0.35) === "RELATED", "0.35 boundary maps to RELATED source");
  assert(provider.classifyMatchType(0.20) === "NONE", "0.20 maps to NONE (no match)");
  assert(provider.classifyMatchType(0.0) === "NONE", "0.0 maps to NONE (no match)");

  // -------------------------------------------------------------
  // Test Suite 3: Source Type Inference
  // -------------------------------------------------------------
  console.log("\nSuite 3: Source Type Inference");
  assert(
    provider.inferSourceType("https://www.youtube.com/watch?v=test", "youtube.com") === "youtube",
    "Identifies YouTube watch URL as 'youtube'"
  );
  assert(
    provider.inferSourceType("https://youtu.be/shortId", "youtu.be") === "youtube",
    "Identifies shortened youtu.be as 'youtube'"
  );
  assert(
    provider.inferSourceType("https://vimeo.com/123456", "vimeo.com") === "video",
    "Identifies Vimeo URL as 'video'"
  );
  assert(
    provider.inferSourceType("https://example.com/images/proof.jpg", "example.com") === "image",
    "Identifies direct JPG asset as 'image'"
  );
  assert(
    provider.inferSourceType("https://reuters.com/world/article", "reuters.com") === "web",
    "Identifies standard news article as 'web'"
  );

  // -------------------------------------------------------------
  // Test Suite 4: Raw Candidate Normalization & Deduplication
  // -------------------------------------------------------------
  console.log("\nSuite 4: Raw Candidate Normalization & Deduplication");
  const rawCandidates: RawMediaCandidate[] = [
    {
      id: "raw_1",
      url: "https://www.youtube.com/watch?v=launch123",
      title: "James Webb Telescope Launch Broadcast",
      score: 0.98,
      publishedDate: "2021-12-25",
    },
    {
      id: "raw_2",
      url: "https://www.youtube.com/watch?v=launch123", // Duplicate URL
      title: "Duplicate Launch Video",
      score: 0.98,
    },
    {
      id: "raw_3",
      url: "https://www.nasa.gov/webb/photos/launch.png",
      title: "NASA Official Launch Photo",
      score: 0.82,
      publishedDate: "2021-12-25",
    },
    {
      id: "raw_4",
      url: "https://example.com/space/news",
      title: "General Space News",
      score: 0.45,
    },
  ];

  const normalized = provider.normalizeResults(rawCandidates);
  assert(normalized.length === 3, "Deduplicated duplicate URL (3 items returned from 4)");
  assert(normalized[0].type === "EXACT", "First result is EXACT match");
  assert(normalized[0].sourceType === "youtube", "First result is youtube source type");
  assert(normalized[0].confidence === 0.98, "First result confidence is 0.98");
  assert(normalized[0].domain === "youtube.com", "First result domain is youtube.com");
  assert(normalized[0].matchFound === true, "First result has matchFound = true");
  assert(normalized[1].type === "HIGH_SIMILARITY", "Second result is HIGH_SIMILARITY");
  assert(normalized[2].type === "RELATED", "Third result is RELATED");
  assert(normalized[2].matchFound === false, "Related item has matchFound = false");

  // -------------------------------------------------------------
  // Test Suite 5: Confidence Bounding & Malformed Scores
  // -------------------------------------------------------------
  console.log("\nSuite 5: Confidence Bounding & Malformed Scores");
  const malformedCandidates: RawMediaCandidate[] = [
    {
      url: "https://example.com/over",
      title: "Score Over 1",
      score: 2.5,
    },
    {
      url: "https://example.com/under",
      title: "Score Under 0",
      score: -0.8,
    },
    {
      url: "https://example.com/nan",
      title: "Score NaN",
      score: NaN,
    },
  ];

  const bounded = provider.normalizeResults(malformedCandidates);
  assert(bounded[0].confidence <= 1.0, "Score > 1.0 is clamped to <= 1.0");
  assert(bounded[0].confidence === 1.0, "Score 2.5 clamped exactly to 1.0");
  const underItem = bounded.find((b) => b.title === "Score Under 0");
  assert(underItem?.confidence === 0.0, "Negative score clamped to 0.0");
  const nanItem = bounded.find((b) => b.title === "Score NaN");
  assert(nanItem?.confidence === 0.5, "NaN score defaults to safe fallback (0.5)");

  // -------------------------------------------------------------
  // Test Suite 6: Top-Level Multimodal Media Matching Orchestration
  // -------------------------------------------------------------
  console.log("\nSuite 6: Top-Level Multimodal Media Matching Orchestration");

  // Mock Provider for deterministic end-to-end testing
  const mockProvider: MediaMatchProvider = {
    async searchImage() {
      return [
        {
          id: "m_1",
          type: "EXACT",
          confidence: 0.96,
          title: "Identical ESA Ariane 5 Liftoff Photograph",
          url: "https://www.esa.int/space/ariane5.jpg",
          domain: "esa.int",
          sourceType: "image",
          publishedAt: "2021-12-25",
          explanation: "An identical media asset appears online on esa.int with 96% confidence.",
          matchFound: true,
        },
        {
          id: "m_2",
          type: "HIGH_SIMILARITY",
          confidence: 0.80,
          title: "NASA Telescope Launch Image",
          url: "https://www.nasa.gov/jwst/photo",
          domain: "nasa.gov",
          sourceType: "image",
          explanation: "Highly similar visual media found published by nasa.gov (80% confidence).",
          matchFound: true,
        },
      ];
    },
    async searchVideo() {
      return [
        {
          id: "v_1",
          type: "EXACT",
          confidence: 0.98,
          title: "NASA Official JWST Launch Broadcast",
          url: "https://www.youtube.com/watch?v=7nT7JGZMbtM",
          domain: "youtube.com",
          sourceType: "youtube",
          publishedAt: "2021-12-25",
          explanation: "Direct video footage match identified on YouTube (youtube.com) with 98% confidence.",
          matchFound: true,
        },
      ];
    },
    normalizeResults(raw: RawMediaCandidate[]) {
      return provider.normalizeResults(raw);
    },
  };

  // 6A. Image Match Execution
  const imageSummary = await matchMultimodalMedia(
    {
      hasMedia: true,
      mediaType: "image",
      filename: "jwst_launch_photo.png",
      claimText: "James Webb launched on Ariane 5",
    },
    mockProvider
  );

  assert(imageSummary.hasMedia === true, "imageSummary confirms hasMedia = true");
  assert(imageSummary.mediaType === "image", "imageSummary mediaType is image");
  assert(imageSummary.status === "MATCH_FOUND", "imageSummary status is MATCH_FOUND");
  assert(imageSummary.exactMatchCount === 1, "imageSummary exactMatchCount is 1");
  assert(imageSummary.similarMatchCount === 1, "imageSummary similarMatchCount is 1");
  assert(imageSummary.primaryMatch?.type === "EXACT", "imageSummary primaryMatch is EXACT");
  assert(imageSummary.primaryMatch?.domain === "esa.int", "imageSummary primaryMatch domain is esa.int");
  assert(
    Boolean(imageSummary.summaryText?.includes("esa.int")),
    "Summary text references top matching domain"
  );

  // 6B. Video Match Execution (YouTube)
  const videoSummary = await matchMultimodalMedia(
    {
      hasMedia: true,
      mediaType: "video",
      filename: "telescope_liftoff.mp4",
      claimText: "James Webb launch footage",
    },
    mockProvider
  );

  assert(videoSummary.mediaType === "video", "videoSummary mediaType is video");
  assert(videoSummary.status === "MATCH_FOUND", "videoSummary status is MATCH_FOUND");
  assert(videoSummary.primaryMatch?.sourceType === "youtube", "videoSummary primaryMatch is YouTube");
  assert(
    Boolean(videoSummary.summaryText?.includes("YouTube video match found")),
    "Summary text highlights YouTube video match"
  );

  // -------------------------------------------------------------
  // Test Suite 7: Zero-Fabrication & No Match Behavior
  // -------------------------------------------------------------
  console.log("\nSuite 7: Zero-Fabrication & No Match Behavior");

  const emptyMockProvider: MediaMatchProvider = {
    async searchImage() {
      return [];
    },
    async searchVideo() {
      return [];
    },
    normalizeResults() {
      return [];
    },
  };

  const noMatchSummary = await matchMultimodalMedia(
    {
      hasMedia: true,
      mediaType: "image",
      filename: "private_home_photo.jpg",
    },
    emptyMockProvider
  );

  assert(noMatchSummary.status === "NO_CANDIDATES", "Empty results yield NO_CANDIDATES status");
  assert(noMatchSummary.exactMatchCount === 0, "exactMatchCount is 0 for unindexed media");
  assert((noMatchSummary.allMatches?.length || 0) === 0, "No fabricated matches inserted");
  assert(noMatchSummary.primaryMatch === null, "primaryMatch is null when no match found");

  const skippedSummary = await matchMultimodalMedia(
    {
      hasMedia: false,
    },
    mockProvider
  );
  assert(skippedSummary.status === "SKIPPED", "Text-only requests return SKIPPED");
  assert(skippedSummary.hasMedia === false, "hasMedia is false for text-only request");

  // -------------------------------------------------------------
  // Test Suite 8: Backward Compatibility with Investigation Response
  // -------------------------------------------------------------
  console.log("\nSuite 8: Backward Compatibility with Investigation Response");

  const mockResponse: InvestigationInputResponse = {
    success: true,
    stage: "verified",
    sessionId: "inv_test_123",
    timestamp: "2026-08-29T08:00:00Z",
    message: "Verified assertion: VERIFIED",
    input: {
      claim: "NASA launched JWST on Ariane 5 rocket.",
      claimReceived: true,
      contextUrlReceived: false,
      mediaReceived: true,
      media: {
        type: "image",
        filename: "launch.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1048576,
      },
    },
    mediaMatch: imageSummary,
    nextStage: "Phase 14: Exact Multimodal Media Match",
  };

  assert(mockResponse.success === true, "Response retains success boolean");
  assert(Boolean(mockResponse.mediaMatch), "mediaMatch field exists in response payload");
  assert(mockResponse.mediaMatch?.status === "MATCH_FOUND", "mediaMatch status preserved in payload");
  assert(mockResponse.input.mediaReceived === true, "input mediaReceived preserved");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`   PHASE 14 SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED   `);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase14Tests().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
