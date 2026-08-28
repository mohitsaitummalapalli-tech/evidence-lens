# EvidenceLens

**Multimodal Claim Verification & Provenance Workbench**  
*Built for Problem Statement 3 (PS3)*

EvidenceLens is a precision workbench for investigative journalists, fact-checkers, and intelligence analysts. It decomposes multimodal inputs (text, image, audio, video, documents) into atomic claims, retrieves cross-domain evidence with source credibility scoring, maps digital provenance, and synthesizes structured evidence graphs with human-in-the-loop auditability.

---

## 🎯 Phase 1: Project Foundation (Current Scope)

Phase 1 provides the production-ready Next.js foundation, architectural contracts, and baseline workbench interface:

- ✅ **Framework**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- ✅ **Component Hierarchy**: Modular layouts, input sections, media ingestion placeholders, and investigation workspace grid
- ✅ **Type Definitions (`types/`)**: Strongly-typed schemas for Claims, Evidence Sources, Stance, Provenance Records, and Investigation Sessions
- ✅ **Backend Stubs (`lib/` & `app/api/`)**: AI client, evidence retrieval, verification engine contracts, and `/api/health` + `/api/investigate` routes
- ✅ **Deployment Ready**: Zero extraneous dependencies, strict TypeScript adherence, Vercel-deployable out of the box
- ✅ **Error & Fallback Handling**: Dedicated `error.tsx`, `loading.tsx`, and `not-found.tsx` handlers

---

## 🏗️ Architecture & Directory Structure

```
├── app/
│   ├── api/
│   │   ├── health/route.ts        # Healthcheck endpoint (v0.1.0 telemetry)
│   │   └── investigate/route.ts   # Pipeline endpoint (Phase 2 stub)
│   ├── error.tsx                  # Global error boundary
│   ├── globals.css                # Tailwind base styles & dark theme
│   ├── layout.tsx                 # Root layout with Header & Footer
│   ├── loading.tsx                # Loading skeleton state
│   ├── not-found.tsx              # 404 handler
│   └── page.tsx                   # Main EvidenceLens Workbench UI
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # App navigation, telemetry badges, brand
│   │   └── Footer.tsx             # Status bar, architecture metadata
│   └── workbench/
│       ├── ClaimInputSection.tsx  # Text claim & context input
│       ├── MediaUploadSection.tsx # Multimodal artifact dropzone (Phase 2 ready)
│       ├── InvestigationControls.tsx # Action bar & session controls
│       ├── PipelineOverview.tsx   # Visual 6-stage architecture breakdown
│       ├── WorkspacePlaceholder.tsx # 3-column empty workspace state
│       └── EvidenceLensWorkbench.tsx # Workbench container
├── lib/
│   ├── ai/client.ts               # AI pipeline client wrapper
│   ├── evidence/retrieval.ts      # Evidence retrieval service stub
│   ├── verification/engine.ts     # Verdict & graph synthesis stub
│   └── constants.ts               # Core metadata, verdict maps, pipeline stages
├── types/
│   ├── claim.ts                   # Claim & extraction types
│   ├── evidence.ts                # Evidence sources, snippets & provenance types
│   ├── investigation.ts           # Session, verdict, graph & review types
│   └── index.ts                   # Barrel export
├── .env.local.example             # Environment configuration template
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.18.0
- **npm** (or pnpm / yarn / bun)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd evidencelens
npm install
```

### 2. Environment Configuration

Copy the sample environment file:

```bash
cp .env.local.example .env.local
```

Configure your API keys as needed for future phases:
- `GEMINI_API_KEY` (For multimodal reasoning & claim deconstruction)
- `TAVILY_API_KEY` / `SERPER_API_KEY` (For evidence retrieval)
- `NEXT_PUBLIC_APP_URL` (`http://localhost:3000`)

### 3. Local Development

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Build

To verify type safety, linting, and production builds:

```bash
# Typecheck and linting
npm run lint

# Production compilation test
npm run build

# Start production server locally
npm run start
```

---

## 🌐 Vercel Deployment

EvidenceLens is architected to deploy directly to Vercel with zero custom server dependencies:

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
3. The framework preset will automatically detect **Next.js**.
4. Configure environment variables in the Vercel project settings (from `.env.local.example`).
5. Click **Deploy**.

---

## 🗺️ Roadmap (Upcoming Phases)

- **Phase 2: Multimodal Claim Extraction** — Gemini multimodal extraction for text, images, video transcripts, and PDFs.
- **Phase 3: Evidence Retrieval & Provenance** — Web search integration, fact-checking database queries, and reverse image matching.
- **Phase 4: Evidence Graphing & Visual Topology** — Relational graph visualization linking claims to supporting/refuting proof.
- **Phase 5: Verdict Engine & Synthesis** — Calibrated confidence scoring, stance analysis, and executive report generation.
- **Phase 6: Human Review & Audit Trail** — Analyst overrides, immutable review logs, and exportable PDF/JSON dossiers.
