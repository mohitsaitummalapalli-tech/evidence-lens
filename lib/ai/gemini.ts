/**
 * EvidenceLens - Server-side Gemini AI Service
 * Phase 3: Multimodal Atomic Claim Extraction
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AtomicClaim, ClaimExtractionResult } from "@/types";

export interface ClaimExtractionInput {
  claim: string;
  contextUrl?: string;
  media?: {
    type: "image" | "video";
    filename: string;
    mimeType: string;
    sizeBytes: number;
    buffer?: Buffer;
  };
}

const CLAIM_EXTRACTION_SYSTEM_INSTRUCTION = `You are the Claim Deconstruction Engine for EvidenceLens, a professional multimodal investigative verification workbench.

YOUR MISSION:
Decompose the user's input assertion into distinct, atomic, verifiable claim units that can each be independently fact-checked.

EXTRACTION RULES:
1. ATOMICITY: Split compound sentences, multi-part accusations, and nested narratives into atomic units (each containing exactly one verifiable fact or assertion).
2. ACCURACY & FIDELITY: Strictly preserve the original meaning, context, dates, numbers, named entities, and locations. Do NOT invent new facts, extrapolate beyond what is stated, or add extraneous context.
3. CLAIM CATEGORIES:
   - "event": Specific real-world occurrences or happenings.
   - "time": Temporal references, dates, or sequences.
   - "location": Geographic places, landmarks, coordinates, or structures.
   - "identity": Individuals, organizations, entities, or affiliations.
   - "media_context": Assertions linking the provided media (e.g., photo/video) to an event (e.g. "This image depicts X").
   - "causal": Cause-and-effect claims (e.g., "Event A caused Event B").
   - "other": Uncategorized or ambiguous assertions.
4. CHECKABILITY:
   - "high": Clear empirical facts (dates, locations, named casualties, official statements).
   - "medium": Subjective adjectives or partially observable circumstances.
   - "low": Broad opinions, speculative intentions, or unverifiable sentiments.
5. NO TRUTH VERDICTS: You must NEVER evaluate whether a claim is true or false. Only extract and structure the claims.
6. NUMBERING: ID each atomic claim sequentially as "C1", "C2", "C3", etc.
7. DEPENDENCY MAPPING: If claim C2 logically depends on C1 being true (e.g. "The fire started in the kitchen" depends on "There was a fire"), set dependsOn: ["C1"].`;

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private primaryModel = "gemini-3.6-flash";

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error("GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in .env.local.");
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Deconstructs a raw multimodal investigation input into atomic claims.
   */
  public async extractAtomicClaims(
    input: ClaimExtractionInput
  ): Promise<ClaimExtractionResult> {
    const ai = this.getClient();

    const parts: Array<
      | string
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    // If an image is provided with buffer, attach it for multimodal claim extraction
    if (input.media && input.media.type === "image" && input.media.buffer) {
      parts.push({
        inlineData: {
          mimeType: input.media.mimeType,
          data: input.media.buffer.toString("base64"),
        },
      });
    }

    // Build context prompt
    let promptText = `Target Assertion to Deconstruct:\n"${input.claim}"\n`;
    if (input.contextUrl) {
      promptText += `\nAssociated Context / Source URL: ${input.contextUrl}\n`;
    }
    if (input.media) {
      promptText += `\nAttached Artifact: ${input.media.filename} (${input.media.type}, ${input.media.mimeType}, ${(input.media.sizeBytes / 1024).toFixed(1)} KB)\n`;
      if (input.media.type === "video") {
        promptText += `Note: Video artifact metadata attached. Deconstruct claims present in the assertion text and contextual reference.\n`;
      }
    }

    promptText += `\nDeconstruct the assertion into atomic verifiable claims according to the system instructions.`;
    parts.push(promptText);

    try {
      const response = await ai.models.generateContent({
        model: this.primaryModel,
        contents: parts,
        config: {
          systemInstruction: CLAIM_EXTRACTION_SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalClaim: { type: Type.STRING },
              claims: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: [
                        "event",
                        "time",
                        "location",
                        "identity",
                        "media_context",
                        "causal",
                        "other",
                      ],
                    },
                    checkability: {
                      type: Type.STRING,
                      enum: ["high", "medium", "low"],
                    },
                    entities: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    timeReference: { type: Type.STRING },
                    locationReference: { type: Type.STRING },
                    dependsOn: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["id", "text", "category", "checkability", "entities"],
                },
              },
              overallExtractionNotes: { type: Type.STRING },
              mediaContext: { type: Type.STRING },
            },
            required: ["originalClaim", "claims"],
          },
        },
      });

      const responseText = response.text?.trim() || "";
      if (!responseText) {
        throw new Error("Gemini returned an empty response during claim extraction.");
      }

      const parsed = JSON.parse(responseText);

      // Validate parsed claims
      const claims: AtomicClaim[] = Array.isArray(parsed.claims)
        ? parsed.claims.map((c: Record<string, unknown>, idx: number) => ({
            id: String(c.id || `C${idx + 1}`),
            text: String(c.text || "").trim(),
            category: (c.category as AtomicClaim["category"]) || "event",
            checkability: (c.checkability as AtomicClaim["checkability"]) || "medium",
            entities: Array.isArray(c.entities) ? c.entities.map(String) : [],
            timeReference: c.timeReference ? String(c.timeReference) : undefined,
            locationReference: c.locationReference ? String(c.locationReference) : undefined,
            dependsOn: Array.isArray(c.dependsOn) ? c.dependsOn.map(String) : undefined,
          }))
        : [];

      if (claims.length === 0) {
        // Fallback: at minimum create one atomic claim from the original text if none returned
        claims.push({
          id: "C1",
          text: input.claim.trim(),
          category: "event",
          checkability: "medium",
          entities: [],
        });
      }

      return {
        originalClaim: parsed.originalClaim || input.claim,
        contextUrl: input.contextUrl,
        claims,
        overallExtractionNotes: parsed.overallExtractionNotes || undefined,
        mediaContext: parsed.mediaContext || undefined,
      };
    } catch (err: unknown) {
      console.error("Gemini claim extraction error:", err);
      // Clean error without leaking secret tokens
      const message = err instanceof Error ? err.message : "Failed to execute Gemini claim extraction.";
      throw new Error(message);
    }
  }
}

export const geminiService = new GeminiService();
