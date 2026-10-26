/**
 * Cache configuration for data fetching
 */

/**
 * How long a page and the API data it was built from may be served from cache.
 *
 * A backstop, not the main way content goes live: every admin save purges the
 * whole cache at once (app/api/revalidate). This window only matters for
 * changes that happen without an admin save (the coming-soon launch date
 * passing, a write made directly against the API or database) or if that
 * purge fails.
 */
export const REVALIDATE_CONTENT = 300;

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
