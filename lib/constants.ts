/**
 * EvidenceLens - Core Constants & Configuration
 */

export const APP_CONFIG = {
  name: "EvidenceLens",
  tagline: "Multimodal Evidence Investigation Workbench",
  description: "A precision workbench for investigative journalists, fact-checkers, and intelligence analysts to deconstruct multimodal claims, map provenance, and verify truth with structured evidence graphs.",
  version: "1.1.0",
  phase: "Phase 11: Source Intelligence & Trust Scoring",
};

export const PIPELINE_STAGES = [
  { id: "claim_extraction", label: "Claim Extraction", desc: "Decomposes inputs into atomic verifiable claims" },
  { id: "evidence_retrieval", label: "Evidence Retrieval", desc: "Queries primary sources, archives, and news APIs" },
  { id: "media_provenance", label: "Provenance Analysis", desc: "Traces digital footprints and forensic markers" },
  { id: "graph_synthesis", label: "Evidence Graphing", desc: "Constructs relational maps linking claims to proof" },
  { id: "verdict_engine", label: "Verdict Synthesis", desc: "Calculates calibrated confidence scores and stances" },
  { id: "human_review", label: "Analyst Review", desc: "Facilitates audit trails and human-in-the-loop overrides" },
] as const;

export const SUPPORTED_MEDIA_TYPES = {
  images: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
  video: [".mp4", ".mov", ".webm"],
  documents: [".pdf", ".txt", ".docx"],
  audio: [".mp3", ".wav", ".m4a"],
};

export const INPUT_VALIDATION = {
  minClaimLength: 5,
  maxClaimLength: 2000,
  maxImageSizeBytes: 15 * 1024 * 1024, // 15MB
  maxVideoSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedImageMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  allowedVideoMimeTypes: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
};

export const VERDICT_CONFIG = {
  VERIFIED_TRUE: {
    label: "Verified True",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  SUBSTANTIALLY_TRUE: {
    label: "Substantially True",
    badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  },
  MIXTURE_OF_FACT_AND_FICTION: {
    label: "Mixed / Partially True",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  MISLEADING_CONTEXT: {
    label: "Misleading Context",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  FABRICATED_UNTRUE: {
    label: "Fabricated / False",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  UNVERIFIABLE: {
    label: "Unverifiable",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
} as const;
