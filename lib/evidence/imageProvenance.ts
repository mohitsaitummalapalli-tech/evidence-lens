/**
 * EvidenceLens - Universal Web & Media Provenance Discovery Service
 * Phase 6B & Phase 10: Multimodal Web Artifact, Video & Image Provenance Analysis
 */

import { TavilySearchClient, TavilySearchResult } from "./tavily";
import {
  AtomicClaim,
  ImageProvenanceCandidate,
  ImageProvenanceResult,
  ImageProvenanceMatchType,
  ProvenanceSourceType,
} from "@/types";

export interface ImageProvenanceSearchParams {
  hasImage?: boolean;
  hasMedia?: boolean;
  mediaType?: "image" | "video" | "audio" | "document" | "none";
  filename?: string;
  mimeType?: string;
  claimText?: string;
  atomicClaims?: AtomicClaim[];
  contextUrl?: string;
}

export class ImageProvenanceService {
  private tavilyClient: TavilySearchClient;

  constructor(tavilyClient?: TavilySearchClient) {
    this.tavilyClient = tavilyClient || new TavilySearchClient();
  }

  /**
   * Helper to detect media subtype from mime or filename.
   */
  public detectMediaType(params: ImageProvenanceSearchParams): "image" | "video" | "audio" | "document" | "none" {
    if (params.mediaType) return params.mediaType;
    const mime = (params.mimeType || "").toLowerCase();
    const fn = (params.filename || "").toLowerCase();

    if (mime.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i.test(fn)) {
      return "video";
    }
    if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(fn)) {
      return "image";
    }
    if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/i.test(fn)) {
      return "audio";
    }
    if (params.hasImage || params.hasMedia) {
      return "image";
    }
    return "none";
  }

  /**
   * Generates focused textual search queries grounded in actual media and claim data.
   */
  public generateProvenanceQueries(params: ImageProvenanceSearchParams): string[] {
    const queries: string[] = [];
    const seenQueries = new Set<string>();
    const mediaType = this.detectMediaType(params);

    const addQuery = (q: string) => {
      const trimmed = q.trim().replace(/\s+/g, " ");
      if (trimmed.length >= 4 && !seenQueries.has(trimmed.toLowerCase())) {
        seenQueries.add(trimmed.toLowerCase());
        queries.push(trimmed);
      }
    };

    // 1. Cleaned filename query (if descriptive)
    if (params.filename) {
      const cleanFilename = params.filename
        .replace(/\.[a-zA-Z0-9]{3,4}$/, "")
        .replace(/[-_.]+/g, " ")
        .replace(/\b(image|img|screenshot|photo|picture|pic|video|vid|clip|footage|upload|file)\b/gi, "")
        .trim();

      if (cleanFilename.length >= 4 && !/^\d+$/.test(cleanFilename)) {
        if (mediaType === "video") {
          addQuery(`${cleanFilename} video`);
        } else {
          addQuery(cleanFilename);
        }
      }
    }

    // 2. Entities & subjects from atomic claims
    if (params.atomicClaims && params.atomicClaims.length > 0) {
      for (const claim of params.atomicClaims) {
        if (claim.entities && claim.entities.length > 0) {
          const entityQuery = claim.entities.slice(0, 3).join(" ");
          if (mediaType === "video") {
            addQuery(`${entityQuery} video footage`);
          } else {
            addQuery(entityQuery);
          }
        }
        if (claim.text && claim.text.length > 10) {
          if (mediaType === "video") {
            addQuery(`${claim.text} video`);
          } else {
            addQuery(claim.text);
          }
        }
      }
    }

    // 3. Main claim text fallback
    if (queries.length === 0 && params.claimText && params.claimText.trim().length > 0) {
      if (mediaType === "video") {
        addQuery(`${params.claimText.trim()} video`);
      } else {
        addQuery(params.claimText.trim());
      }
    }

    // Return at most 3 focused queries to ensure high relevance and rate discipline
    return queries.slice(0, 3);
  }

  /**
   * Helper to safely extract domain from a URL string
   */
  public extractDomain(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace(/^www\./i, "");
    } catch {
      return "web-source";
    }
  }

  /**
   * Identifies the provenance candidate's source type (e.g. YouTube video vs Image Host vs Web Publication).
   */
  public detectCandidateSourceType(url: string, domain: string, mediaType: string): ProvenanceSourceType {
    const lowerUrl = url.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    if (
      lowerDomain.includes("youtube.com") ||
      lowerDomain.includes("youtu.be") ||
      lowerUrl.includes("youtube.com/watch") ||
      lowerUrl.includes("youtu.be/")
    ) {
      return "youtube";
    }

    if (lowerDomain.includes("vimeo.com") || lowerDomain.includes("dailymotion.com") || lowerDomain.includes("tiktok.com")) {
      return "video";
    }

    if (
      mediaType === "image" ||
      lowerDomain.includes("imgur.com") ||
      lowerDomain.includes("flickr.com") ||
      lowerDomain.includes("pinterest.com")
    ) {
      return "image";
    }

    return "web";
  }

  /**
   * Determines match type based on search relevance and content evidence.
   * Strict Honesty Rule: Never emit EXACT_MATCH.
   */
  public determineMatchType(score: number): ImageProvenanceMatchType {
    if (score >= 0.75) {
      return "POSSIBLE_MATCH";
    }
    if (score >= 0.35) {
      return "RELATED_SOURCE";
    }
    return "NO_MATCH";
  }

  /**
   * Discovers candidate web sources for an uploaded media artifact (Image or Video).
   */
  public async discoverProvenance(
    params: ImageProvenanceSearchParams
  ): Promise<ImageProvenanceResult> {
    const discoveredAt = new Date().toISOString();
    const mediaType = this.detectMediaType(params);

    // If no media is present, return skipped state
    if (!params.hasImage && !params.hasMedia && !params.filename && !params.mimeType) {
      return {
        hasImage: false,
        hasMedia: false,
        mediaType: "none",
        searchStatus: "SKIPPED",
        totalCandidatesFound: 0,
        uniqueDomains: [],
        queriesExecuted: [],
        candidates: [],
        discoveredAt,
      };
    }

    const queries = this.generateProvenanceQueries(params);

    if (queries.length === 0) {
      return {
        hasImage: mediaType === "image",
        hasMedia: true,
        mediaType,
        mediaFilename: params.filename,
        mediaMimeType: params.mimeType,
        searchStatus: "NO_CANDIDATES",
        totalCandidatesFound: 0,
        uniqueDomains: [],
        queriesExecuted: [],
        candidates: [],
        discoveredAt,
      };
    }

    const seenUrls = new Set<string>();
    const candidates: ImageProvenanceCandidate[] = [];
    const executedQueries: string[] = [];

    for (const query of queries) {
      executedQueries.push(query);
      try {
        const results: TavilySearchResult[] = await this.tavilyClient.search(query, 4);

        for (const res of results) {
          if (!res.url || seenUrls.has(res.url.toLowerCase())) {
            continue;
          }
          seenUrls.add(res.url.toLowerCase());

          const score = typeof res.score === "number" ? Math.min(Math.max(res.score, 0), 1) : 0.65;
          const matchType = this.determineMatchType(score);

          // Only keep POSSIBLE_MATCH or RELATED_SOURCE
          if (matchType !== "NO_MATCH") {
            const domain = this.extractDomain(res.url);
            const candidateSourceType = this.detectCandidateSourceType(res.url, domain, mediaType);

            const candidate: ImageProvenanceCandidate = {
              id: `prov_${candidates.length + 1}`,
              url: res.url,
              title: res.title || (candidateSourceType === "youtube" ? "YouTube Video" : "Web Citation"),
              domain,
              snippet: (res.content || "").slice(0, 300),
              relevanceScore: score,
              matchType,
              sourceType: candidateSourceType,
              discoveredAt,
              matchedQuery: query,
            };
            candidates.push(candidate);
          }
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        console.warn(`[MediaProvenance] Query failed for "${query}":`, errMessage);
      }
    }

    // Sort candidates by relevance score descending
    candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const uniqueDomains = Array.from(new Set(candidates.map((c) => c.domain)));

    return {
      hasImage: mediaType === "image",
      hasMedia: true,
      mediaType,
      mediaFilename: params.filename,
      mediaMimeType: params.mimeType,
      searchStatus: candidates.length > 0 ? "SUCCESS" : "NO_CANDIDATES",
      totalCandidatesFound: candidates.length,
      uniqueDomains,
      queriesExecuted: executedQueries,
      candidates,
      discoveredAt,
    };
  }
}

export const imageProvenanceService = new ImageProvenanceService();
export const mediaProvenanceService = imageProvenanceService;
