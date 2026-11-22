import React from "react";

export default function AyurDharaLogo({
  size = 48,
  variant = "dark",
  withText = false,
  className = "",
  textClassName = "",
  subtitleClassName = ""
}) {
  const light = variant === "light";

  const colors = {
    leaf: light ? "#E6F0B9" : "#15583C",
    leafInner: light ? "#B9D88B" : "#39845B",
    lotus: light ? "#D3E9A0" : "#6AA879",
    water: light ? "#D9EAA8" : "#267451",
    vein: light ? "#FFFFFF" : "#F5F8EA"
  };

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      role="img"
      aria-label="AyurDhara emblem"
    >
      <defs>
        <linearGradient id="ayurLeaf" x1="32" y1="5" x2="32" y2="43">
          <stop stopColor={colors.leaf} />
          <stop offset="1" stopColor={colors.leafInner} />
        </linearGradient>
      </defs>

      {/* Left lotus petal */}
      <path
        d="M29 37C15 37 8 29 10 18C21 19 29 26 29 37Z"
        fill={colors.lotus}
      />

      {/* Right lotus petal */}
      <path
        d="M35 37C49 37 56 29 54 18C43 19 35 26 35 37Z"
        fill={colors.lotus}
      />

      {/* Central leaf */}
      <path
        d="M32 5C23 16 17 27 20 36C22 43 28 46 32 46C36 46 42 43 44 36C47 27 41 16 32 5Z"
        fill="url(#ayurLeaf)"
      />

      {/* Leaf vein */}
      <path
        d="M32 17V40"
        stroke={colors.vein}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Flowing Dhara */}
      <path
        d="M8 49C17 44 24 54 32 49C40 44 47 54 56 49"
        stroke={colors.water}
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M14 56C21 52 26 59 32 56C38 53 43 59 50 56"
        stroke={colors.water}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!withText) return icon;

  return (
    <div className="flex items-center gap-3 select-none">
      {icon}

      <div className="flex flex-col">
        <strong
          className={`font-['Playfair_Display',serif] text-[21px] font-bold tracking-wide leading-tight ${light ? "text-white" : "text-[#15583C]"
            } ${textClassName}`}
        >
          AYURDHARA
        </strong>

        <span
          className={`text-[11px] mt-1 ${light ? "text-[#D3E6D5]" : "text-[#758879]"
            } ${subtitleClassName}`}
        >
          Panchakarma Care
        </span>
      </div>
    </div>
  );
}