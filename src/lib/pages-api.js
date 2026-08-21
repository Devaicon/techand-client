// Server-side data access for CMS pages.
//
// Uses fetch (not the axios adminApi) because this runs in a Server Component.
// Uncached (`cache: "no-store"`), matching blogs-api.js: publishing a page,
// editing a block or reordering the list shows up on the next request, with no
// revalidation window to wait out.
//
// One deliberate difference from blogs-api.js: a failure here returns `null`
// rather than an empty list, and the route turns that into a 404. An insights
// page with no posts is a valid "nothing published yet" state; a CMS page with
// no blocks is not — rendering chrome around nothing looks like a broken deploy.

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

  try {
    const res = await fetch(`${API}/pages?${query}`, { cache: "no-store" });
    if (!res.ok) return null;

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
  } catch {
    // Network error / API down — the route renders a 404 rather than a 500.
    return null;
  }
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
      // Uncached by default, like getPage above; the crawler-facing documents
      // pass a revalidate window so re-fetching sitemap.xml cannot become a way
      // to put load on the database.
      ...(revalidate ? { next: { revalidate } } : { cache: "no-store" }),
    });
    if (!res.ok) return [];

    const json = await res.json();
    const pages = json?.data?.pages;
    return Array.isArray(pages) ? pages : [];
  } catch {
    return [];
  }
}
