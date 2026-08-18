import { SITE_CONFIG } from "@/lib/constants";

// Tells crawlers which parts of the site they may fetch, and where the sitemap
// lives. The fallback host comes from SITE_CONFIG so this file can never drift
// from the one layout.js, sitemap.js and ArticleSchema use — an earlier copy
// here defaulted to a placeholder domain, which shipped a robots.txt pointing
// every crawler's sitemap lookup at a host that does not exist.
export default function robots() {
  const baseUrl = SITE_CONFIG.url.replace(/\/+$/, "");

  // Everything under these prefixes is either non-HTML, authenticated, or both.
  // Note what is NOT here: /home-preview and `?preview=` draft URLs. Both
  // already send `robots: { index: false }` in their page metadata, and a
  // crawler has to be allowed to fetch a page before it can read that header —
  // disallowing them would preserve, not remove, any stale index entry.
  const disallow = ["/api/", "/admin/", "/private/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
