// Server-side data access for CMS pages.
//
// Uses fetch (not the axios adminApi) because this runs in a Server Component.
// Published pages go through the Data Cache for REVALIDATE_CONTENT, matching
// the route's ISR window; an admin save purges both at once (see
// app/api/revalidate). Draft previews are never cached — the token is in the
// URL and each one must show the latest save.
//
// One deliberate difference from blogs-api.js: a missing page returns `null`
// rather than an empty list, and the route turns that into a 404. An insights
// page with no posts is a valid "nothing published yet" state; a CMS page with
// no blocks is not — rendering chrome around nothing looks like a broken deploy.

import { REVALIDATE_CONTENT } from "@/lib/cache";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

/**
 * Fetch a published page and its visible blocks.
 *
 * @param {string} slug - the full path, without a leading slash
 *   ("services", "solutions/dynamics-365-uae")
 * @param {string} [previewToken] - renders the page even while it is a draft
 * @returns {Promise<{page: object, sections: object[], isPreview: boolean}|null>}
 */
export async function getPage(slug, previewToken) {
  if (!slug) return null;

  // The slug is a query parameter rather than a path segment because it is
  // itself a path — `encodeURIComponent` keeps its slashes from being read as
  // route structure.
  const query = new URLSearchParams({ slug });
  if (previewToken) query.set("preview", previewToken);

  // Only a 4xx means "no such page" (the API 404s drafts and missing slugs
  // alike). A network error or 5xx THROWS instead of returning null: the route
  // is cached, and a null would become a cached 404 standing in for a live page
  // until the next revalidation. A throw during background revalidation keeps
  // serving the last good copy; on a first, uncached render it shows the error
  // page, which a crawler retries rather than records as gone.
  const res = await fetch(
    `${API}/pages?${query}`,
    previewToken
      ? { cache: "no-store" }
      : { next: { revalidate: REVALIDATE_CONTENT } },
  );
  if (res.status >= 400 && res.status < 500) return null;
  if (!res.ok) throw new Error(`GET /pages failed: ${res.status}`);

  const json = await res.json();
  const page = json?.data?.page;
  const sections = json?.data?.sections;
  if (!page || !Array.isArray(sections)) return null;

  return {
    page,
    // `props` is normalised even though the server always sends it filled: a
    // block stored before its definition existed would otherwise make a
    // renderer read into `undefined` inside a Server Component, which fails
    // the whole page rather than just that band.
    sections: sections.map((s) => ({ ...s, props: s.props ?? {} })),
    isPreview: Boolean(json.data.isPreview),
  };
}

/**
 * Every published CMS page, for the sitemap.
 *
 * Returns `[]` rather than `null` on failure — unlike `getPage`, where a
 * failure has to become a 404. Here the caller is building sitemap.xml, and the
 * right degraded behaviour is a sitemap listing the code routes only, not a
 * missing or empty document.
 *
 * @returns {Promise<Array<{slug: string, updatedAt: string}>>}
 */
export async function getSitemapPages({ revalidate } = {}) {
  try {
    const res = await fetch(`${API}/pages/slugs`, {
      // Never uncached: re-fetching sitemap.xml must not become a way to put
      // load on the database. sitemap.js passes its own, longer window.
      next: { revalidate: revalidate ?? REVALIDATE_CONTENT },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const pages = json?.data?.pages;
    return Array.isArray(pages) ? pages : [];
  } catch {
    return [];
  }
}
