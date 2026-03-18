"use client";

import React, { useState, useMemo } from "react";
import InsightSearchBar from "./InsightSearchBar";
import InsightCard from "./InsightCard";
import {
  filterPosts,
  matchesCategoryFilter,
  matchesSearchQuery,
} from "./insightUtils";

const FEATURED_POST = {
  image: "/Hero-img.webp",
  category: "Digital Transformation",
  title: "Value Driven Innovation through Automation",
  description:
    "Tech& helps GCC enterprises move beyond the limits of traditional CRM & ERP software. Digital transformation is measured by quantifiable business impact.",
  link: "/insights/value-driven-innovation-automation",
  tags: ["Digital Transformation", "Automation", "ROI"],
};

const BLOG_POSTS = [
  {
    image: "/hero-img3.webp",
    category: "AI",
    title: "Agentic AI is Revolutionizing the Industries",
    description:
      "Stop struggling with disconnected data systems. We apply Agentic AI to banking, retail, and other GCC industries.",
    link: "/insights/agentic-ai",
    tags: ["AI", "Automation", "Enterprise AI"],
  },
  {
    image: "/hero-img4.webp",
    category: "Data",
    title: "Data is Going to Be Your New Sovereign Asset",
    description:
      "Your company's data is your most valuable resource. We solve the problem of data silos by building a unified platform.",
    link: "/insights/data-sovereign-asset",
    tags: ["Data", "Analytics", "Business Intelligence"],
  },
  {
    image: "/hero-img2.webp",
    category: "AI",
    title:
      "How Customer Service Teams Are Achieving a 20% to 45% Increase in Productivity with AI",
    description:
      "Companies using AI-driven tools like Microsoft Copilot see a 20% to 45% increase in the speed of resolving customer inquiries.",
    link: "/insights/autonomous-ai-customer-service",
    tags: ["AI", "Customer Service", "Productivity"],
  },
];

const BlogInsights = () => {
  const [activeCategory, setActiveCategory] = useState("View all");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filter logic using utility function
  const filteredPosts = useMemo(
    () => filterPosts(BLOG_POSTS, activeCategory, searchQuery),
    [activeCategory, searchQuery],
  );

  // Check if featured post matches filters using utility functions
  const displayFeaturedPost = useMemo(
    () =>
      matchesCategoryFilter(FEATURED_POST, activeCategory) &&
      matchesSearchQuery(FEATURED_POST, searchQuery),
    [activeCategory, searchQuery],
  );

  return (
    <section
      style={{ background: "#FEF9F3" }}
      className="py-8 sm:py-8 md:py-8 lg:py-8 flex justify-center px-4"
    >
      <div className="w-full max-w-[1200px] lg:w-[70%]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            News and insights
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Learn about enterprise innovation, AI adoption, platform
            modernization,
            <br className="hidden sm:block" />
            and strategies for driving measurable business outcomes.
          </p>
        </div>

        {/* Search Bar and Filters Container */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <InsightSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <InsightCard
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            featuredPost={FEATURED_POST}
            posts={filteredPosts}
            showFeatured={displayFeaturedPost}
          />
        </div>
      </div>
    </section>
  );
};

export default BlogInsights;
