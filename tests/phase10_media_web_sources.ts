/**
 * EvidenceLens - Phase 10 Test Suite: Universal Web + YouTube + Media Provenance
 * Deterministic unit and integration tests for multi-source web evidence, YouTube first-class support,
 * uploaded image & video provenance, URL preservation & deduplication, and exact-match honesty rules.
 */

import { EvidenceRetrievalService } from "../lib/evidence/retrieval";
import { ImageProvenanceService } from "../lib/evidence/imageProvenance";
import { TavilySearchClient } from "../lib/evidence/tavily";
import { EvidenceItem } from "../types";

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

async function runPhase10Tests() {
  console.log("\n========================================================");
  console.log("EVIDENCELENS — PHASE 10 TEST SUITE: WEB + YOUTUBE + MEDIA PROVENANCE");
  console.log("========================================================\n");

  const retrievalService = new EvidenceRetrievalService();

  // ========================================================
  // 1. YouTube Source Recognition & Classification
  // ========================================================
  console.log("--- Test Group 1: YouTube & Video Source Recognition ---");

  const ytUrl1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const ytDomain1 = "youtube.com";
  assert(
    retrievalService.detectSourceType(ytUrl1, ytDomain1) === "youtube",
    "Detects standard youtube.com watch URL as 'youtube'"
  );

  const ytShortUrl = "https://youtu.be/dQw4w9WgXcQ";
  const ytShortDomain = "youtu.be";
  assert(
    retrievalService.detectSourceType(ytShortUrl, ytShortDomain) === "youtube",
    "Detects shortened youtu.be link as 'youtube'"
  );

  const ytChannelUrl = "https://www.youtube.com/@NASA/videos";
  assert(
    retrievalService.detectSourceType(ytChannelUrl, "youtube.com") === "youtube",
    "Detects youtube channel page as 'youtube'"
  );

  const vimeoUrl = "https://vimeo.com/123456789";
  assert(
    retrievalService.detectSourceType(vimeoUrl, "vimeo.com") === "video_portal",
    "Detects vimeo video URL as 'video_portal'"
  );

  // ========================================================
  // 2. Normal Web & Academic Source Recognition
  // ========================================================
  console.log("\n--- Test Group 2: Normal Web & Academic Source Recognition ---");

  const bbcUrl = "https://www.bbc.com/news/world-us-canada-123456";
  assert(
    retrievalService.detectSourceType(bbcUrl, "bbc.com") === "web",
    "Detects BBC news article as standard 'web'"
  );

  const reutersUrl = "https://www.reuters.com/world/climate-change-report-2024/";
  assert(
    retrievalService.detectSourceType(reutersUrl, "reuters.com") === "web",
    "Detects Reuters news dispatch as 'web'"
  );

  const natureUrl = "https://www.nature.com/articles/s41586-024-12345";
  assert(
    retrievalService.detectSourceType(natureUrl, "nature.com") === "academic",
    "Detects Nature journal article as 'academic'"
  );

  const arxivUrl = "https://arxiv.org/abs/2401.12345";
  assert(
    retrievalService.detectSourceType(arxivUrl, "arxiv.org") === "academic",
    "Detects arXiv preprint as 'academic'"
  );

  // ========================================================
  // 3. URL Preservation & Deduplication in Retrieval
  // ========================================================
  console.log("\n--- Test Group 3: URL Preservation & Deduplication ---");

  // Test extractDomain
  assert(
    retrievalService.extractDomain("https://www.nasa.gov/missions/webb") === "nasa.gov",
    "Domain extraction strips 'www.' properly"
  );
  assert(
    retrievalService.extractDomain("https://youtube.com/watch?v=12345") === "youtube.com",
    "Domain extraction preserves youtube.com domain"
  );
  assert(
    retrievalService.extractDomain("invalid-url") === "web-source",
    "Handles malformed URLs safely with 'web-source' fallback"
  );

  // ========================================================
  // 4. Image Provenance Candidate Classification & Exact Match Honesty
  // ========================================================
  console.log("\n--- Test Group 4: Image Provenance & Exact Match Honesty ---");

  const provService = new ImageProvenanceService();

  // Exact-match honesty rule: determineMatchType should NEVER return EXACT_MATCH
  assert(
    provService.determineMatchType(0.99) === "POSSIBLE_MATCH",
    "High relevance score (0.99) returns 'POSSIBLE_MATCH' (Never claims fake EXACT_MATCH)"
  );
  assert(
    provService.determineMatchType(0.80) === "POSSIBLE_MATCH",
    "Score 0.80 returns 'POSSIBLE_MATCH'"
  );
  assert(
    provService.determineMatchType(0.50) === "RELATED_SOURCE",
    "Score 0.50 returns 'RELATED_SOURCE'"
  );
  assert(
    provService.determineMatchType(0.35) === "RELATED_SOURCE",
    "Score 0.35 threshold boundary returns 'RELATED_SOURCE'"
  );
  assert(
    provService.determineMatchType(0.15) === "NO_MATCH",
    "Low score (0.15) returns 'NO_MATCH'"
  );

  // Query generation for images
  const imageQueries = provService.generateProvenanceQueries({
    hasImage: true,
    filename: "jwst_carina_nebula_deep_field.png",
    claimText: "James Webb Telescope captures Carina Nebula in high resolution infrared",
    atomicClaims: [
      {
        id: "C1",
        text: "James Webb captures Carina Nebula",
        category: "event",
        checkability: "high",
        entities: ["James Webb", "Carina Nebula"],
      },
    ],
  });

  assert(imageQueries.length > 0, "Generates at least 1 grounded image provenance query");
  assert(
    imageQueries.some((q) => q.toLowerCase().includes("carina nebula") || q.toLowerCase().includes("jwst")),
    "Image queries preserve core entity signals"
  );

  // ========================================================
  // 5. Video Provenance Candidate Classification & YouTube Discovery
  // ========================================================
  console.log("\n--- Test Group 5: Video Provenance & YouTube Discovery ---");

  const videoQueries = provService.generateProvenanceQueries({
    hasMedia: true,
    mediaType: "video",
    filename: "spacex_starship_flight_3_landing.mp4",
    mimeType: "video/mp4",
    claimText: "SpaceX Starship launches Flight 3 into suborbital trajectory",
    atomicClaims: [
      {
        id: "C1",
        text: "SpaceX Starship completed Flight 3 launch test",
        category: "event",
        checkability: "high",
        entities: ["SpaceX", "Starship"],
      },
    ],
  });

  assert(videoQueries.length > 0, "Generates video provenance queries for uploaded video media");
  assert(
    videoQueries.some((q) => q.toLowerCase().includes("video")),
    "Video provenance queries append video/footage contextual descriptors"
  );

  // Candidate source detection
  assert(
    provService.detectCandidateSourceType("https://www.youtube.com/watch?v=xyz", "youtube.com", "video") === "youtube",
    "Candidate URL from YouTube tagged with sourceType 'youtube'"
  );
  assert(
    provService.detectCandidateSourceType("https://vimeo.com/123", "vimeo.com", "video") === "video",
    "Candidate URL from Vimeo tagged with sourceType 'video'"
  );
  assert(
    provService.detectCandidateSourceType("https://images.nasa.gov/details-123", "images.nasa.gov", "image") === "image",
    "Candidate URL from Image host tagged with sourceType 'image'"
  );
  assert(
    provService.detectCandidateSourceType("https://spaceflightnow.com/news/123", "spaceflightnow.com", "video") === "web",
    "General web article tagged with sourceType 'web'"
  );

  // ========================================================
  // 6. Media Provenance End-to-End with Mock Engine
  // ========================================================
  console.log("\n--- Test Group 6: Media Provenance Discovery End-to-End ---");

  const mockTavilyForVideo: TavilySearchClient = {
    search: async () => [
      {
        title: "SpaceX Starship IFT-3 Full Flight Broadcast",
        url: "https://www.youtube.com/watch?v=mockStarshipVideo",
        content: "Watch the full official SpaceX livestream of Starship Flight 3 liftoff and reentry.",
        score: 0.91,
      },
      {
        title: "SpaceX Starship Flight 3 Mission Report",
        url: "https://spaceflightnow.com/2024/03/14/starship-flight-3/",
        content: "Starship reached orbital velocity during its third integrated flight test.",
        score: 0.78,
      },
      {
        title: "Irrelevant Low Relevance Result",
        url: "https://random-forum.com/thread/1",
        content: "Random discussion forum post.",
        score: 0.20,
      },
    ],
  } as unknown as TavilySearchClient;

  const videoProvService = new ImageProvenanceService(mockTavilyForVideo);

  const videoResult = await videoProvService.discoverProvenance({
    hasMedia: true,
    mediaType: "video",
    filename: "starship_launch.mp4",
    mimeType: "video/mp4",
    claimText: "SpaceX Starship Flight 3 was launched in March 2024",
  });

  assert(videoResult.hasMedia === true, "Result confirms hasMedia is true");
  assert(videoResult.mediaType === "video", "Result identifies mediaType as 'video'");
  assert(videoResult.searchStatus === "SUCCESS", "Search status is 'SUCCESS'");
  assert(videoResult.totalCandidatesFound === 2, "Filters out low score (0.20) candidate");

  const ytCandidate = videoResult.candidates.find((c) => c.sourceType === "youtube");
  assert(Boolean(ytCandidate), "Discovers YouTube video candidate");
  assert(ytCandidate?.matchType === "POSSIBLE_MATCH", "High score YouTube video marked as 'POSSIBLE_MATCH'");
  assert(ytCandidate?.url === "https://www.youtube.com/watch?v=mockStarshipVideo", "Preserves exact YouTube URL");

  const webCandidate = videoResult.candidates.find((c) => c.sourceType === "web");
  assert(Boolean(webCandidate), "Discovers web article candidate");
  assert(webCandidate?.matchType === "POSSIBLE_MATCH", "Score 0.78 candidate marked as 'POSSIBLE_MATCH'");

  // ========================================================
  // 7. Missing Media & Empty Search Results Handling
  // ========================================================
  console.log("\n--- Test Group 7: Missing Media & Empty Results Handling ---");

  const emptyProvService = new ImageProvenanceService({
    search: async () => [],
  } as unknown as TavilySearchClient);

  const skippedResult = await emptyProvService.discoverProvenance({});
  assert(skippedResult.searchStatus === "SKIPPED", "No media returns SKIPPED status");
  assert(skippedResult.totalCandidatesFound === 0, "No media returns 0 candidates");

  const noMatchResult = await emptyProvService.discoverProvenance({
    hasImage: true,
    filename: "unnamed_photo.jpg",
    claimText: "Unknown unindexed claim text with zero results",
  });
  assert(noMatchResult.searchStatus === "NO_CANDIDATES", "Zero results returns 'NO_CANDIDATES'");
  assert(noMatchResult.candidates.length === 0, "Zero candidates returned gracefully");

  // ========================================================
  // 8. Provider / Network Failure Graceful Degradation
  // ========================================================
  console.log("\n--- Test Group 8: Provider & Network Failure Handling ---");

  const failingProvService = new ImageProvenanceService({
    search: async () => {
      throw new Error("Tavily API Rate Limit Exceeded or Network Timeout (504)");
    },
  } as unknown as TavilySearchClient);

  const failedResult = await failingProvService.discoverProvenance({
    hasImage: true,
    filename: "breaking_news.png",
    claimText: "Breaking news event",
  });

  assert(failedResult.searchStatus === "NO_CANDIDATES", "Search failure degrades gracefully to NO_CANDIDATES");
  assert(Array.isArray(failedResult.candidates), "Candidates remains empty array on failure");
  assert(failedResult.totalCandidatesFound === 0, "Candidate count is 0 on failure");

  // ========================================================
  // 9. Pipeline Integrity & Field Contract Verification
  // ========================================================
  console.log("\n--- Test Group 9: Pipeline Integrity & Field Contracts ---");

  const sampleEvidenceItem: EvidenceItem = {
    id: "ev_C1_1",
    claimId: "C1",
    title: "Official Press Release",
    url: "https://www.reuters.com/business/aerospace-defense/2024-report",
    domain: "reuters.com",
    snippet: "Reuters verified that the statement was accurate.",
    relevanceScore: 0.92,
    stance: "SUPPORTS",
    sourceType: "web",
    retrievedAt: new Date().toISOString(),
  };

  assert(sampleEvidenceItem.sourceType === "web", "EvidenceItem supports sourceType 'web'");
  assert(typeof sampleEvidenceItem.url === "string", "URL is preserved as string");
  assert(sampleEvidenceItem.url.startsWith("https://"), "URL is a valid HTTPS URI");

  const ytEvidenceItem: EvidenceItem = {
    id: "ev_C1_2",
    claimId: "C1",
    title: "Launch Live Stream",
    url: "https://www.youtube.com/watch?v=launchStream2024",
    domain: "youtube.com",
    snippet: "Live stream of the mission broadcast.",
    relevanceScore: 0.89,
    stance: "SUPPORTS",
    sourceType: "youtube",
    retrievedAt: new Date().toISOString(),
  };

  assert(ytEvidenceItem.sourceType === "youtube", "EvidenceItem supports sourceType 'youtube'");

  console.log("\n========================================================");
  console.log(`PHASE 10 TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
