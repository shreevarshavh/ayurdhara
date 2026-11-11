
import React from "react";

const iconPaths = {
  leaf: (
    <>
      <path d="M20 4C10 4 4 9 4 17C4 20 6 21 9 20C17 18 21 11 20 4Z" />
      <path d="M5 21C9 16 14 11 19 5" />
      <path d="M10 16L9 12" />
      <path d="M14 12L14 8" />
    </>
  ),

  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3H15V4" />
      <path d="M9 10H15M9 14H15M9 18H13" />
    </>
  ),

  chart: (
    <>
      <path d="M4 20V12" />
      <path d="M10 20V7" />
      <path d="M16 20V10" />
      <path d="M22 20V3" />
      <path d="M2 20H23" />
    </>
  ),

  calendar: (
    <>
      <rect x="3" y="5" width="18" height="17" rx="2.5" />
      <path d="M8 3V7M16 3V7" />
      <path d="M3 10H21" />
      <path d="M8 14H8.01M12 14H12.01M16 14H16.01" />
      <path d="M8 18H8.01M12 18H12.01M16 18H16.01" />
    </>
  ),

  check: (
    <>
      <path d="M4 12L9 17L20 6" />
    </>
  ),

  sprout: (
    <>
      <path d="M12 21V11" />
      <path d="M12 13C12 7 8 4 3 4C3 10 6 14 12 14" />
      <path d="M12 10C12 5 16 3 21 3C21 9 18 12 12 12" />
    </>
  ),

  bolt: (
    <path d="M13 2L4 13H11L10 22L20 10H13L13 2Z" />
  )
};

export default function AyurDharaIcon({
  name = "leaf",
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className = ""
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, flexShrink: 0 }}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {iconPaths[name] || iconPaths.leaf}
      </g>
    </svg>
  );
}
