import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    name: APP_CONFIG.name,
    tagline: APP_CONFIG.tagline,
    version: APP_CONFIG.version,
    phase: APP_CONFIG.phase,
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
