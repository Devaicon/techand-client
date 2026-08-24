import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Reusable Category Badge Component
export const CategoryBadge = ({ category, variant = "primary" }) => {
  const variantStyles = {
    primary: "bg-[#37469E]",
    secondary: "bg-[#4A2D58]",
  };

  return (
    <span
      className={`inline-block px-3 py-1 ${variantStyles[variant]} text-white text-xs font-semibold rounded`}
    >
      {category}
    </span>
  );
};

// Reusable Read Time Component — pass `label` for a pre-formatted
// string (e.g. "7 min read" from the CMS), else falls back to minutes.
export const ReadTime = ({
  minutes = 5,
  label,
  onDark = false,
  className = "",
}) => {
  return (
    <span
      className={`text-sm ${onDark ? "text-gray-200" : "text-gray-500"} ${className}`}
    >
      {label || `${minutes} min read`}
    </span>
  );
};

// Reusable Card Wrapper
export const CardWrapper = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow ${className}`}
    >
      {children}
    </div>
  );
};

// Single "Read more" CTA used across every insight card. `onDark` flips the
// color scheme (white pill) for cards sitting on the purple/blue gradient
// so the whole page only ever shows one button shape, not several.
export const ReadMoreButton = ({
  href,
  children = "Read more",
  onDark = false,
  disabled = false,
  className = "",
}) => {
  const base =
    "px-5 py-2.5 rounded-lg text-sm font-semibold self-start inline-flex items-center gap-2 transition-all";

  if (disabled) {
    return (
      <button
        disabled
        className={`${base} bg-gray-300 text-gray-500 cursor-not-allowed opacity-70 ${className}`}
      >
        {children} <ArrowRight size={16} />
      </button>
    );
  }

  const theme = onDark
    ? "bg-white text-[#37469E] hover:bg-gray-100"
    : "bg-[#37469E] text-white hover:bg-[#2d3880]";

  return (
    <Link href={href} className={`${base} ${theme} ${className}`}>
      {children} <ArrowRight size={16} />
    </Link>
  );
};
