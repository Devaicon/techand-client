import React from "react";

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

// Reusable Read Time Component
export const ReadTime = ({ minutes = 5, className = "" }) => {
  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      {minutes} min read
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
