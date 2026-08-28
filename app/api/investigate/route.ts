import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Not Implemented",
      message: "Investigation engine is scheduled for Phase 2 implementation. The pipeline endpoints will support multimodal claim extraction, evidence retrieval, and verdict synthesis.",
      phase: "Phase 1: Project Foundation",
    },
    { status: 501 }
  );
}
