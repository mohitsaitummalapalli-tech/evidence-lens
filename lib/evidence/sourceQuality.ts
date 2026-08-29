/**
 * EvidenceLens - Source Intelligence & Trust Scoring Service
 * Phase 11: Transparent, Deterministic Source Quality Heuristics,
 * Source Diversity Aggregation, and Evidence Consensus Balance.
 */

import {
  EvidenceItem,
  EvidenceSourceType,
  SourceQualityProfile,
  SourceDiversitySummary,
  EvidenceConsensusSummary,
} from "@/types";

// High-confidence Institutional & Government domains
const INSTITUTIONAL_DOMAINS = new Set([
  "nasa.gov",
  "esa.int",
  "who.int",
  "un.org",
  "nih.gov",
  "cdc.gov",
  "noaa.gov",
  "usgs.gov",
  "europa.eu",
  "state.gov",
  "whitehouse.gov",
  "fbi.gov",
  "defense.gov",
  "loc.gov",
  "archive.org",
]);

// Peer-reviewed & Academic publishers
const ACADEMIC_DOMAINS = new Set([
  "arxiv.org",
  "nature.com",
  "science.org",
  "ncbi.nlm.nih.gov",
  "sciencedirect.com",
  "springer.com",
  "cell.com",
  "ieee.org",
  "plos.org",
  "pnas.org",
  "thelancet.com",
  "nejm.org",
  "jstor.org",
  "biorxiv.org",
  "medrxiv.org",
  "oxfordacademic.com",
  "cambridge.org",
  "mit.edu",
  "harvard.edu",
  "stanford.edu",
]);

// Primary Global News & Recognized Fact-Checking agencies
const PRIMARY_NEWS_FACTCHECK_DOMAINS = new Set([
  "reuters.com",
  "apnews.com",
  "afp.com",
  "bbc.com",
  "bbc.co.uk",
  "snopes.com",
  "factcheck.org",
  "politifact.com",
  "fullfact.org",
  "nytimes.com",
  "washingtonpost.com",
  "wsj.com",
  "theguardian.com",
  "bloomberg.com",
  "ft.com",
  "dw.com",
  "france24.com",
  "npr.org",
  "pbs.org",
  "aljazeera.com",
]);

// Secondary News & Editorial portals
const SECONDARY_NEWS_DOMAINS = new Set([
  "cnn.com",
  "nbcnews.com",
  "cbsnews.com",
  "abcnews.go.com",
  "time.com",
  "forbes.com",
  "theverge.com",
  "wired.com",
  "arstechnica.com",
  "spaceflightnow.com",
  "space.com",
  "techcrunch.com",
]);

// Reference & Knowledge bases
const REFERENCE_DOMAINS = new Set([
  "wikipedia.org",
  "britannica.com",
  "wikidata.org",
  "worldbank.org",
  "imf.org",
  "wipo.int",
]);

// Social Media & User-Generated Forums
const SOCIAL_COMMUNITY_DOMAINS = new Set([
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "threads.net",
  "quora.com",
  "medium.com",
  "substack.com",
  "tumblr.com",
]);

// Video Sharing Platforms
const VIDEO_PLATFORM_DOMAINS = new Set([
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "bitchute.com",
  "rumble.com",
]);

export class SourceQualityService {
  /**
   * Cleans and normalizes a domain string.
   */
  public normalizeDomain(rawDomain: string): string {
    return rawDomain.toLowerCase().replace(/^www\./, "").trim();
  }

  /**
   * Evaluates transparent, deterministic source quality based on publisher domain and format signals.
   */
  public evaluateSourceQuality(
    url: string,
    rawDomain: string,
    sourceType?: EvidenceSourceType
  ): SourceQualityProfile {
    const domain = this.normalizeDomain(rawDomain);

    // 1. Government & Institutional TLDs or domains
    if (
      domain.endsWith(".gov") ||
      domain.endsWith(".mil") ||
      domain.endsWith(".gov.uk") ||
      domain.endsWith(".gc.ca") ||
      INSTITUTIONAL_DOMAINS.has(domain)
    ) {
      return {
        tier: "HIGH",
        reason: "Government agency or official international institutional repository",
        category: "institutional",
      };
    }

    // 2. Academic / Scientific publishers & university TLDs
    if (
      domain.endsWith(".edu") ||
      domain.endsWith(".ac.uk") ||
      domain.endsWith(".edu.au") ||
      ACADEMIC_DOMAINS.has(domain) ||
      sourceType === "academic"
    ) {
      return {
        tier: "HIGH",
        reason: "Peer-reviewed scientific publication or accredited academic institution",
        category: "academic",
      };
    }

    // 3. Primary News & Verified Fact-Checking organizations
    if (PRIMARY_NEWS_FACTCHECK_DOMAINS.has(domain)) {
      return {
        tier: "HIGH",
        reason: "Primary global news agency or verified independent fact-checking archive",
        category: "news_factcheck",
      };
    }

    // 4. Secondary Established News & Technology Publishers
    if (SECONDARY_NEWS_DOMAINS.has(domain)) {
      return {
        tier: "MEDIUM",
        reason: "Established commercial news publication or specialized editorial outlet",
        category: "news_factcheck",
      };
    }

    // 5. Open Encyclopedias & Reference Repositories
    if (REFERENCE_DOMAINS.has(domain)) {
      return {
        tier: "MEDIUM",
        reason: "Open collaborative encyclopedia or standard reference knowledge base",
        category: "reference",
      };
    }

    // 6. Video Portals & YouTube
    if (VIDEO_PLATFORM_DOMAINS.has(domain) || sourceType === "youtube" || sourceType === "video_portal") {
      return {
        tier: "MEDIUM",
        reason: "Open video sharing platform; source validity depends on specific channel/creator",
        category: "video_portal",
      };
    }

    // 7. Social Media & Discussion Forums
    if (SOCIAL_COMMUNITY_DOMAINS.has(domain) || sourceType === "social") {
      return {
        tier: "LOW",
        reason: "User-generated social media post or discussion forum thread",
        category: "social_forum",
      };
    }

    // 8. General Web Fallback
    return {
      tier: "MEDIUM",
      reason: "General web publication indexed by search providers",
      category: "general_web",
    };
  }

  /**
   * Calculates source diversity metrics across retrieved evidence items.
   */
  public calculateSourceDiversity(sources: EvidenceItem[]): SourceDiversitySummary {
    if (!sources || sources.length === 0) {
      return {
        totalSources: 0,
        webCount: 0,
        youtubeCount: 0,
        academicCount: 0,
        socialCount: 0,
        otherCount: 0,
        uniqueDomainCount: 0,
        uniqueDomains: [],
        isMultiDomain: false,
        diversityLevel: "LOW",
      };
    }

    let webCount = 0;
    let youtubeCount = 0;
    let academicCount = 0;
    let socialCount = 0;
    let otherCount = 0;

    const domainSet = new Set<string>();

    for (const src of sources) {
      const dom = this.normalizeDomain(src.domain || "web-source");
      if (dom && dom !== "web-source") {
        domainSet.add(dom);
      }

      const st = src.sourceType || "web";
      if (st === "youtube") {
        youtubeCount++;
      } else if (st === "academic") {
        academicCount++;
      } else if (st === "social") {
        socialCount++;
      } else if (st === "web") {
        webCount++;
      } else {
        otherCount++;
      }
    }

    const uniqueDomains = Array.from(domainSet);
    const uniqueDomainCount = uniqueDomains.length;
    const isMultiDomain = uniqueDomainCount >= 2;

    let diversityLevel: "HIGH" | "MODERATE" | "LOW" = "LOW";
    if (uniqueDomainCount >= 4) {
      diversityLevel = "HIGH";
    } else if (uniqueDomainCount >= 2) {
      diversityLevel = "MODERATE";
    }

    return {
      totalSources: sources.length,
      webCount,
      youtubeCount,
      academicCount,
      socialCount,
      otherCount,
      uniqueDomainCount,
      uniqueDomains,
      isMultiDomain,
      diversityLevel,
    };
  }

  /**
   * Calculates deterministic evidence consensus and stance balance ratio.
   */
  public calculateEvidenceConsensus(sources: EvidenceItem[]): EvidenceConsensusSummary {
    if (!sources || sources.length === 0) {
      return {
        supportingCount: 0,
        contradictingCount: 0,
        neutralCount: 0,
        totalCount: 0,
        balance: "INSUFFICIENT",
        supportPercentage: 0,
        contradictPercentage: 0,
        neutralPercentage: 0,
      };
    }

    let supportingCount = 0;
    let contradictingCount = 0;
    let neutralCount = 0;

    for (const src of sources) {
      if (src.stance === "SUPPORTS") {
        supportingCount++;
      } else if (src.stance === "CONTRADICTS") {
        contradictingCount++;
      } else {
        neutralCount++;
      }
    }

    const totalCount = sources.length;
    const supportPercentage = Math.round((supportingCount / totalCount) * 100);
    const contradictPercentage = Math.round((contradictingCount / totalCount) * 100);
    const neutralPercentage = 100 - supportPercentage - contradictPercentage;

    let balance: EvidenceConsensusSummary["balance"] = "NEUTRAL";

    if (supportingCount > 0 && contradictingCount === 0) {
      balance = "SUPPORTING";
    } else if (contradictingCount > 0 && supportingCount === 0) {
      balance = "CONTRADICTING";
    } else if (supportingCount > 0 && contradictingCount > 0) {
      balance = "MIXED";
    } else if (supportingCount === 0 && contradictingCount === 0) {
      balance = totalCount > 0 ? "NEUTRAL" : "INSUFFICIENT";
    }

    return {
      supportingCount,
      contradictingCount,
      neutralCount,
      totalCount,
      balance,
      supportPercentage,
      contradictPercentage,
      neutralPercentage: Math.max(neutralPercentage, 0),
    };
  }
}

export const sourceQualityService = new SourceQualityService();
