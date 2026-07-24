// Server-side data access for the public insights pages.
//
// Uses fetch (not the axios adminApi) because these run in Server Components,
// where Next's fetch cache is what gives us ISR. Every call is cached and
// revalidated on a timer, so the pages are static-fast but pick up newly
// published posts without a redeploy.
//
// Failures return empty results rather than throwing: a marketing site should
// degrade to "no posts yet" if the API is briefly down, not render a 500.

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

const REVALIDATE = 300; // 5 minutes

async function getJson(path, { revalidate = REVALIDATE, noStore = false } = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      ...(noStore ? { cache: "no-store" } : { next: { revalidate } }),
    });
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

// `previewToken` fetches an unpublished draft. Those responses are explicitly
// uncached — a preview must always show the latest save, and caching one would
// risk serving draft content to ordinary visitors from the shared page cache.
export async function getInsightBySlug(slug, previewToken) {
  const path = previewToken
    ? `/blogs/${encodeURIComponent(slug)}?preview=${encodeURIComponent(previewToken)}`
    : `/blogs/${encodeURIComponent(slug)}`;

  const json = await getJson(path, { noStore: Boolean(previewToken) });
  return json?.data?.blog ?? null;
}
