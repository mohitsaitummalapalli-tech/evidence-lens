"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  opacityDelta: number;
  color: string;
}

const GOLD_PALETTES = [
  "rgba(212, 175, 55, ", // Classic metallic gold
  "rgba(226, 193, 92, ", // Bright gold
  "rgba(243, 229, 184, ", // Pale gold shimmer
  "rgba(179, 143, 36, ", // Dark bronze gold
];

export const FloatingParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionPreference = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionPreference);

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize sparse, subtle particles (15-20 particles max for calm forensic ambiance)
    const particleCount = Math.min(22, Math.max(12, Math.floor((width * height) / 60000)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const maxOp = 0.12 + Math.random() * 0.22; // Restrained opacity
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.7 + Math.random() * 1.3,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -0.05 - Math.random() * 0.2, // Very calm upward drift
        opacity: Math.random() * maxOp,
        maxOpacity: maxOp,
        opacityDelta: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        color: GOLD_PALETTES[Math.floor(Math.random() * GOLD_PALETTES.length)],
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          // Pulse opacity gently
          p.opacity += p.opacityDelta;
          if (p.opacity >= p.maxOpacity) {
            p.opacity = p.maxOpacity;
            p.opacityDelta = -Math.abs(p.opacityDelta);
          } else if (p.opacity <= 0.05) {
            p.opacity = 0.05;
            p.opacityDelta = Math.abs(p.opacityDelta);
          }

          // Wrap boundaries
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        // Draw particle with subtle ambient glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
        ctx.shadowBlur = p.size > 1.4 ? 4 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for efficiency
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
};
