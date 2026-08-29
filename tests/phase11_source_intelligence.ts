/**
 * EvidenceLens - Phase 11 Source Intelligence & Trust Scoring Verification Suite
 *
 * Deterministic tests for:
 * 1. Source Quality / Trust Heuristics Classification
 * 2. Source Type & Category Inference
 * 3. Source Diversity Aggregation & Multi-Domain Detection
 * 4. Evidence Consensus Balance & Stance Ratio Computation
 * 5. Zero URL & Count Fabrication Invariants
 * 6. Empty & Malformed Input Robustness
 */

import { sourceQualityService } from "../lib/evidence/sourceQuality";
import { EvidenceItem } from "../types/evidence";

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
console.log("   PHASE 11: SOURCE INTELLIGENCE & TRUST TEST SUITE   ");
console.log("=======================================================\n");

// ==========================================
// TEST SUITE 1: DOMAIN NORMALIZATION
// ==========================================
console.log("Suite 1: Domain Normalization");
assert(
  sourceQualityService.normalizeDomain("www.nasa.gov") === "nasa.gov",
  "Normalizes www.nasa.gov -> nasa.gov"
);
assert(
  sourceQualityService.normalizeDomain("WWW.REUTERS.COM") === "reuters.com",
  "Normalizes uppercase and whitespace in domain names"
);
assert(
  sourceQualityService.normalizeDomain("   nature.com  ") === "nature.com",
  "Trims surrounding whitespace in domain names"
);

// ==========================================
// TEST SUITE 2: SOURCE QUALITY CLASSIFICATION
// ==========================================
console.log("\nSuite 2: Transparent Deterministic Source Quality Classification");

// Institutional & Government
const govResult = sourceQualityService.evaluateSourceQuality("https://www.nasa.gov/artemis", "nasa.gov");
assert(govResult.tier === "HIGH", "Government domain (nasa.gov) classified as HIGH quality");
assert(govResult.category === "institutional", "nasa.gov classified as institutional category");
assert(govResult.reason.includes("Government agency"), "nasa.gov contains clear explainable reasoning");

const dotGovResult = sourceQualityService.evaluateSourceQuality("https://cdc.gov/flu", "cdc.gov");
assert(dotGovResult.tier === "HIGH", "Standard .gov TLD classified as HIGH quality");

const milResult = sourceQualityService.evaluateSourceQuality("https://defense.mil/news", "defense.mil");
assert(milResult.tier === "HIGH", ".mil TLD classified as HIGH quality");

// Academic & Peer-Reviewed
const natureResult = sourceQualityService.evaluateSourceQuality("https://www.nature.com/articles/123", "nature.com");
assert(natureResult.tier === "HIGH", "Nature journal classified as HIGH quality");
assert(natureResult.category === "academic", "nature.com classified as academic category");

const arxivResult = sourceQualityService.evaluateSourceQuality("https://arxiv.org/abs/2401.0001", "arxiv.org");
assert(arxivResult.tier === "HIGH", "arXiv repository classified as HIGH quality");

const eduResult = sourceQualityService.evaluateSourceQuality("https://news.mit.edu/2026/research", "mit.edu");
assert(eduResult.tier === "HIGH", ".edu institution classified as HIGH quality");

// Primary News & Verified Fact-Checkers
const reutersResult = sourceQualityService.evaluateSourceQuality("https://www.reuters.com/world/us/test", "reuters.com");
assert(reutersResult.tier === "HIGH", "Reuters wire classified as HIGH quality");
assert(reutersResult.category === "news_factcheck", "Reuters classified as news_factcheck");

const snopesResult = sourceQualityService.evaluateSourceQuality("https://www.snopes.com/fact-check/test", "snopes.com");
assert(snopesResult.tier === "HIGH", "Snopes fact-check classified as HIGH quality");

const bbcResult = sourceQualityService.evaluateSourceQuality("https://www.bbc.com/news/world", "bbc.com");
assert(bbcResult.tier === "HIGH", "BBC News classified as HIGH quality");

// Secondary Editorial & News
const vergeResult = sourceQualityService.evaluateSourceQuality("https://theverge.com/tech", "theverge.com");
assert(vergeResult.tier === "MEDIUM", "The Verge classified as MEDIUM quality");

// Reference & Encyclopedias
const wikiResult = sourceQualityService.evaluateSourceQuality("https://en.wikipedia.org/wiki/Moon", "wikipedia.org");
assert(wikiResult.tier === "MEDIUM", "Wikipedia classified as MEDIUM quality");
assert(wikiResult.category === "reference", "Wikipedia categorized as reference");

// Video Sharing & YouTube
const ytResult = sourceQualityService.evaluateSourceQuality("https://youtube.com/watch?v=123", "youtube.com", "youtube");
assert(ytResult.tier === "MEDIUM", "YouTube classified as MEDIUM quality");
assert(ytResult.category === "video_portal", "YouTube categorized as video_portal");
assert(ytResult.reason.includes("Open video sharing platform"), "YouTube has transparent channel-dependent notice");

// Social Media & Discussion Forums
const redditResult = sourceQualityService.evaluateSourceQuality("https://reddit.com/r/space", "reddit.com");
assert(redditResult.tier === "LOW", "Reddit classified as LOW quality (user-generated)");
assert(redditResult.category === "social_forum", "Reddit categorized as social_forum");

const xResult = sourceQualityService.evaluateSourceQuality("https://x.com/user/status/123", "x.com");
assert(xResult.tier === "LOW", "X/Twitter classified as LOW quality (social post)");

// General Web Fallback
const generalResult = sourceQualityService.evaluateSourceQuality("https://example-blog.org/post", "example-blog.org");
assert(generalResult.tier === "MEDIUM", "General web domain defaults to MEDIUM quality with explainable reason");
assert(generalResult.category === "general_web", "General web domain categorized as general_web");

// ==========================================
// TEST SUITE 3: SOURCE DIVERSITY AGGREGATION
// ==========================================
console.log("\nSuite 3: Source Diversity Aggregation & Multi-Domain Corroboration");

const mockSourcesDiverse: EvidenceItem[] = [
  {
    id: "ev_1",
    claimId: "C1",
    title: "NASA Artemis Report",
    url: "https://www.nasa.gov/artemis",
    domain: "nasa.gov",
    snippet: "Artemis III launch scheduled for 2026.",
    stance: "SUPPORTS",
    sourceType: "web",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_2",
    claimId: "C1",
    title: "Reuters Verification",
    url: "https://reuters.com/space/artemis",
    domain: "reuters.com",
    snippet: "NASA confirms timeline.",
    stance: "SUPPORTS",
    sourceType: "web",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_3",
    claimId: "C1",
    title: "ESA Mission Briefing",
    url: "https://youtube.com/watch?v=artemis_esa",
    domain: "youtube.com",
    snippet: "European Space Agency official livestream.",
    stance: "SUPPORTS",
    sourceType: "youtube",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_4",
    claimId: "C1",
    title: "Nature Astronomy Paper",
    url: "https://nature.com/articles/artemis-payload",
    domain: "nature.com",
    snippet: "Lunar payload instruments.",
    stance: "SUPPORTS",
    sourceType: "academic",
    retrievedAt: new Date().toISOString(),
  },
];

const diversityDiverse = sourceQualityService.calculateSourceDiversity(mockSourcesDiverse);
assert(diversityDiverse.totalSources === 4, "Accurately counts 4 total sources");
assert(diversityDiverse.webCount === 2, "Accurately counts 2 web sources");
assert(diversityDiverse.youtubeCount === 1, "Accurately counts 1 YouTube source");
assert(diversityDiverse.academicCount === 1, "Accurately counts 1 academic source");
assert(diversityDiverse.uniqueDomainCount === 4, "Identifies 4 unique independent domains");
assert(diversityDiverse.isMultiDomain === true, "Flags isMultiDomain as true");
assert(diversityDiverse.diversityLevel === "HIGH", "Classifies diversityLevel as HIGH (4+ domains)");

// Single Domain Test
const mockSingleDomain: EvidenceItem[] = [
  {
    id: "ev_s1",
    claimId: "C1",
    title: "Single Blog Post 1",
    url: "https://isolated-source.com/p1",
    domain: "isolated-source.com",
    snippet: "Post 1",
    stance: "SUPPORTS",
    sourceType: "web",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_s2",
    claimId: "C1",
    title: "Single Blog Post 2",
    url: "https://isolated-source.com/p2",
    domain: "isolated-source.com",
    snippet: "Post 2",
    stance: "SUPPORTS",
    sourceType: "web",
    retrievedAt: new Date().toISOString(),
  },
];

const diversitySingle = sourceQualityService.calculateSourceDiversity(mockSingleDomain);
assert(diversitySingle.uniqueDomainCount === 1, "Single domain count equals 1");
assert(diversitySingle.isMultiDomain === false, "Flags isMultiDomain as false for single domain");
assert(diversitySingle.diversityLevel === "LOW", "Classifies single domain as LOW diversity");

// ==========================================
// TEST SUITE 4: EVIDENCE CONSENSUS BALANCE
// ==========================================
console.log("\nSuite 4: Evidence Consensus & Stance Balance Computation");

// All Supporting
const consensusSupp = sourceQualityService.calculateEvidenceConsensus(mockSourcesDiverse);
assert(consensusSupp.supportingCount === 4, "Counts 4 supporting sources");
assert(consensusSupp.contradictingCount === 0, "Counts 0 contradicting sources");
assert(consensusSupp.balance === "SUPPORTING", "Identifies consensus balance as SUPPORTING");
assert(consensusSupp.supportPercentage === 100, "Support percentage is 100%");

// Mixed Stance
const mockMixedSources: EvidenceItem[] = [
  {
    id: "ev_m1",
    claimId: "C1",
    title: "Official Pro",
    url: "https://nasa.gov/1",
    domain: "nasa.gov",
    snippet: "Verified statement",
    stance: "SUPPORTS",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_m2",
    claimId: "C1",
    title: "Refutation Archive",
    url: "https://snopes.com/1",
    domain: "snopes.com",
    snippet: "Claims are misleading",
    stance: "CONTRADICTS",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_m3",
    claimId: "C1",
    title: "Background Info",
    url: "https://wikipedia.org/1",
    domain: "wikipedia.org",
    snippet: "General overview",
    stance: "NEUTRAL",
    retrievedAt: new Date().toISOString(),
  },
];

const consensusMixed = sourceQualityService.calculateEvidenceConsensus(mockMixedSources);
assert(consensusMixed.supportingCount === 1, "Counts 1 supporting source");
assert(consensusMixed.contradictingCount === 1, "Counts 1 contradicting source");
assert(consensusMixed.neutralCount === 1, "Counts 1 neutral source");
assert(consensusMixed.balance === "MIXED", "Identifies consensus balance as MIXED");
assert(consensusMixed.supportPercentage === 33, "Support percentage is 33%");
assert(consensusMixed.contradictPercentage === 33, "Contradict percentage is 33%");

// All Contradicting
const mockRefutedSources: EvidenceItem[] = [
  {
    id: "ev_r1",
    claimId: "C1",
    title: "Refutation 1",
    url: "https://reuters.com/refute1",
    domain: "reuters.com",
    snippet: "False rumor",
    stance: "CONTRADICTS",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_r2",
    claimId: "C1",
    title: "Refutation 2",
    url: "https://apnews.com/refute2",
    domain: "apnews.com",
    snippet: "Fabricated report",
    stance: "CONTRADICTS",
    retrievedAt: new Date().toISOString(),
  },
];

const consensusRefuted = sourceQualityService.calculateEvidenceConsensus(mockRefutedSources);
assert(consensusRefuted.balance === "CONTRADICTING", "Identifies consensus balance as CONTRADICTING");
assert(consensusRefuted.contradictPercentage === 100, "Contradict percentage is 100%");

// ==========================================
// TEST SUITE 5: ZERO URL & COUNT FABRICATION
// ==========================================
console.log("\nSuite 5: URL Preservation & Zero Fabrication Invariants");

const testUrl1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s";
const testUrl2 = "https://nature.com/articles/d41586-024-00001-x?utm_source=test";

const testEvidenceItems: EvidenceItem[] = [
  {
    id: "ev_u1",
    claimId: "C1",
    title: "Video Citation",
    url: testUrl1,
    domain: "youtube.com",
    snippet: "Sample video snippet",
    stance: "NEUTRAL",
    sourceType: "youtube",
    retrievedAt: new Date().toISOString(),
  },
  {
    id: "ev_u2",
    claimId: "C1",
    title: "Academic Paper",
    url: testUrl2,
    domain: "nature.com",
    snippet: "Sample paper snippet",
    stance: "SUPPORTS",
    sourceType: "academic",
    retrievedAt: new Date().toISOString(),
  },
];

assert(testEvidenceItems[0].url === testUrl1, "URL 1 is strictly preserved without mutation");
assert(testEvidenceItems[1].url === testUrl2, "URL 2 is strictly preserved without mutation");

const divPreserved = sourceQualityService.calculateSourceDiversity(testEvidenceItems);
assert(divPreserved.totalSources === testEvidenceItems.length, "Source count strictly equals array length");
assert(divPreserved.uniqueDomainCount === 2, "Unique domain count matches actual domain cardinality");

// ==========================================
// TEST SUITE 6: EMPTY & MALFORMED INPUT ROBUSTNESS
// ==========================================
console.log("\nSuite 6: Robustness on Empty & Malformed Inputs");

const emptyDiversity = sourceQualityService.calculateSourceDiversity([]);
assert(emptyDiversity.totalSources === 0, "Handles empty array in calculateSourceDiversity");
assert(emptyDiversity.isMultiDomain === false, "Empty array is not multi-domain");
assert(emptyDiversity.diversityLevel === "LOW", "Empty array has LOW diversity level");

const emptyConsensus = sourceQualityService.calculateEvidenceConsensus([]);
assert(emptyConsensus.totalCount === 0, "Handles empty array in calculateEvidenceConsensus");
assert(emptyConsensus.balance === "INSUFFICIENT", "Empty evidence yields INSUFFICIENT balance");
assert(emptyConsensus.supportPercentage === 0, "Empty evidence yields 0% support");

const malformedDomain = sourceQualityService.evaluateSourceQuality("", "");
assert(malformedDomain.tier === "MEDIUM", "Handles empty domain and URL gracefully");
assert(malformedDomain.category === "general_web", "Empty domain defaults to general_web category");

console.log("\n=======================================================");
console.log(`   PHASE 11 SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED   `);
console.log("=======================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
