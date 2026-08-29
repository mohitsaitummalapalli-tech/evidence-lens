import { NextRequest, NextResponse } from "next/server";
import { INPUT_VALIDATION } from "@/lib/constants";
import { geminiService } from "@/lib/ai/gemini";
import { evidenceRetrievalService } from "@/lib/evidence/retrieval";
import { verificationReasoningService } from "@/lib/verification/reasoning";
import { imageProvenanceService } from "@/lib/evidence/imageProvenance";
import { matchMultimodalMedia } from "@/lib/evidence/mediaMatcher";
import { multiAIConsensusEngine } from "@/lib/ai/consensusEngine";
import {
  AtomicClaim,
  ClaimExtractionResult,
  EvidenceRetrievalResult,
  InvestigationInputResponse,
  InvestigationVerificationResult,
  ImageProvenanceResult,
  MultiAIConsensusResult,
  MultimodalMediaMatchSummary,
} from "@/types";

export async function POST(req: NextRequest) {
  try {
    let claim = "";
    let contextUrl: string | undefined = undefined;
    let mediaInfo: {
      type: "image" | "video";
      filename: string;
      mimeType: string;
      sizeBytes: number;
      buffer?: Buffer;
    } | undefined = undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      claim = (formData.get("claim") as string || "").trim();
      const rawContextUrl = formData.get("contextUrl") as string | null;
      if (rawContextUrl && rawContextUrl.trim().length > 0) {
        contextUrl = rawContextUrl.trim();
      }

      const file = formData.get("media") as File | null;
      if (file && file.size > 0 && typeof file.name === "string") {
        const mimeType = file.type;
        const sizeBytes = file.size;
        const filename = file.name.slice(0, 150);

        const isImage = INPUT_VALIDATION.allowedImageMimeTypes.includes(mimeType);
        const isVideo = INPUT_VALIDATION.allowedVideoMimeTypes.includes(mimeType);

        if (!isImage && !isVideo) {
          return NextResponse.json(
            {
              success: false,
              error: `Unsupported media format: '${mimeType || "unknown"}'. Allowed formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.`,
            },
            { status: 400 }
          );
        }

        if (isImage && sizeBytes > INPUT_VALIDATION.maxImageSizeBytes) {
          const maxMb = INPUT_VALIDATION.maxImageSizeBytes / (1024 * 1024);
          return NextResponse.json(
            {
              success: false,
              error: `Image exceeds the ${maxMb}MB size limit. Received ${(sizeBytes / (1024 * 1024)).toFixed(2)}MB.`,
            },
            { status: 400 }
          );
        }

        if (isVideo && sizeBytes > INPUT_VALIDATION.maxVideoSizeBytes) {
          const maxMb = INPUT_VALIDATION.maxVideoSizeBytes / (1024 * 1024);
          return NextResponse.json(
            {
              success: false,
              error: `Video exceeds the ${maxMb}MB size limit. Received ${(sizeBytes / (1024 * 1024)).toFixed(2)}MB.`,
            },
            { status: 400 }
          );
        }

        let buffer: Buffer | undefined = undefined;
        if (isImage) {
          const arrayBuffer = await file.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        }

        mediaInfo = {
          type: isImage ? "image" : "video",
          filename,
          mimeType,
          sizeBytes,
          buffer,
        };
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      claim = (body.claim || "").trim();
      if (body.contextUrl && typeof body.contextUrl === "string") {
        contextUrl = body.contextUrl.trim();
      }
      if (body.media) {
        mediaInfo = {
          type: body.media.type === "video" ? "video" : "image",
          filename: String(body.media.filename || "media-file").slice(0, 150),
          mimeType: String(body.media.mimeType || "application/octet-stream"),
          sizeBytes: Number(body.media.sizeBytes) || 0,
        };
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request encoding. Expected multipart/form-data or application/json.",
        },
        { status: 400 }
      );
    }

    // Validate claim text
    if (!claim || claim.length < INPUT_VALIDATION.minClaimLength) {
      return NextResponse.json(
        {
          success: false,
          error: `A target claim of at least ${INPUT_VALIDATION.minClaimLength} characters is required.`,
        },
        { status: 400 }
      );
    }

    if (claim.length > INPUT_VALIDATION.maxClaimLength) {
      return NextResponse.json(
        {
          success: false,
          error: `Claim exceeds the maximum allowed length of ${INPUT_VALIDATION.maxClaimLength} characters.`,
        },
        { status: 400 }
      );
    }

    // Verify Gemini API key presence
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured on the server. Please configure your key in .env.local to enable AI Claim Extraction.",
        },
        { status: 500 }
      );
    }

    // Step 1: AI Atomic Claim Extraction (Graceful Fallback Boundary)
    let extractionResult: ClaimExtractionResult;
    try {
      extractionResult = await geminiService.extractAtomicClaims({
        claim,
        contextUrl,
        media: mediaInfo,
      });
    } catch (err: unknown) {
      console.warn("Gemini extraction error in route, using fallback single-claim deconstruction:", err);
      extractionResult = {
        originalClaim: claim,
        contextUrl,
        claims: [
          {
            id: "C1",
            text: claim,
            category: "event",
            checkability: "medium",
            entities: [],
          },
        ],
        overallExtractionNotes: "Claim extraction operating in resilient direct mode.",
      };
    }

    // Step 2: Multi-Source Web Evidence Retrieval & Stance Grounding (Graceful Error Boundary)
    let evidenceResult: EvidenceRetrievalResult;
    try {
      if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY.trim().length === 0) {
        evidenceResult = {
          status: "error",
          error: "TAVILY_API_KEY is not configured on the server. Please configure TAVILY_API_KEY in .env.local to enable Web Evidence Retrieval.",
          totalSourcesFound: 0,
          bundles: extractionResult.claims.map((c: AtomicClaim) => ({
            claimId: c.id,
            claimText: c.text,
            query: c.text,
            sources: [],
          })),
          allSources: [],
          retrievedAt: new Date().toISOString(),
        };
      } else {
        evidenceResult = await evidenceRetrievalService.retrieveEvidenceForClaims(
          extractionResult.claims,
          contextUrl
        );
      }
    } catch (err: unknown) {
      console.warn("Evidence retrieval error in route:", err);
      const errMsg = err instanceof Error ? err.message : "Evidence retrieval service encountered an error.";
      evidenceResult = {
        status: "error",
        error: errMsg,
        totalSourcesFound: 0,
        bundles: extractionResult.claims.map((c: AtomicClaim) => ({
          claimId: c.id,
          claimText: c.text,
          query: c.text,
          sources: [],
        })),
        allSources: [],
        retrievedAt: new Date().toISOString(),
      };
    }

    // Step 3: Evidence Reasoning & Deterministic Claim Verification
    let verificationResult: InvestigationVerificationResult;
    try {
      verificationResult = await verificationReasoningService.executeVerificationPipeline(
        extractionResult.claims,
        evidenceResult.bundles
      );
    } catch (err: unknown) {
      console.warn("Verification reasoning pipeline error:", err);
      // Fallback verification object
      const fallbackClaims = extractionResult.claims.map((c: AtomicClaim) => ({
        claimId: c.id,
        claimText: c.text,
        verdict: "UNVERIFIED" as const,
        confidence: "LOW" as const,
        reasoning: "Reasoning engine encountered an error; claim remains unverified.",
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        evidenceCount: 0,
      }));
      verificationResult = {
        overallVerdict: "UNVERIFIED",
        overallConfidence: "LOW",
        overallSummary: "Evidence reasoning service was unable to evaluate claims. Verification status is unverified.",
        claimVerifications: fallbackClaims,
        claimBreakdown: {
          total: fallbackClaims.length,
          verifiedTrue: 0,
          refutedFalse: 0,
          mixed: 0,
          unverified: fallbackClaims.length,
        },
        verifiedAt: new Date().toISOString(),
      };
    }

    // Step 4: Web & Media Provenance Discovery (if media artifact provided)
    let imageProvenanceResult: ImageProvenanceResult | undefined = undefined;
    let mediaMatchResult: MultimodalMediaMatchSummary | undefined = undefined;
    if (mediaInfo) {
      try {
        imageProvenanceResult = await imageProvenanceService.discoverProvenance({
          hasImage: mediaInfo.type === "image",
          hasMedia: true,
          mediaType: mediaInfo.type === "video" ? "video" : "image",
          filename: mediaInfo.filename,
          mimeType: mediaInfo.mimeType,
          claimText: claim,
          atomicClaims: extractionResult.claims,
          contextUrl,
        });
      } catch (err: unknown) {
        console.warn("[API] Media provenance discovery error:", err);
      }

      // Step 4B: Exact & Highly Similar Multimodal Media Match (Phase 14)
      try {
        mediaMatchResult = await matchMultimodalMedia({
          hasMedia: true,
          mediaType: mediaInfo.type === "video" ? "video" : "image",
          filename: mediaInfo.filename,
          mimeType: mediaInfo.mimeType,
          claimText: claim,
          atomicClaims: extractionResult.claims,
          contextUrl,
        });
      } catch (err: unknown) {
        console.warn("[API] Multimodal media match error:", err);
      }
    }

    // Step 5: Multi-AI Evidence Consensus Engine (Phase 12)
    let consensusResult: MultiAIConsensusResult | undefined = undefined;
    try {
      consensusResult = await multiAIConsensusEngine.evaluateConsensus(
        extractionResult.claims,
        evidenceResult.bundles
      );
    } catch (err: unknown) {
      console.warn("[API] Multi-AI consensus engine error:", err);
    }

    const sessionId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    const safeMediaInfo = mediaInfo
      ? {
          type: mediaInfo.type,
          filename: mediaInfo.filename,
          mimeType: mediaInfo.mimeType,
          sizeBytes: mediaInfo.sizeBytes,
        }
      : undefined;

    const responseData: InvestigationInputResponse = {
      success: true,
      stage: "verified",
      sessionId,
      timestamp,
      message: `Verified assertion: ${verificationResult.overallVerdict} (${verificationResult.overallSummary})`,
      input: {
        claim,
        claimReceived: true,
        contextUrlReceived: Boolean(contextUrl),
        contextUrl: contextUrl || undefined,
        mediaReceived: Boolean(safeMediaInfo),
        media: safeMediaInfo,
      },
      extraction: extractionResult,
      evidence: evidenceResult,
      verification: verificationResult,
      imageProvenance: imageProvenanceResult,
      consensus: consensusResult,
      multiAIConsensus: consensusResult,
      mediaMatch: mediaMatchResult,
      nextStage: "Phase 14: Exact Multimodal Media Match",
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("API /api/investigate error:", error);
    const rawMessage = error instanceof Error ? error.message : "Internal server error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: rawMessage.replace(/[A-Za-z0-9_-]{20,}/g, "[REDACTED]"),
      },
      { status: 500 }
    );
  }
}
