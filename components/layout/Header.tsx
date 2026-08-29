"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>("INVESTIGATE");

  const navItems = [
    { id: "INVESTIGATE", label: "INVESTIGATE", href: "#claim-input-section" },
    { id: "EVIDENCE", label: "EVIDENCE", href: "#evidence-panel" },
    { id: "GRAPH", label: "GRAPH", href: "#evidence-graph-panel" },
    { id: "AUDIT TRAIL", label: "AUDIT TRAIL", href: "#investigation-timeline-panel" },
    { id: "HISTORY", label: "HISTORY", href: "#investigation-history-panel" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050607]/95 backdrop-blur-md border-b border-[rgba(212,175,90,0.2)] font-mono">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-9 w-9 rounded-md bg-[#0D0F12] border border-[rgba(212,175,90,0.4)] group-hover:border-[#D4AF5A] flex items-center justify-center transition-all shadow-[0_0_12px_rgba(200,162,74,0.12)]">
            <Shield className="h-4.5 w-4.5 text-[#D4AF5A]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-widest text-[#F5F7FA] group-hover:text-[#D4AF5A] transition-colors">
                EVIDENCE<span className="text-[#D4AF5A]">LENS</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] font-semibold tracking-wider">
                CORE
              </span>
            </div>
            <span className="text-[10px] text-[#8D949D] font-sans font-normal hidden sm:block tracking-tight">
              Multimodal Truth Verification & Grounded Evidence Engine
            </span>
          </div>
        </Link>

        {/* Center: Workbench Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`py-1 relative transition-colors tracking-wider ${
                  isActive
                    ? "text-[#D4AF5A] font-bold"
                    : "text-[#D7DADF] hover:text-[#F5F7FA]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C8A24A] via-[#E1C16E] to-[#A98532]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Telemetry & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] text-xs text-[#D7DADF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[#8D949D] font-medium">STATUS:</span>
            <span className="text-[#D4AF5A] font-bold tracking-wider">ONLINE</span>
            <span className="text-[#8D949D]">•</span>
            <span className="text-[#D7DADF] text-[11px] font-semibold">PS3 CONSENSUS ENGINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0D0F12] border border-[rgba(212,175,90,0.3)] text-[11px] text-[#D4AF5A]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-bold">v1.2.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};
