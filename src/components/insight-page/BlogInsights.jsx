"use client";

import React, { useState, useMemo } from "react";
import InsightSearchBar from "./InsightSearchBar";
import InsightCard from "./InsightCard";
import {
  filterPosts,
  matchesCategoryFilter,
  matchesSearchQuery,
} from "./insightUtils";

// Posts arrive as props from the Server Component above, already mapped to the
// card model and sorted newest-first by the API. This component stays a client
// component only because it owns the filter and search state.
const BlogInsights = ({ posts: allPosts = [] }) => {
  const [activeCategory, setActiveCategory] = useState("View all");
  const [searchQuery, setSearchQuery] = useState("");

  // The newest post takes the large featured card; everything after it fills
  // the 3-column grid.
  const latestPost = allPosts[0] ?? null;
  const restPosts = useMemo(() => allPosts.slice(1), [allPosts]);

  // No posts at all — render the section chrome with an empty grid rather than
  // a featured card built from `null`.

  const filteredPosts = useMemo(
    () => filterPosts(restPosts, activeCategory, searchQuery),
    [restPosts, activeCategory, searchQuery],
  );

  // Hide the featured card when the active filter or search excludes it.
  const displayFeaturedPost = useMemo(
    () =>
      Boolean(latestPost) &&
      matchesCategoryFilter(latestPost, activeCategory) &&
      matchesSearchQuery(latestPost, searchQuery),
    [latestPost, activeCategory, searchQuery],
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
            featuredPost={latestPost}
            posts={filteredPosts}
            showFeatured={displayFeaturedPost}
          />
        </div>
      </div>
    </section>
  );
};

export default BlogInsights;
