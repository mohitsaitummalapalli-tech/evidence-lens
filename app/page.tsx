import { EvidenceLensWorkbench } from "@/components/workbench/EvidenceLensWorkbench";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Search, Cpu, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050607] flex flex-col selection:bg-[#C8A24A]/30 selection:text-[#F5F7FA]">
      <Header />

      <main className="flex-1 w-full max-w-[1480px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Editorial Workbench Hero */}
        <section className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.35)] text-xs font-mono text-[#D4AF5A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF5A]" />
            <span className="tracking-wider uppercase font-semibold">
              Ground-Truth Verification Engine
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] leading-[1.12]">
            Autonomous Multimodal Truth & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#F5F7FA] via-[#E1C16E] to-[#D4AF5A] bg-clip-text text-transparent">
              Evidence Verification System
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#D7DADF] font-sans leading-relaxed max-w-3xl">
            Input statements, claims, or multimedia assets to perform autonomous claim decomposition, retrieval across primary web indices and video archives, exact image provenance analysis, and multi-AI consensus scoring.
          </p>

          {/* System Capability Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-[#D7DADF]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Search className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Deep Web & Video Indexing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Globe className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Multi-Source Provenance</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <Cpu className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Shared-Evidence AI Jury</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF5A]" />
              <span>Deterministic Calibration</span>
            </div>
          </div>
        </section>

        {/* Primary Operational Workbench */}
        <section id="workbench-core" className="pt-2">
          <EvidenceLensWorkbench />
        </section>
      </main>

      <Footer />
    </div>
  );
}
