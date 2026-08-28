"use client";

import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";

interface InvestigationCoreEffectProps {
  isInvestigating: boolean;
  isComplete: boolean;
  verdict?: string | null;
}

export const InvestigationCoreEffect: React.FC<InvestigationCoreEffectProps> = ({
  isInvestigating,
  isComplete,
  verdict,
}) => {
  const getVerdictGlowColor = () => {
    switch (verdict) {
      case "VERIFIED":
        return "border-[#10B981]/50 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      case "FALSE":
        return "border-[#EF4444]/50 text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]";
      case "MIXED":
        return "border-[#F59E0B]/50 text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      default:
        return "border-[#D4AF37]/30 text-[#E2C15C] shadow-[0_0_15px_rgba(212,175,55,0.2)]";
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Outer Orbit Particle Ring when Investigating */}
      {isInvestigating && (
        <div
          className="absolute inset-[-4px] rounded-xl border border-[#D4AF37]/40 pointer-events-none animate-spin"
          style={{ animationDuration: "6s" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#E2C15C] shadow-[0_0_8px_#D4AF37]" />
        </div>
      )}

      {/* Core Body */}
      <div
        className={`flex items-center gap-2.5 bg-[#0D1017] px-4 py-2.5 rounded-xl font-mono text-xs transition-all duration-500 shadow-lg shadow-black/40 ${
          isInvestigating
            ? "border border-[#D4AF37]/60 text-[#E2C15C] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            : isComplete
            ? getVerdictGlowColor()
            : "border border-[#D4AF37]/20 text-[#E2C15C]"
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            isInvestigating
              ? "bg-[#E2C15C] animate-ping"
              : isComplete && verdict === "VERIFIED"
              ? "bg-[#10B981] shadow-[0_0_8px_#10B981]"
              : isComplete && verdict === "FALSE"
              ? "bg-[#EF4444] shadow-[0_0_8px_#EF4444]"
              : isComplete && verdict === "MIXED"
              ? "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]"
              : "bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]"
          }`}
        />

        {isComplete ? (
          <ShieldCheck className="h-3.5 w-3.5" />
        ) : (
          <Cpu className="h-3.5 w-3.5 text-[#D4AF37]" />
        )}

        <span>
          {isInvestigating
            ? "Investigation Core: Actively Verifying"
            : isComplete
            ? `Forensic Verdict: ${verdict || "SYNTHESIZED"}`
            : "Target Pipeline: Multi-source Grounding"}
        </span>
      </div>
    </div>
  );
};
