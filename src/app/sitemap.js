import { SITE_CONFIG } from "@/lib/constants";

// The public URL set handed to search engines.
//
// Kept as a literal table rather than walked from `app/`, because that tree also
// holds routes that must never be submitted: /admin, the `[...slug]` CMS
// catch-all (its pages are DB-driven, so the filesystem says nothing about
// which ones exist), and /home-preview.
//
// /home-preview is deliberately absent here AND deliberately not disallowed in
// robots.txt — it already carries `robots: { index: false }` in its own
// metadata, and blocking it in robots.txt would stop crawlers reading that
// directive, which is the thing actually keeping it out of the index.
//
// `lastModified` is a real per-page date, not `new Date()`. A sitemap that
// stamps every URL with the build time claims the whole site changed on every
// deploy, and Google discounts the field once it sees that. These dates came
// from `git log -1 --format=%cs -- <page and component dirs>`; bump a row when
// that page's content actually changes.
const ROUTES = [
  { path: "/", lastModified: "2026-07-25", changeFrequency: "weekly", priority: 1 },

  // Primary pillars.
  { path: "/whatwedo", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.9 },
  { path: "/capabilities", lastModified: "2026-08-04", changeFrequency: "monthly", priority: 0.9 },
  { path: "/industries", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.9 },

  // Service detail pages.
  { path: "/whatwedo/assess-envision", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/whatwedo/build-implement", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/whatwedo/run-optimize", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/whatwedo/managed-services", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/whatwedo/global-rollouts", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/whatwedo/ai-automation", lastModified: "2026-03-19", changeFrequency: "monthly", priority: 0.8 },

  // Capability detail pages.
  { path: "/capabilities/business-applications", lastModified: "2026-08-04", changeFrequency: "monthly", priority: 0.8 },
  { path: "/capabilities/cloud-services", lastModified: "2026-08-04", changeFrequency: "monthly", priority: 0.8 },
  { path: "/capabilities/data", lastModified: "2026-08-04", changeFrequency: "monthly", priority: 0.8 },

  // Insights index. Individual articles are not listed: they live in the CMS,
  // so enumerating them means an API call at build time.
  { path: "/insights", lastModified: "2026-08-15", changeFrequency: "weekly", priority: 0.8 },

  { path: "/whywith-techand", lastModified: "2026-03-25", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact-us", lastModified: "2026-07-02", changeFrequency: "monthly", priority: 0.7 },

  // Legal. Low priority, but they belong in the index.
  { path: "/privacy", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
  { path: "/security", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap() {
  // Next interpolates `url` into <loc> unescaped, so anything here has to be a
  // valid, already-encoded URL — a bare "&" in a path makes the whole XML
  // document unparseable, and a crawler rejects the file rather than the entry.
  // A trailing slash on NEXT_PUBLIC_SITE_URL would otherwise yield "//path".
  const baseUrl = SITE_CONFIG.url.replace(/\/+$/, "");

  return ROUTES.map(({ path, ...entry }) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    ...entry,
  }));
}
