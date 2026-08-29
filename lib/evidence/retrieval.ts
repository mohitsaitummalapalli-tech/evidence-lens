/**
 * EvidenceLens - Multi-Source Evidence Retrieval Engine
 * Phase 4B, Phase 10 & Phase 17: Connect Atomic Claims → Real Web + YouTube Video Evidence
 *
 * Core Principles:
 * 1. Concurrently discovers both authoritative Web publications and authentic YouTube video evidence.
 * 2. Unifies all sources into ONE shared immutable evidence bundle per claim.
 * 3. Identifies exact source types: "web", "youtube", "academic", "social", "video_portal".
 * 4. Grounded AI Stance Evaluation across all retrieved snippets.
 * 5. Resilient fault tolerance: If YouTube search fails, Web search proceeds uninterrupted.
 */

import { AtomicClaim, ClaimEvidenceBundle, EvidenceItem, EvidenceRetrievalResult } from "@/types";
import { tavilyClient } from "./tavily";
import { youTubeClient, isYouTubeUrl } from "./youtube";
import { geminiService, StanceEvaluationItem } from "../ai/gemini";
import { sourceQualityService } from "./sourceQuality";

export class EvidenceRetrievalService {
  /**
   * Constructs an optimized, focused search query for an atomic claim.
   * Avoids searching the entire compound claim; focuses on entities, temporal, and location anchors.
   */
  public buildQuery(claim: AtomicClaim): string {
    const parts: string[] = [];

    // 1. Prioritize named entities
    if (claim.entities && claim.entities.length > 0) {
      const cleanEntities = claim.entities
        .map((e) => e.replace(/["'\n\r]/g, "").trim())
        .filter((e) => e.length > 0);
      if (cleanEntities.length > 0) {
        parts.push(cleanEntities.join(" "));
      }
    }

    // 2. Add location reference if distinct
    if (claim.locationReference && claim.locationReference.trim().length > 0) {
      const loc = claim.locationReference.trim();
      if (!parts.some((p) => p.toLowerCase().includes(loc.toLowerCase()))) {
        parts.push(loc);
      }
    }

    // 3. Add temporal reference if distinct
    if (claim.timeReference && claim.timeReference.trim().length > 0) {
      const time = claim.timeReference.trim();
      if (!parts.some((p) => p.toLowerCase().includes(time.toLowerCase()))) {
        parts.push(time);
      }
    }

    const constructed = parts.join(" ").trim();
    // If constructed query is too brief (less than 8 chars) or empty, fall back to cleaned claim text
    if (constructed.length < 8) {
      return claim.text
        .replace(/["'\n\r]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return constructed;
  }

  /**
   * Extracts clean domain name from URL.
   */
  public extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "web-source";
    }
  }

  /**
   * Identifies the specific source type (e.g. YouTube video vs standard web publication).
   */
  public detectSourceType(url: string, domain: string): "youtube" | "web" | "academic" | "social" | "video_portal" {
    if (isYouTubeUrl(url)) {
      return "youtube";
    }

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
      return "video_portal";
    }

    if (
      lowerDomain.includes("arxiv.org") ||
      lowerDomain.includes("nature.com") ||
      lowerDomain.includes("ncbi.nlm.nih.gov") ||
      lowerDomain.includes("sciencedirect.com") ||
      lowerDomain.includes("springer.com") ||
      lowerDomain.includes("cell.com")
    ) {
      return "academic";
    }

    return "web";
  }

  /**
   * Retrieves both Web and YouTube video evidence for a set of atomic claims concurrently.
   * Merges them into ONE shared evidence bundle per claim.
   */
  public async retrieveEvidenceForClaims(
    claims: AtomicClaim[],
    contextUrl?: string
  ): Promise<EvidenceRetrievalResult> {
    void contextUrl;
    const bundles: ClaimEvidenceBundle[] = [];
    const allEvidenceItems: EvidenceItem[] = [];
    const stanceEvalItems: StanceEvaluationItem[] = [];

    const retrievedAt = new Date().toISOString();

    if (!claims || claims.length === 0) {
      return {
        status: "empty",
        totalSourcesFound: 0,
        bundles: [],
        allSources: [],
        retrievedAt,
      };
    }

    let hasAnySearchFailure = false;
    let lastErrorMessage = "";

    // 1. Concurrently fetch web and YouTube evidence for each atomic claim
    await Promise.all(
      claims.map(async (claim) => {
        const webQuery = this.buildQuery(claim);
        const ytQuery = youTubeClient.buildYouTubeQuery(claim.text, claim.entities);

        const claimSources: EvidenceItem[] = [];
        const seenUrls = new Set<string>();

        // Concurrently run Web Search and YouTube Search
        const [webResultsRes, ytResultsRes] = await Promise.allSettled([
          tavilyClient.search(webQuery, 3),
          youTubeClient.search(ytQuery, 2),
        ]);

        // Process Web Search results
        if (webResultsRes.status === "fulfilled") {
          const rawWebResults = webResultsRes.value;
          rawWebResults.forEach((res, resIdx) => {
            const cleanUrl = res.url.trim();
            if (!cleanUrl || seenUrls.has(cleanUrl.toLowerCase())) return;
            seenUrls.add(cleanUrl.toLowerCase());

            const evidenceId = `ev_${claim.id}_${resIdx + 1}`;
            const domain = this.extractDomain(cleanUrl);
            const sourceType = this.detectSourceType(cleanUrl, domain);
            const qualityProfile = sourceQualityService.evaluateSourceQuality(cleanUrl, domain, sourceType);

            const item: EvidenceItem = {
              id: evidenceId,
              claimId: claim.id,
              title: res.title || (sourceType === "youtube" ? "YouTube Video" : domain),
              url: cleanUrl,
              domain,
              publishedDate: res.published_date || undefined,
              snippet: res.content || "",
              relevanceScore: typeof res.score === "number" ? res.score : undefined,
              stance: "UNCERTAIN",
              sourceType,
              sourceQuality: qualityProfile.tier,
              qualityReason: qualityProfile.reason,
              retrievedAt,
            };

            claimSources.push(item);
            allEvidenceItems.push(item);

            if (item.snippet) {
              stanceEvalItems.push({
                evidenceId,
                claimId: claim.id,
                claimText: claim.text,
                sourceTitle: item.title,
                snippetText: item.snippet,
              });
            }
          });
        } else {
          hasAnySearchFailure = true;
          lastErrorMessage = webResultsRes.reason instanceof Error ? webResultsRes.reason.message : String(webResultsRes.reason);
          console.warn(`Web search retrieval failed for claim ${claim.id} ("${webQuery}"):`, lastErrorMessage);
        }

        // Process YouTube Video Search results
        if (ytResultsRes.status === "fulfilled") {
          const rawYtResults = ytResultsRes.value;
          rawYtResults.forEach((yt, ytIdx) => {
            const cleanUrl = yt.url.trim();
            if (!cleanUrl || seenUrls.has(cleanUrl.toLowerCase())) return;
            seenUrls.add(cleanUrl.toLowerCase());

            const evidenceId = `ev_${claim.id}_yt_${ytIdx + 1}`;
            const domain = "youtube.com";
            const sourceType = "youtube" as const;
            const qualityProfile = sourceQualityService.evaluateSourceQuality(cleanUrl, domain, sourceType);

            const item: EvidenceItem = {
              id: evidenceId,
              claimId: claim.id,
              title: yt.title || "YouTube Video",
              url: cleanUrl,
              domain,
              publishedDate: yt.publishedDate || undefined,
              snippet: yt.snippet || "",
              relevanceScore: yt.score || 0.85,
              stance: "UNCERTAIN",
              sourceType,
              sourceQuality: qualityProfile.tier,
              qualityReason: qualityProfile.reason,
              channelOrAuthor: yt.channelOrAuthor || "YouTube Channel",
              retrievedAt,
            };

            claimSources.push(item);
            allEvidenceItems.push(item);

            if (item.snippet) {
              stanceEvalItems.push({
                evidenceId,
                claimId: claim.id,
                claimText: claim.text,
                sourceTitle: item.title,
                snippetText: item.snippet,
              });
            }
          });
        } else {
          console.warn(`YouTube video discovery failed for claim ${claim.id}:`, ytResultsRes.reason);
        }

        bundles.push({
          claimId: claim.id,
          claimText: claim.text,
          query: webQuery,
          sources: claimSources,
        });
      })
    );

    // 2. Sort bundles in original claim order (C1, C2, C3...)
    bundles.sort((a, b) => {
      const numA = parseInt(a.claimId.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.claimId.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    // 3. Perform AI Stance Grounding in batch if evidence snippets were retrieved
    if (stanceEvalItems.length > 0) {
      try {
        const stances = await geminiService.evaluateEvidenceStances(stanceEvalItems);
        for (const item of allEvidenceItems) {
          if (stances[item.id]) {
            item.stance = stances[item.id].stance;
            item.stanceExplanation = stances[item.id].explanation;
          }
        }
      } catch (err) {
        console.warn("Batch stance evaluation skipped or failed (maintaining default UNCERTAIN):", err);
      }
    }

    const totalSources = allEvidenceItems.length;
    let status: EvidenceRetrievalResult["status"] = "found";
    if (totalSources === 0) {
      status = hasAnySearchFailure ? "error" : "empty";
    }

    return {
      status,
      error: hasAnySearchFailure && totalSources === 0 ? lastErrorMessage : undefined,
      totalSourcesFound: totalSources,
      bundles,
      allSources: allEvidenceItems,
      retrievedAt,
    };
  }
}

export const evidenceRetrievalService = new EvidenceRetrievalService();
