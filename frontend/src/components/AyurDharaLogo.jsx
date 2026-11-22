import React from "react";

/**
 * AyurDharaLogo
 *
 * Professional healthcare & Ayurveda-inspired logo.
 * Visual concept:
 * - Central sacred leaf / drop of life (Ayur / wellness)
 * - Harmonious flanking lotus petals (Panchakarma holistic healing & purity)
 * - Elegant flowing-water base streams (Dhara - continuous therapeutic flow)
 *
 * Supports light backgrounds (default/dark variant) and dark green backgrounds (light variant).
 */
export default function AyurDharaLogo({
  size = 36,
  variant = "dark", // "dark" (green on light background) | "light" (gold/soft-green on dark background)
  withText = false,
  className = "",
  textClassName = "",
  subtitleClassName = ""
}) {
  const isLight = variant === "light";

  // Color palette definitions based on background variant
  const primaryLeaf = isLight ? "#e5f0b8" : "#19563f";
  const innerLeaf = isLight ? "#cde397" : "#2d7a58";
  const sidePetal = isLight ? "#b8dc8e" : "#438d62";
  const dharaStream = isLight ? "#d4ea9e" : "#246a4d";
  const veinStroke = isLight ? "#0f422d" : "#ffffff";

  const svgGraphic = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-label="AyurDhara Logo"
    >
      <defs>
        <linearGradient id={`leaf-grad-${variant}`} x1="22" y1="4" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryLeaf} />
          <stop offset="1" stopColor={innerLeaf} />
        </linearGradient>
        <linearGradient id={`petal-l-${variant}`} x1="8" y1="14" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor={sidePetal} />
          <stop offset="1" stopColor={innerLeaf} />
        </linearGradient>
        <linearGradient id={`petal-r-${variant}`} x1="36" y1="14" x2="26" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor={sidePetal} />
          <stop offset="1" stopColor={innerLeaf} />
        </linearGradient>
        <linearGradient id={`stream-grad-${variant}`} x1="6" y1="35" x2="38" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor={dharaStream} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={primaryLeaf} />
          <stop offset="1" stopColor={dharaStream} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Flanking Lotus Petals */}
      <path
        d="M13 14.5C9 17.5 6.5 22 7.8 26.5C8.8 29.8 12.5 30.5 16.5 29C14.8 25.5 13.8 20.8 15 15.8"
        fill={`url(#petal-l-${variant})`}
        opacity="0.9"
      />
      <path
        d="M31 14.5C35 17.5 37.5 22 36.2 26.5C35.2 29.8 31.5 30.5 27.5 29C29.2 25.5 30.2 20.8 29 15.8"
        fill={`url(#petal-r-${variant})`}
        opacity="0.9"
      />

      {/* Central Ayurvedic Healing Leaf / Flame of Life */}
      <path
        d="M22 4C22 4 15.5 13 15.5 20.5C15.5 24.5 18.4 27.5 22 27.5C25.6 27.5 28.5 24.5 28.5 20.5C28.5 13 22 4 22 4Z"
        fill={`url(#leaf-grad-${variant})`}
      />

      {/* Gentle leaf spine */}
      <path
        d="M22 11V23"
        stroke={veinStroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={isLight ? "0.8" : "0.75"}
      />

      {/* Flowing Water (Dhara) Stream Foundation */}
      <path
        d="M7 34C12 32 17 36 22 34C27 32 32 36 37 34"
        stroke={`url(#stream-grad-${variant})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M11 38C15 36.5 18.5 39.5 22 38.2C25.5 37 29 39.8 33 38.2"
        stroke={`url(#stream-grad-${variant})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );

  if (!withText) {
    return svgGraphic;
  }

  return (
    <div className="flex items-center gap-[11px] select-none">
      {svgGraphic}
      <div className="flex flex-col">
        <strong
          className={`font-['Playfair_Display',Georgia,serif] text-[17px] tracking-[0.08em] font-bold leading-tight ${
            isLight ? "text-white" : "text-[#194b35]"
          } ${textClassName}`}
        >
          AYURDHARA
        </strong>
        <span
          className={`text-[10px] tracking-[0.04em] ${
            isLight ? "text-[#c4d9c8]" : "text-[#738477]"
          } ${subtitleClassName}`}
        >
          Panchakarma Care
        </span>
      </div>
    </div>
  );
}
