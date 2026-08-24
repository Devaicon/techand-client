import { SITE_CONFIG } from "@/lib/constants";
import { buildSitemap } from "@/lib/buildSitemap.mjs";
import { getSitemapPages } from "@/lib/pages-api";
import { getSitemapPosts } from "@/lib/blogs-api";

// Rebuilt hourly rather than per request. The document is assembled from two
// API calls, and a crawler re-fetching sitemap.xml must not be able to put load
// on the database; an hour is well inside the interval at which search engines
// actually re-read it.
export const revalidate = 3600;

// The table of routes that exist as code.
//
// Kept as a literal table rather than walked from `app/`, because that tree also
// holds routes that must never be submitted: /admin and /home-preview. The
// `[...slug]` CMS catch-all is absent for the opposite reason — the filesystem
// says nothing about which pages exist there, so those URLs are fetched from the
// API below instead of being listed here.
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

  // Insights index. The individual articles under it are pulled from the API in
  // `sitemap()` below, alongside the CMS pages.
  { path: "/insights", lastModified: "2026-08-15", changeFrequency: "weekly", priority: 0.8 },

  { path: "/whywith-techand", lastModified: "2026-03-25", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact-us", lastModified: "2026-07-02", changeFrequency: "monthly", priority: 0.7 },

  // Legal. Low priority, but they belong in the index.
  { path: "/privacy", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
  { path: "/security", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", lastModified: "2026-03-19", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap() {
  // Both feeds are fetched in parallel and both degrade to [] on failure, so an
  // API outage costs the dynamic URLs for one revalidation window rather than
  // taking sitemap.xml down. A sitemap that 500s is worse than a short one:
  // Search Console reports the fetch error against the whole site.
  const [cmsPages, posts] = await Promise.all([
    getSitemapPages({ revalidate }),
    getSitemapPosts({ revalidate }),
  ]);

  // Encoding, de-duplication and date handling all live in buildSitemap so they
  // can be tested without a build. See buildSitemap.test.mjs.
  return buildSitemap({
    baseUrl: SITE_CONFIG.url,
    routes: ROUTES,
    cmsPages,
    posts,
  });
}
