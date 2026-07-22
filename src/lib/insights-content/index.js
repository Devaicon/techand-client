// Central export file for all insight content
import agenticAI from "./agentic-ai";
import dataAsset from "./data-asset";
import autonomousAICustomerService from "./autonomous-ai-customer-service";
import slider01 from "./Slider-01";

export const insightsContent = {
  "agentic-ai": agenticAI,
  "data-sovereign-asset": dataAsset,
  "autonomous-ai-customer-service": autonomousAICustomerService,
  "value-driven-innovation-automation": slider01,
  // Add more slugs here as you create content
};

export const getInsightBySlug = (slug) => {
  return insightsContent[slug] || null;
};

// Every insight, newest first. `publishedAt` is an ISO date string, so a plain
// lexicographic compare orders correctly without constructing Date objects.
export const getAllInsights = () =>
  Object.values(insightsContent).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

// Posts flagged for the "Featured blogs" rail, newest first.
//
// NOTE the naming collision: this `isFeatured` flag is NOT what drives
// `FeaturedCard` in InsightCard.jsx. That component always shows the single
// newest post, whatever its flag. Two different meanings of "featured", both
// kept because both match how the site talks about them.
export const getFeaturedInsights = () =>
  getAllInsights().filter((post) => post.isFeatured === true);

// The single seam between content storage and card presentation. Card
// components consume this shape and know nothing about the content schema.
// When blogs move to an API, or images move to Cloudinary, this function is
// what changes — not the components.
export const toCardModel = (post) => ({
  image: post.cardImage ?? post.heroImage,
  category: post.category,
  title: post.title,
  description: post.subtitle,
  link: `/insights/${post.slug}`,
  categories: post.categories ?? [],
  // Carried through because free-text search still matches on tags, even
  // though the filter chips are driven by `categories`.
  tags: post.tags ?? [],
  readTime: post.readTime,
  comingSoon: post.comingSoon ?? false,
});
