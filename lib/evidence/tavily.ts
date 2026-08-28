/**
 * EvidenceLens - Tavily Web Search Provider
 * Phase 4: Web Evidence Retrieval
 */

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  response_time?: number;
}

export class TavilySearchClient {
  private endpoint = "https://api.tavily.com/search";

  private getApiKey(): string {
    const key = process.env.TAVILY_API_KEY;
    if (!key || key.trim().length === 0) {
      throw new Error("TAVILY_API_KEY is not configured on the server. Please configure TAVILY_API_KEY in .env.local to enable Web Evidence Retrieval.");
    }
    return key.trim();
  }

  /**
   * Executes a focused web search query via Tavily.
   */
  public async search(query: string, maxResults = 5): Promise<TavilySearchResult[]> {
    const apiKey = this.getApiKey();
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return [];
    }

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: cleanQuery,
          search_depth: "basic",
          max_results: Math.min(Math.max(maxResults, 1), 10),
          include_answer: false,
          include_raw_content: false,
        }),
        signal: AbortSignal.timeout(12000), // 12 second timeout
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Tavily API authentication failed. Verify that TAVILY_API_KEY is valid in .env.local.");
        }
        if (response.status === 429) {
          throw new Error("Tavily search rate limit exceeded. Please wait a moment before trying again.");
        }
        const errorText = await response.text();
        throw new Error(`Tavily search error (HTTP ${response.status}): ${errorText.slice(0, 200)}`);
      }

      const data = (await response.json()) as TavilySearchResponse;
      return Array.isArray(data.results) ? data.results : [];
    } catch (err: unknown) {
      console.error("Tavily search exception:", err);
      const msg = err instanceof Error ? err.message : "Failed to retrieve evidence from Tavily search.";
      throw new Error(msg);
    }
  }
}

export const tavilyClient = new TavilySearchClient();
