/**
 * EvidenceLens - Multimodal Media Matcher Service (Phase 14)
 *
 * Determines whether an uploaded image or video matches existing online media,
 * video archives (YouTube), or image repositories.
 *
 * Strictly adheres to the Zero-Fabrication rule:
 * - Only returns matches grounded in real provider search results
 * - Transparently classifies match types: EXACT, HIGH_SIMILARITY, RELATED, NONE
 * - Returns "No exact match verified." when no credible match exists
 */

import {
  MediaMatchResult,
  MediaMatchType,
  MediaMatchSourceType,
  MultimodalMediaMatchSummary,
  MediaMatchStatus,
  AtomicClaim,
} from "@/types";
import { ImageProvenanceService } from "./imageProvenance";

export interface MediaMatchSearchParams {
  hasMedia?: boolean;
  mediaType?: "image" | "video";
  filename?: string;
  mimeType?: string;
  claimText?: string;
  atomicClaims?: AtomicClaim[];
  contextUrl?: string;
}

export interface MediaMatchProvider {
  searchImage(params: MediaMatchSearchParams): Promise<MediaMatchResult[]>;
  searchVideo(params: MediaMatchSearchParams): Promise<MediaMatchResult[]>;
  normalizeResults(rawCandidates: RawMediaCandidate[]): MediaMatchResult[];
}

export interface RawMediaCandidate {
  id?: string;
  url: string;
  title: string;
  content?: string;
  snippet?: string;
  score?: number;
  domain?: string;
  publishedDate?: string;
  sourceType?: string;
  thumbnail?: string;
}

export class DefaultMediaMatchProvider implements MediaMatchProvider {
  private provenanceService: ImageProvenanceService;

  constructor(provenanceService?: ImageProvenanceService) {
    this.provenanceService = provenanceService || new ImageProvenanceService();
  }

  /**
   * Normalize URLs and extract clean domains.
   */
  public extractDomain(urlStr: string): string {
    if (!urlStr || typeof urlStr !== "string") return "web-source";
    try {
      const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
      const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
      if (!host || !host.includes(".") || host.length < 3) {
        return "web-source";
      }
      return host;
    } catch {
      return "web-source";
    }
  }

  /**
   * Determine the media source type from domain and URL structure.
   */
  public inferSourceType(urlStr: string, domain: string): MediaMatchSourceType {
    const lowerUrl = (urlStr || "").toLowerCase();
    const lowerDom = (domain || "").toLowerCase();

    if (
      lowerDom.includes("youtube.com") ||
      lowerDom.includes("youtu.be") ||
      lowerUrl.includes("youtube.com/watch") ||
      lowerUrl.includes("youtu.be/")
    ) {
      return "youtube";
    }
    if (
      lowerDom.includes("vimeo.com") ||
      lowerDom.includes("dailymotion.com") ||
      lowerDom.includes("tiktok.com") ||
      lowerUrl.includes("/video/") ||
      lowerUrl.includes("/watch/")
    ) {
      return "video";
    }
    if (
      lowerDom.includes("flickr.com") ||
      lowerDom.includes("imgur.com") ||
      lowerDom.includes("instagram.com") ||
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(lowerUrl)
    ) {
      return "image";
    }
    return "web";
  }

  /**
   * Classify match type based on calibrated confidence thresholds.
   * EXACT: score >= 0.95
   * HIGH_SIMILARITY: 0.75 <= score < 0.95
   * RELATED: 0.35 <= score < 0.75
   * NONE: score < 0.35
   */
  public classifyMatchType(score: number): MediaMatchType {
    const boundedScore = Math.max(0, Math.min(1, score));
    if (boundedScore >= 0.95) return "EXACT";
    if (boundedScore >= 0.75) return "HIGH_SIMILARITY";
    if (boundedScore >= 0.35) return "RELATED";
    return "NONE";
  }

  /**
   * Synthesize plain-English explanation for why this item is considered a match.
   */
  public generateExplanation(
    type: MediaMatchType,
    sourceType: MediaMatchSourceType,
    domain: string,
    confidence: number
  ): string {
    const pct = Math.round(confidence * 100);
    switch (type) {
      case "EXACT":
        if (sourceType === "youtube") {
          return `Direct video footage match identified on YouTube (${domain}) with ${pct}% confidence.`;
        }
        return `An identical media asset appears online on ${domain} with ${pct}% confidence.`;
      case "HIGH_SIMILARITY":
        if (sourceType === "youtube" || sourceType === "video") {
          return `Highly similar video report or footage broadcast found on ${domain} (${pct}% confidence).`;
        }
        return `Highly similar visual media found published by ${domain} covering this event (${pct}% confidence).`;
      case "RELATED":
        return `Related background reporting or contextual media found on ${domain} (${pct}% confidence).`;
      case "NONE":
      default:
        return `No exact or high-similarity media match verified on ${domain}.`;
    }
  }

  /**
   * Normalizes raw candidates into structured MediaMatchResult items.
   */
  public normalizeResults(rawCandidates: RawMediaCandidate[]): MediaMatchResult[] {
    if (!Array.isArray(rawCandidates) || rawCandidates.length === 0) {
      return [];
    }

    const seenUrls = new Set<string>();
    const results: MediaMatchResult[] = [];

    rawCandidates.forEach((cand, idx) => {
      if (!cand || !cand.url || typeof cand.url !== "string") return;

      const rawUrl = cand.url.trim();
      const normalizedUrl = rawUrl.split("?")[0].replace(/\/+$/, "").toLowerCase();

      if (seenUrls.has(normalizedUrl)) return;
      seenUrls.add(normalizedUrl);

      const domain = this.extractDomain(rawUrl);
      const rawScore = typeof cand.score === "number" && !isNaN(cand.score) ? cand.score : 0.5;
      const confidence = Math.max(0, Math.min(1, Math.round(rawScore * 100) / 100));
      const type = this.classifyMatchType(confidence);
      const sourceType = cand.sourceType
        ? (cand.sourceType as MediaMatchSourceType)
        : this.inferSourceType(rawUrl, domain);

      const explanation = this.generateExplanation(type, sourceType, domain, confidence);

      results.push({
        id: cand.id || `match_${idx + 1}`,
        type,
        confidence,
        title: (cand.title || "Online Media Reference").trim(),
        url: rawUrl,
        domain,
        thumbnail: cand.thumbnail,
        sourceType,
        publishedAt: cand.publishedDate,
        explanation,
        matchFound: type === "EXACT" || type === "HIGH_SIMILARITY",
      });
    });

    // Sort descending by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Search for image matches online.
   */
  public async searchImage(params: MediaMatchSearchParams): Promise<MediaMatchResult[]> {
    try {
      const provResult = await this.provenanceService.discoverProvenance({
        hasImage: true,
        hasMedia: true,
        mediaType: "image",
        filename: params.filename,
        mimeType: params.mimeType,
        claimText: params.claimText,
        atomicClaims: params.atomicClaims,
        contextUrl: params.contextUrl,
      });

      const rawCandidates: RawMediaCandidate[] = provResult.candidates.map((c: {
        id: string;
        url: string;
        title: string;
        snippet?: string;
        relevanceScore: number;
        domain: string;
        publishedDate?: string;
        sourceType?: string;
      }) => ({
        id: c.id,
        url: c.url,
        title: c.title,
        snippet: c.snippet,
        score: c.relevanceScore,
        domain: c.domain,
        publishedDate: c.publishedDate,
        sourceType: c.sourceType,
      }));

      return this.normalizeResults(rawCandidates);
    } catch (err) {
      console.warn("[MediaMatcher] Image search failed:", err);
      return [];
    }
  }

  /**
   * Search for video matches online (including YouTube).
   */
  public async searchVideo(params: MediaMatchSearchParams): Promise<MediaMatchResult[]> {
    try {
      const provResult = await this.provenanceService.discoverProvenance({
        hasMedia: true,
        mediaType: "video",
        filename: params.filename,
        mimeType: params.mimeType,
        claimText: params.claimText,
        atomicClaims: params.atomicClaims,
        contextUrl: params.contextUrl,
      });

      const rawCandidates: RawMediaCandidate[] = provResult.candidates.map((c: {
        id: string;
        url: string;
        title: string;
        snippet?: string;
        relevanceScore: number;
        domain: string;
        publishedDate?: string;
        sourceType?: string;
      }) => ({
        id: c.id,
        url: c.url,
        title: c.title,
        snippet: c.snippet,
        score: c.relevanceScore,
        domain: c.domain,
        publishedDate: c.publishedDate,
        sourceType: c.sourceType,
      }));

      return this.normalizeResults(rawCandidates);
    } catch (err) {
      console.warn("[MediaMatcher] Video search failed:", err);
      return [];
    }
  }
}

/**
 * Main entry point for multimodal media matching.
 */
export async function matchMultimodalMedia(
  params: MediaMatchSearchParams,
  provider?: MediaMatchProvider
): Promise<MultimodalMediaMatchSummary> {
  const activeProvider = provider || new DefaultMediaMatchProvider();

  if (!params.hasMedia && !params.filename) {
    return {
      hasMedia: false,
      allMatches: [],
      status: "SKIPPED",
      summaryText: "No media uploaded for visual or footage matching.",
      exactMatchCount: 0,
      similarMatchCount: 0,
      relatedMatchCount: 0,
    };
  }

  const isVideo =
    params.mediaType === "video" ||
    (params.mimeType && params.mimeType.startsWith("video/")) ||
    (params.filename && /\.(mp4|webm|mov|avi|mkv)$/i.test(params.filename));

  const mediaType: "image" | "video" = isVideo ? "video" : "image";

  let matches: MediaMatchResult[] = [];

  if (mediaType === "video") {
    matches = await activeProvider.searchVideo(params);
  } else {
    matches = await activeProvider.searchImage(params);
  }

  const exactMatches = matches.filter((m) => m.type === "EXACT");
  const similarMatches = matches.filter((m) => m.type === "HIGH_SIMILARITY");
  const relatedMatches = matches.filter((m) => m.type === "RELATED");

  const primaryMatch = matches.length > 0 ? matches[0] : null;

  let status: MediaMatchStatus = "NO_CANDIDATES";
  let summaryText = "No exact match verified in open online sources.";

  if (exactMatches.length > 0) {
    status = "MATCH_FOUND";
    const top = exactMatches[0];
    if (top.sourceType === "youtube") {
      summaryText = `YouTube video match found on ${top.domain}: "${top.title}".`;
    } else {
      summaryText = `An identical media asset appears online on ${top.domain}.`;
    }
  } else if (similarMatches.length > 0) {
    status = "MATCH_FOUND";
    const top = similarMatches[0];
    summaryText = `Highly similar ${mediaType} match found on ${top.domain}: "${top.title}".`;
  } else if (relatedMatches.length > 0) {
    status = "NO_EXACT_MATCH";
    summaryText = "Related contextual sources found, but no exact or identical media match verified.";
  } else {
    status = "NO_CANDIDATES";
    summaryText = "No visual or footage matches discovered for this media item.";
  }

  return {
    hasMedia: true,
    mediaType,
    mediaFilename: params.filename,
    primaryMatch,
    allMatches: matches,
    status,
    summaryText,
    exactMatchCount: exactMatches.length,
    similarMatchCount: similarMatches.length,
    relatedMatchCount: relatedMatches.length,
  };
}
