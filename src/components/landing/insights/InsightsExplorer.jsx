"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import InsightCards from "./InsightCards";
import styles from "./Insights.module.css";

// Client half of the home-page Insights section: owns the search box and
// filters over the posts handed down from the server component. The posts come
// from the CMS (see Insights.jsx), not a hardcoded list.
export default function InsightsExplorer({ posts = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();
  const filteredInsights = query
    ? posts.filter(
        (insight) =>
          insight.title?.toLowerCase().includes(query) ||
          insight.description?.toLowerCase().includes(query) ||
          insight.tag?.toLowerCase().includes(query),
      )
    : posts;

  return (
    <section className={styles.section}>
      <div className="w-full max-w-[1180px] px-4 sm:px-6 md:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#0f172a] text-center mb-2">
            Insights
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#475569] text-center mb-4 px-2">
            Expert perspectives on enterprise transformation, AI, and digital
            innovation
          </p>

          {/* Search Bar – keep your custom CSS */}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search for AI, Transformation, Data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.input}
            />
            <button className={styles.searchButton} aria-label="Search insights">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#666666]">
            New insights are on the way — check back soon.
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {filteredInsights.map((insight) => (
              <InsightCards
                key={insight.id}
                {...insight}
                comingSoon={insight.comingSoon}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#666666]">
            No insights found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}
