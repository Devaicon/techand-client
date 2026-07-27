// Server-side data access for the public /services page.
//
// Uses fetch (not the axios adminApi) because this runs in a Server Component.
// Uncached (`cache: "no-store"`), matching blogs-api.js: publishing the page,
// editing a section or reordering the list shows up on the next request, with no
// revalidation window to wait out.
//
// One deliberate difference from blogs-api.js: a failure here returns `null`
// rather than an empty list, and the route turns that into a 404. An insights
// page with no posts is a valid "nothing published yet" state; a services page
// with no sections is not — rendering a hero above nothing would look like a
// broken deploy.

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1/public";

/**
 * Fetch the published services page and its visible sections.
 *
 * @param {string} [previewToken] - renders the page even while it is a draft
 * @returns {Promise<{page: object, sections: object[], isPreview: boolean}|null>}
 */
export async function getServicesPage(previewToken) {
  const path = previewToken
    ? `/services?preview=${encodeURIComponent(previewToken)}`
    : "/services";

  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    const page = json?.data?.page;
    const sections = json?.data?.sections;
    if (!page || !Array.isArray(sections)) return null;

    return {
      page,
      // Normalise the one thing every renderer indexes into. A section saved
      // before `cards` existed, or a `cta` which never has any, would otherwise
      // make `section.cards.map` throw inside a Server Component — which fails
      // the whole page, not just that band.
      sections: sections.map((s) => ({ ...s, cards: s.cards ?? [] })),
      isPreview: Boolean(json.data.isPreview),
    };
  } catch {
    // Network error / API down — the route renders a 404 rather than a 500.
    return null;
  }
}
