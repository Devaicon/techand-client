// Server-side data access for the public insights pages.
//
// Uses fetch (not the axios adminApi) because these run in Server Components.
// Responses go through the Data Cache for REVALIDATE_CONTENT, matching the ISR
// window of the insights routes, so their HTML can be served from the CDN. An
// admin save purges both at once (see app/api/revalidate), which is what keeps
// publishing a post or flipping its status visible straight away. Draft
// previews are the exception and are never cached.
//
// List failures return empty results rather than throwing: a marketing site
// should degrade to "no posts yet" if the API is briefly down, not render a 500.
// A single post is different — see getInsightBySlug.

import { REVALIDATE_CONTENT } from "@/lib/cache";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

// sitemap.xml and llms.txt pass a longer `revalidate` of their own — they are
// re-fetched by machines on their own schedule, and must not turn that into
// database load. `noStore` is for draft previews only.
async function fetchJson(path, { revalidate, noStore } = {}) {
  const res = await fetch(`${API}${path}`, {
    ...(noStore
      ? { cache: "no-store" }
      : { next: { revalidate: revalidate ?? REVALIDATE_CONTENT } }),
  });
  if (!res.ok) return { status: res.status, json: null };
  return { status: res.status, json: await res.json() };
}

async function getJson(path, options) {
  try {
    return (await fetchJson(path, options)).json;
  } catch {
    // Network error / API down — callers fall back to empty state.
    return null;
  }
}

// Shown when a post has no card or hero image. next/image throws on an empty
// src, so a post saved without artwork would otherwise take the whole insights
// page down rather than just looking unfinished.
const PLACEHOLDER_IMAGE = "/evolution_of_ai.webp";

// Maps an API blog onto the shape the existing card components consume. This
// is the seam the static registry's `toCardModel` always was — the components
// below it never learn where posts come from.
export const toCardModel = (post) => ({
  image: post.cardImage?.url || post.heroImage?.url || PLACEHOLDER_IMAGE,
  imageFocus: post.cardImage?.url
    ? post.cardImage.focus
    : post.heroImage?.focus,
  category: post.category,
  title: post.title,
  description: post.subtitle,
  link: `/insights/${post.slug}`,
  categories: post.categories ?? [],
  tags: post.tags ?? [],
  readTime: post.readTime,
  comingSoon: post.comingSoon ?? false,
});

export async function getAllInsights(options) {
  const json = await getJson("/blogs", options);
  return json?.data?.blogs ?? [];
}

export async function getFeaturedInsights() {
  const json = await getJson("/blogs/featured");
  return json?.data?.blogs ?? [];
}

export async function getPublishedSlugs() {
  const json = await getJson("/blogs/slugs");
  return json?.data?.slugs ?? [];
}

// `previewToken` fetches an unpublished draft, uncached, so it is always the
// latest save.
//
// Only a 4xx means "no such post". A network error or 5xx THROWS: the article
// route is cached, and a null here would become a cached 404 standing in for a
// live article until the next revalidation. A throw during background
// revalidation keeps the last good copy instead.
export async function getInsightBySlug(slug, previewToken) {
  const path = previewToken
    ? `/blogs/${encodeURIComponent(slug)}?preview=${encodeURIComponent(previewToken)}`
    : `/blogs/${encodeURIComponent(slug)}`;

  const { status, json } = await fetchJson(path, { noStore: Boolean(previewToken) });
  if (status >= 400 && status < 500) return null;
  if (!json) throw new Error(`GET /blogs/${slug} failed: ${status}`);
  return json.data?.blog ?? null;
}

/**
 * Every published article with the date it last changed, for the sitemap.
 *
 * Reads the same `/blogs/slugs` endpoint as `getPublishedSlugs`, taking its
 * `entries` array instead of the bare slug list. One endpoint serves both so
 * the two can never disagree about what is published.
 *
 * @returns {Promise<Array<{slug: string, updatedAt: string|null}>>}
 */
export async function getSitemapPosts({ revalidate } = {}) {
  const json = await getJson("/blogs/slugs", { revalidate });
  const entries = json?.data?.entries;
  return Array.isArray(entries) ? entries : [];
}
