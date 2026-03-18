/**
 * Cache configuration for data fetching
 */

/**
 * Revalidate every 1 hour
 */
export const REVALIDATE_HOUR = 3600;

/**
 * Revalidate every 1 day
 */
export const REVALIDATE_DAY = 86400;

/**
 * Revalidate every 1 week
 */
export const REVALIDATE_WEEK = 604800;

/**
 * Cache tags for on-demand revalidation
 */
export const CACHE_TAGS = {
  POSTS: "posts",
  PAGES: "pages",
  PRODUCTS: "products",
};
