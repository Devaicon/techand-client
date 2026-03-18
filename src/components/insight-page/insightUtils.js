// Shared constants for blog components
export const CATEGORIES = [
  "View all",
  "AI",
  "Enterprise Platforms",
  "Cloud",
  "Data",
  "Integration",
  "Growth",
  "Automation",
];

// Utility function to check if a post matches search query
export const matchesSearchQuery = (post, query) => {
  if (!query.trim()) return true;

  const lowercaseQuery = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.description.toLowerCase().includes(lowercaseQuery) ||
    post.category.toLowerCase().includes(lowercaseQuery) ||
    post.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Utility function to check if a post matches category filter
export const matchesCategoryFilter = (post, category) => {
  if (category === "View all") return true;
  return post.tags?.includes(category);
};

// Combined filter function
export const filterPosts = (posts, category, searchQuery) => {
  return posts.filter(
    (post) =>
      matchesCategoryFilter(post, category) &&
      matchesSearchQuery(post, searchQuery)
  );
};
