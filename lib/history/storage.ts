/**
 * EvidenceLens - Investigation History Storage & Comparison Engine
 * Phase 9: Client-Side Persistence and Analytical Metric Calculations
 */

import {
  InvestigationInputResponse,
  InvestigationHistoryRecord,
  InvestigationComparisonMetrics,
  VerificationConfidence,
} from "@/types";

export const HISTORY_STORAGE_KEY = "evidencelens_investigation_history_v1";
export const MAX_HISTORY_RECORDS = 50;

/**
 * Derives a normalized quantitative percentage (0-100) from discrete confidence and claim breakdown.
 */
export function calculateConfidenceScore(
  confidence?: VerificationConfidence,
  breakdown?: { total: number; verifiedTrue: number; refutedFalse: number; mixed: number; unverified: number }
): number {
  const baseScore =
    confidence === "HIGH"
      ? 90
      : confidence === "MEDIUM"
      ? 68
      : 35;

  if (!breakdown || breakdown.total === 0) {
    return baseScore;
  }

  // Factor in verifiedTrue ratio to provide fine-grained deterministic variance
  const accuracyRatio = (breakdown.verifiedTrue + breakdown.mixed * 0.5) / breakdown.total;
  const blended = Math.round(baseScore * 0.7 + accuracyRatio * 100 * 0.3);
  return Math.max(10, Math.min(99, blended));
}

/**
 * Transforms an active investigation response into a lightweight, serializable history record.
 */
export function createHistoryRecordFromResponse(
  response: InvestigationInputResponse
): InvestigationHistoryRecord {
  const claimBreakdown = response.verification?.claimBreakdown || {
    total: response.extraction?.claims.length || 0,
    verifiedTrue: 0,
    refutedFalse: 0,
    mixed: 0,
    unverified: response.extraction?.claims.length || 0,
  };

  let supportsCount = 0;
  let contradictsCount = 0;

  if (response.verification?.claimVerifications) {
    response.verification.claimVerifications.forEach((c) => {
      supportsCount += c.supportingEvidenceIds?.length || 0;
      contradictsCount += c.contradictingEvidenceIds?.length || 0;
    });
  } else if (response.evidence?.allSources) {
    response.evidence.allSources.forEach((s) => {
      if (s.stance === "SUPPORTS") supportsCount++;
      if (s.stance === "CONTRADICTS") contradictsCount++;
    });
  }

  const uniqueDomains = new Set<string>();
  if (response.evidence?.allSources) {
    response.evidence.allSources.forEach((s) => {
      if (s.domain) uniqueDomains.add(s.domain);
    });
  }
  if (response.imageProvenance?.uniqueDomains) {
    response.imageProvenance.uniqueDomains.forEach((d) => uniqueDomains.add(d));
  }

  const confidenceScore = calculateConfidenceScore(
    response.verification?.overallConfidence,
    claimBreakdown
  );

  return {
    id: response.sessionId || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: response.timestamp || new Date().toISOString(),
    targetClaim: response.input?.claim || "Untitled Assertion",
    contextUrl: response.input?.contextUrl,
    mediaFilename: response.input?.media?.filename,
    mediaMimeType: response.input?.media?.mimeType,
    hasMedia: Boolean(response.input?.mediaReceived || response.input?.media),
    overallVerdict: response.verification?.overallVerdict || "UNVERIFIED",
    overallConfidence: response.verification?.overallConfidence || "LOW",
    confidenceScore,
    atomicClaimCount: response.extraction?.claims.length || 0,
    evidenceCount: response.evidence?.totalSourcesFound || response.evidence?.allSources?.length || 0,
    uniqueDomainCount: uniqueDomains.size,
    imageCandidateCount: response.imageProvenance?.totalCandidatesFound || response.imageProvenance?.candidates?.length || 0,
    claimBreakdown,
    supportsCount,
    contradictsCount,
    fullResponse: response,
  };
}

/**
 * Loads all stored investigation history records from browser local storage.
 * Gracefully handles SSR environments, empty storage, and malformed JSON.
 */
export function getInvestigationHistory(): InvestigationHistoryRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Sanitize and validate minimum fields
    return parsed.filter(
      (item): item is InvestigationHistoryRecord =>
        Boolean(item && typeof item === "object" && item.id && item.targetClaim && item.overallVerdict)
    );
  } catch (err) {
    console.warn("Failed to load investigation history from localStorage:", err);
    return [];
  }
}

/**
 * Event-based subscriber pattern for external store synchronization
 */
type HistoryListener = () => void;
let listeners: HistoryListener[] = [];

function notifyHistoryListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn("History listener error:", e);
    }
  });
}

export function subscribeToHistory(listener: HistoryListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * Saves a completed investigation to local history.
 * Prepends the newest record, deduplicates identical IDs, and trims to MAX_HISTORY_RECORDS.
 */
export function saveInvestigationToHistory(
  response: InvestigationInputResponse
): InvestigationHistoryRecord | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const record = createHistoryRecordFromResponse(response);
    const existing = getInvestigationHistory();

    // Filter out existing record with the exact same ID
    const updated = [record, ...existing.filter((item) => item.id !== record.id)].slice(
      0,
      MAX_HISTORY_RECORDS
    );

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    notifyHistoryListeners();
    return record;
  } catch (err) {
    console.warn("Failed to save investigation to localStorage:", err);
    return null;
  }
}

/**
 * Removes an individual investigation from history by ID.
 */
export function deleteHistoryItem(id: string): InvestigationHistoryRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const existing = getInvestigationHistory();
    const filtered = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    notifyHistoryListeners();
    return filtered;
  } catch (err) {
    console.warn("Failed to delete investigation history item:", err);
    return [];
  }
}

/**
 * Clears the entire investigation history from local storage.
 */
export function clearInvestigationHistory(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    notifyHistoryListeners();
  } catch (err) {
    console.warn("Failed to clear investigation history:", err);
  }
}

/**
 * Computes deterministic side-by-side comparison metrics between two investigations.
 */
export function calculateInvestigationComparison(
  investigationA: InvestigationHistoryRecord,
  investigationB: InvestigationHistoryRecord
): InvestigationComparisonMetrics {
  return {
    investigationA,
    investigationB,
    confidenceDelta: investigationA.confidenceScore - investigationB.confidenceScore,
    claimsDelta: investigationA.atomicClaimCount - investigationB.atomicClaimCount,
    sourcesDelta: investigationA.evidenceCount - investigationB.evidenceCount,
    domainsDelta: investigationA.uniqueDomainCount - investigationB.uniqueDomainCount,
    provenanceDelta: investigationA.imageCandidateCount - investigationB.imageCandidateCount,
    supportsDelta: investigationA.supportsCount - investigationB.supportsCount,
    contradictsDelta: investigationA.contradictsCount - investigationB.contradictsCount,
    verdictMatches: investigationA.overallVerdict === investigationB.overallVerdict,
  };
}
