"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const GeminiLogo: React.FC<LogoProps> = ({ className = "h-3.5 w-3.5", size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Google Gemini"
  >
    <path
      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
      fill="currentColor"
    />
  </svg>
);

export const TavilyLogo: React.FC<LogoProps> = ({ className = "h-3.5 w-3.5", size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Tavily Search API"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
    <path
      d="M12 6V18M6 12H18M7.757 7.757L16.243 16.243M7.757 16.243L16.243 7.757"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const OpenAILogo: React.FC<LogoProps> = ({ className = "h-3.5 w-3.5", size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="OpenAI"
  >
    <path d="M12 2a4 4 0 0 0-3.8 2.74A4 4 0 0 0 4.3 7.3a4 4 0 0 0-.2 4.69A4 4 0 0 0 5.6 15.6a4 4 0 0 0 2.6 3.8A4 4 0 0 0 12 22a4 4 0 0 0 3.8-2.74 4 4 0 0 0 3.9-2.56 4 4 0 0 0 .2-4.69 4 4 0 0 0-1.5-3.61 4 4 0 0 0-2.6-3.8A4 4 0 0 0 12 2z" />
    <path d="M12 6v6l5 3" />
  </svg>
);

export const AnthropicLogo: React.FC<LogoProps> = ({ className = "h-3.5 w-3.5", size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Anthropic Claude"
  >
    <path d="M13.8 3h-3.6L4.5 21h3.7l1.3-3.8h5l1.3 3.8h3.7L13.8 3zm-3.3 11.2l1.5-4.6 1.5 4.6h-3z" />
  </svg>
);
