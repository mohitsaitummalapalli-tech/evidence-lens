/**
 * EvidenceLens - AI Client & Pipeline Module (Stub for Phase 2+)
 * Designed for multimodal model integrations (e.g. Gemini 2.0 / Flash / Pro)
 */

export interface AIPipelineConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

/**
 * Placeholder client initialization for subsequent pipeline phases.
 * In Phase 1, AI operations are intentionally stubbed out to keep the foundation clean.
 */
export class AIClient {
  private config: AIPipelineConfig;

  constructor(config: AIPipelineConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.GEMINI_API_KEY,
      model: config.model || "gemini-2.0-flash",
      temperature: config.temperature ?? 0.1,
    };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }
}

export const aiClient = new AIClient();
