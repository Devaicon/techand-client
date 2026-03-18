"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import InsightCards from "./InsightCards";
import styles from "./Insights.module.css";

const INSIGHTS_DATA = [
  {
    id: 1,
    slug: "value-driven-innovation-automation",
    image: "/Hero-img.webp",
    tag: "Digital Transformation",
    readTime: "7 min read",
    date: "15 JAN",
    title: "Value Driven Innovation through Automation",
    description:
      "Tech& helps GCC enterprises move beyond the limits of traditional CRM & ERP software.",
  },
  {
    id: 2,
    slug: "agentic-ai",
    image: "/hero-img3.webp",
    tag: "AI & Automation",
    readTime: "8 min read",
    date: "12 JAN",
    title: "Agentic AI is Revolutionizing the Industries",
    description:
      "Stop struggling with disconnected data systems. We apply Agentic AI to banking, retail, and other GCC industries.",
  },
  {
    id: 3,
    slug: "data-sovereign-asset",
    image: "/hero-img4.webp",
    tag: "Data & Analytics",
    readTime: "7 min read",
    date: "10 JAN",
    title: "Data is Going to Be Your New Sovereign Asset",
    description:
      "Your company's data is your most valuable resource. We solve the problem of data silos by building a unified platform.",
  },
  {
    id: 4,
    slug: "autonomous-ai-customer-service",
    image: "/hero-img2.webp",
    tag: "AI & Customer Service",
    readTime: "8 min read",
    date: "08 JAN",
    title:
      "How Customer Service Teams Are Achieving a 20% to 45% Increase in Productivity with AI",
    description:
      "Companies using AI-driven tools like Microsoft Copilot see a 20% to 45% increase in the speed of resolving customer inquiries.",
  },
  {
    id: 5,
    slug: "powering-enterprise-transformation-ai",
    image: "/insight-card-5.webp",
    tag: "Automation",
    readTime: "6 min read",
    date: "05 JAN",
    title: "Doing More with Less Through Intelligent Automation",
    description:
      "See how automation and low-code platforms are helping enterprises reduce costs and increase efficiency.",
    comingSoon: true,
  },
  {
    id: 6,
    slug: "powering-enterprise-transformation-ai",
    image: "/insight-card-6.webp",
    tag: "Customer Experience",
    readTime: "5 min read",
    date: "03 JAN",
    title: "Reimagining Customer Service with AI and Insights",
    description:
      "Learn how AI-driven customer service solutions are improving response times, quality, and satisfaction.",
    comingSoon: true,
  },
];

export default function Insights() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInsights = INSIGHTS_DATA.filter(
    (insight) =>
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section className={styles.section}>
      <div className="w-full max-w-[1180px] px-4 sm:px-6 md:px-8 flex flex-col items-center ">
        {/* Header */}
        <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#0f172a] text-center mb-2">
            Insights
          </h1>
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
            <button
              className={styles.searchButton}
              aria-label="Search insights"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {filteredInsights.map((insight) => (
            <InsightCards
              key={insight.id}
              {...insight}
              comingSoon={insight.comingSoon}
            />
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-12 text-[#666666]">
            No insights found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}
