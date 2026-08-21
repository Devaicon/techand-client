// Assembles the sitemap entry list from the three sources that make up the
// public site: the hand-maintained table of code routes, the CMS pages served
// by the `[...slug]` catch-all, and the published insight articles.
//
// Pure and separate from `app/sitemap.js` so the merge rules — encoding,
// de-duplication, date handling — can be tested without a network call or a
// Next.js build. `app/sitemap.js` keeps the static table and does the fetching;
// everything below decides what the XML actually says.

// A slug arrives from Mongo already slugified per segment, but a sitemap is one
// of the few places where a bad character is not a cosmetic problem: Next
// interpolates `url` into <loc> unescaped, so a stray "&" makes the whole
// document unparseable and a crawler rejects the file rather than the one entry.
// Encoding per segment keeps the path separators intact while escaping
// everything inside them.
const encodePath = (slug) =>
  String(slug || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

// Sitemap `lastmod` has to be a real date or absent — never a placeholder.
// An unparseable or missing value returns undefined so the field is simply
// omitted for that URL, which crawlers handle fine; inventing `new Date()`
// instead would claim the page changed at build time, which is the exact
// habit that makes Google discount the field site-wide.
const toLastModified = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

/**
 * @param {object} input
 * @param {string} input.baseUrl - site origin, with or without a trailing slash
 * @param {Array<{path: string, lastModified?: string, changeFrequency?: string, priority?: number}>} input.routes
 *   the static table from `app/sitemap.js`
 * @param {Array<{slug: string, updatedAt?: string}>} input.cmsPages - published CMS pages
 * @param {Array<{slug: string, updatedAt?: string}>} input.posts - published insight articles
 * @returns {Array<{url: string, lastModified?: string, changeFrequency?: string, priority?: number}>}
 */
export function buildSitemap({
  baseUrl,
  routes = [],
  cmsPages = [],
  posts = [],
}) {
  // A trailing slash on NEXT_PUBLIC_SITE_URL would otherwise yield "//path".
  const base = String(baseUrl || "").replace(/\/+$/, "");

  const entries = [];
  // Keyed by URL rather than by slug: a CMS page and a code route can only
  // collide once they resolve to the same address, and that is the collision
  // that would put a duplicate <url> in the document.
  const seen = new Set();

  const add = (url, entry) => {
    if (seen.has(url)) return;
    seen.add(url);

    const lastModified = toLastModified(entry.lastModified);
    entries.push({
      url,
      ...(lastModified ? { lastModified } : {}),
      ...(entry.changeFrequency ? { changeFrequency: entry.changeFrequency } : {}),
      ...(entry.priority !== undefined ? { priority: entry.priority } : {}),
    });
  };

  // Code routes go first, so a CMS page that somehow reached a reserved slug
  // loses to the route Next actually serves at that URL. (The server's
  // reserved-slug guard should stop that page being created at all — this is
  // the second line of that defence, in the one place where a duplicate is
  // visible to crawlers.)
  //
  // Only this loop can emit the origin itself: "/" is a path the static table
  // is allowed to name, and a slug is not. A CMS row whose slug is "" or "/"
  // is malformed, and letting it through here would put a second, contradictory
  // entry on the site's most important URL.
  for (const { path, ...entry } of routes) {
    if (path === "/") {
      add(base, entry);
      continue;
    }
    const encoded = encodePath(path);
    if (encoded) add(`${base}/${encoded}`, entry);
  }

  const addSlug = (slug, entry) => {
    const encoded = encodePath(slug);
    if (!encoded) return;
    add(`${base}/${encoded}`, entry);
  };

  // CMS pages. Ranked below the pillar pages in the static table but above the
  // legal ones: these are real marketing pages, just authored rather than coded.
  for (const page of cmsPages) {
    addSlug(page?.slug, {
      lastModified: page?.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Insight articles. Individually lower priority than /insights itself — the
  // index is the page that should rank for the section.
  for (const post of posts) {
    const slug = encodePath(post?.slug);
    if (!slug) continue;
    addSlug(`insights/${post.slug}`, {
      lastModified: post?.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
