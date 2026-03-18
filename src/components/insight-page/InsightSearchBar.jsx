"use client";

import React from "react";
import { Search } from "lucide-react";

const InsightSearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative w-full max-w-3xl">
      <input
        type="text"
        placeholder="Search for AI, Transformation, Data..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5383] focus:border-transparent"
        aria-label="Search articles"
      />
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#4a5383] text-white rounded-full hover:bg-[#3d4572] transition-colors"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    </div>
  );
};

export default InsightSearchBar;
