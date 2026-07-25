// Server-side data access for the public insights pages.
//
// Uses fetch (not the axios adminApi) because these run in Server Components.
// Every call is uncached (`cache: "no-store"`), so the pages render on each
// request and always reflect the latest admin change — publishing a post or
// flipping its status shows up immediately, with no revalidation window to wait
// on. The route files opt into dynamic rendering to match (see the
// `export const dynamic` in the insights pages).
//
// Failures return empty results rather than throwing: a marketing site should
// degrade to "no posts yet" if the API is briefly down, not render a 500.

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

async function getJson(path) {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
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

export async function getAllInsights() {
  const json = await getJson("/blogs");
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

// `previewToken` fetches an unpublished draft — always the latest save, like
// every other read here.
export async function getInsightBySlug(slug, previewToken) {
  const path = previewToken
    ? `/blogs/${encodeURIComponent(slug)}?preview=${encodeURIComponent(previewToken)}`
    : `/blogs/${encodeURIComponent(slug)}`;

  const json = await getJson(path);
  return json?.data?.blog ?? null;
}
