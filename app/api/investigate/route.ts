import { NextRequest, NextResponse } from "next/server";
import { INPUT_VALIDATION } from "@/lib/constants";
import { geminiService } from "@/lib/ai/gemini";
import { evidenceRetrievalService } from "@/lib/evidence/retrieval";
import { InvestigationInputResponse } from "@/types";

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

    // Verify Tavily API key presence
    if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "TAVILY_API_KEY is not configured on the server. Please configure TAVILY_API_KEY in .env.local to enable Web Evidence Retrieval.",
        },
        { status: 500 }
      );
    }

    // Step 1: AI Atomic Claim Extraction
    const extractionResult = await geminiService.extractAtomicClaims({
      claim,
      contextUrl,
      media: mediaInfo,
    });

    // Step 2: Multi-Source Web Evidence Retrieval & Stance Grounding
    const evidenceResult = await evidenceRetrievalService.retrieveEvidenceForClaims(
      extractionResult.claims,
      contextUrl
    );

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
      stage: "evidence_retrieved",
      sessionId,
      timestamp,
      message: `Decomposed into ${extractionResult.claims.length} claims and retrieved ${evidenceResult.totalSourcesFound} corroborating web evidence records.`,
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
      nextStage: "Phase 5: Evidence Graph Synthesis & Calibrated Verdicts",
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
