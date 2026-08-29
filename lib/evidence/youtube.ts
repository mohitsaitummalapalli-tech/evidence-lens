/**
 * EvidenceLens - YouTube Video Evidence Discovery Client
 * Phase 17: Multi-Modal Video Evidence Retrieval & Grounding
 *
 * Core Principles:
 * 1. Discover authentic YouTube video evidence directly relevant to atomic claims.
 * 2. Strict YouTube URL validation and canonical deduplication (watch?v=, youtu.be/, shorts/).
 * 3. Zero-Fabrication: Never hallucinate video URLs, channel names, or transcript snippets.
 * 4. Resilient & Non-Blocking: If YouTube search fails or returns 0 results, degrades gracefully.
 */

import { tavilyClient } from "./tavily";

export interface RawYouTubeResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
  publishedDate?: string;
  channelOrAuthor?: string;
  videoId?: string;
}

/**
 * Validates whether a given URL string is an authentic YouTube URL.
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be"
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the canonical 11-character YouTube video ID or playlist ID.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!isYouTubeUrl(url)) return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // 1. youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0].split("?")[0];
      return id && id.length >= 6 ? id : null;
    }

    // 2. youtube.com/watch?v=VIDEO_ID
    if (parsed.pathname === "/watch") {
      const v = parsed.searchParams.get("v");
      return v && v.length >= 6 ? v : null;
    }

    // 3. youtube.com/shorts/VIDEO_ID
    if (parsed.pathname.startsWith("/shorts/")) {
      const id = parsed.pathname.replace(/^\/shorts\//, "").split("/")[0].split("?")[0];
      return id && id.length >= 6 ? id : null;
    }

    // 4. youtube.com/embed/VIDEO_ID
    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.replace(/^\/embed\//, "").split("/")[0].split("?")[0];
      return id && id.length >= 6 ? id : null;
    }

    // 5. Playlist fallback
    const list = parsed.searchParams.get("list");
    if (list) {
      return `list_${list}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes a YouTube URL to its canonical standard format: https://www.youtube.com/watch?v=VIDEO_ID
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (videoId && !videoId.startsWith("list_")) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return url.trim();
}

/**
 * Extracts a likely channel/creator name from video title or snippet.
 * E.g. "Chandrayaan-3 Moon Landing | ISRO Official" -> "ISRO Official"
 */
export function extractChannelFromTitle(title: string): { cleanTitle: string; channel?: string } {
  if (!title) return { cleanTitle: "YouTube Video" };

  const separators = [" | ", " - ", " – ", " — ", " : "];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      if (parts.length >= 2) {
        const potentialChannel = parts[parts.length - 1].trim();
        const mainTitle = parts.slice(0, -1).join(sep).trim();
        // If channel is reasonably short (<= 35 chars) and looks like a name
        if (potentialChannel.length > 0 && potentialChannel.length <= 35) {
          return { cleanTitle: mainTitle || title, channel: potentialChannel };
        }
      }
    }
  }

  return { cleanTitle: title };
}

export class YouTubeSearchClient {
  /**
   * Builds a focused search query targeted specifically at video archives and broadcasts.
   */
  public buildYouTubeQuery(claimText: string, entities: string[] = []): string {
    const cleanEntities = entities
      .map((e) => e.replace(/["'\n\r]/g, "").trim())
      .filter((e) => e.length > 0);

    if (cleanEntities.length > 0) {
      return `${cleanEntities.join(" ")} video documentary news footage`;
    }

    const cleanText = claimText
      .replace(/["'\n\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return `${cleanText} video`;
  }

  /**
   * Executes a focused YouTube video search using domain-targeted discovery.
   * Filters out invalid URLs and deduplicates equivalent video IDs.
   */
  public async search(query: string, maxResults = 3): Promise<RawYouTubeResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      const rawResults = await tavilyClient.search(
        `${cleanQuery} site:youtube.com`,
        Math.min(Math.max(maxResults * 2, 4), 8)
      );

      const uniqueVideos = new Map<string, RawYouTubeResult>();

      for (const res of rawResults) {
        const rawUrl = res.url?.trim() || "";
        if (!isYouTubeUrl(rawUrl)) continue;

        const canonicalUrl = normalizeYouTubeUrl(rawUrl);
        const videoId = extractYouTubeVideoId(canonicalUrl);
        const key = videoId || canonicalUrl.toLowerCase();

        if (uniqueVideos.has(key)) continue;

        const { cleanTitle, channel } = extractChannelFromTitle(res.title || "");

        uniqueVideos.set(key, {
          title: cleanTitle || "YouTube Video",
          url: canonicalUrl,
          snippet: res.content || "",
          score: typeof res.score === "number" ? res.score : 0.85,
          publishedDate: res.published_date || undefined,
          channelOrAuthor: channel || "YouTube Creator",
          videoId: videoId || undefined,
        });

        if (uniqueVideos.size >= maxResults) break;
      }

      return Array.from(uniqueVideos.values());
    } catch (err: unknown) {
      console.warn(
        `[YouTubeSearchClient] Video discovery query failed for "${cleanQuery}":`,
        err instanceof Error ? err.message : String(err)
      );
      return [];
    }
  }
}

export const youTubeClient = new YouTubeSearchClient();
