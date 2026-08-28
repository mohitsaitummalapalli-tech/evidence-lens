/**
 * EvidenceLens - Evidence Retrieval Engine
 * Phase 4B: Connect Atomic Claims → Real Web Evidence
 */

import { AtomicClaim, ClaimEvidenceBundle, EvidenceItem, EvidenceRetrievalResult } from "@/types";
import { tavilyClient } from "./tavily";
import { geminiService, StanceEvaluationItem } from "../ai/gemini";

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
   * Retrieves web evidence for a set of atomic claims concurrently using Tavily.
   * Deduplicates URLs, keeps top 3 results per claim, and links each result strictly to its claimId.
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

    // 1. Concurrently fetch web evidence for each atomic claim via Promise.all
    await Promise.all(
      claims.map(async (claim) => {
        const query = this.buildQuery(claim);
        const claimSources: EvidenceItem[] = [];
        const seenUrls = new Set<string>();

        try {
          // Keep best 3 results per claim as specified in Phase 4B
          const rawResults = await tavilyClient.search(query, 3);

          rawResults.forEach((res, resIdx) => {
            const cleanUrl = res.url.trim();
            if (!cleanUrl || seenUrls.has(cleanUrl.toLowerCase())) return;
            seenUrls.add(cleanUrl.toLowerCase());

            const evidenceId = `ev_${claim.id}_${resIdx + 1}`;
            const domain = this.extractDomain(cleanUrl);

            const item: EvidenceItem = {
              id: evidenceId,
              claimId: claim.id,
              title: res.title || domain,
              url: cleanUrl,
              domain,
              publishedDate: res.published_date || undefined,
              snippet: res.content || "",
              relevanceScore: typeof res.score === "number" ? res.score : undefined,
              stance: "UNCERTAIN", // Initial stance is UNCERTAIN as required
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
        } catch (err: unknown) {
          hasAnySearchFailure = true;
          lastErrorMessage = err instanceof Error ? err.message : String(err);
          console.warn(`Search retrieval failed for claim ${claim.id} ("${query}"):`, lastErrorMessage);
        }

        bundles.push({
          claimId: claim.id,
          claimText: claim.text,
          query,
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
