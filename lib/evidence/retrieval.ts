/**
 * EvidenceLens - Evidence Retrieval Engine
 * Phase 4: Web Evidence Search & Stance Grounding
 */

import { AtomicClaim, ClaimEvidenceBundle, EvidenceItem, EvidenceRetrievalResult } from "@/types";
import { tavilyClient } from "./tavily";
import { geminiService, StanceEvaluationItem } from "../ai/gemini";

export class EvidenceRetrievalService {
  /**
   * Constructs an optimized search query for an atomic claim.
   */
  private buildQuery(claim: AtomicClaim): string {
    const parts: string[] = [];

    // Prioritize entities and location/time anchors
    if (claim.entities && claim.entities.length > 0) {
      parts.push(claim.entities.join(" "));
    }
    if (claim.locationReference && !parts.some(p => p.includes(claim.locationReference!))) {
      parts.push(claim.locationReference);
    }
    if (claim.timeReference && !parts.some(p => p.includes(claim.timeReference!))) {
      parts.push(claim.timeReference);
    }

    const constructed = parts.join(" ").trim();
    // If constructed query is too short or empty, use the clean claim text
    if (constructed.length < 10) {
      return claim.text.replace(/["'\n\r]/g, " ").trim();
    }
    return constructed;
  }

  /**
   * Extracts clean domain name from URL.
   */
  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "web-source";
    }
  }

  /**
   * Retrieves web evidence for a set of atomic claims, deduplicates sources, and assigns stances.
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

    // Iterate through claims in parallel with safe error boundaries
    await Promise.all(
      claims.map(async (claim) => {
        const query = this.buildQuery(claim);
        const rawResults = await tavilyClient.search(query, 5).catch((err) => {
          console.warn(`Evidence search failed for claim ${claim.id}:`, err);
          return [];
        });

        // Deduplicate URLs for this claim
        const seenUrls = new Set<string>();
        const claimSources: EvidenceItem[] = [];

        rawResults.forEach((res, resIdx) => {
          const cleanUrl = res.url.trim();
          if (seenUrls.has(cleanUrl)) return;
          seenUrls.add(cleanUrl);

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
            stance: "UNCERTAIN", // default before classification
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

        bundles.push({
          claimId: claim.id,
          claimText: claim.text,
          query,
          sources: claimSources,
        });
      })
    );

    // Sort bundles in original claim order (C1, C2, C3...)
    bundles.sort((a, b) => {
      const numA = parseInt(a.claimId.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.claimId.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    // Evaluate stances across all retrieved evidence snippets in batch
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
        console.warn("Batch stance evaluation error:", err);
      }
    }

    return {
      totalSourcesFound: allEvidenceItems.length,
      bundles,
      allSources: allEvidenceItems,
      retrievedAt,
    };
  }
}

export const evidenceRetrievalService = new EvidenceRetrievalService();
