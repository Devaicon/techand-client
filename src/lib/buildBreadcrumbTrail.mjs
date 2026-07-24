// Pretty labels for known route segments. Anything not listed falls back to a
// title-cased version of the slug, so new pages still render a sensible crumb.
export const SEGMENT_LABELS = {
  capabilities: "Capabilities",
  whatwedo: "What We Do",
  insights: "Insights",
  "business-applications": "Business Applications",
  "cloud-services": "Cloud Services",
  data: "Data",
  "ai-automation": "AI & Automation",
  "assess-envision": "Assess & Envision",
  "build-implement": "Build & Implement",
  "global-rollouts": "Global Rollouts",
  "managed-services": "Managed Services",
  "run-optimize": "Run & Optimize",
};

// "run-optimize" -> "Run Optimize"
const titleCase = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const labelFor = (segment) => SEGMENT_LABELS[segment] ?? titleCase(segment);

/**
 * Build the breadcrumb trail for a pathname.
 *
 * Returns an empty array for the homepage and any top-level page (fewer than
 * two path segments) so the breadcrumb self-hides everywhere except nested
 * sub-pages such as /capabilities/data or /whatwedo/ai-automation.
 *
 * @param {string|null|undefined} pathname - e.g. "/capabilities/data"
 * @returns {Array<{label: string, href: string, isCurrent: boolean}>}
 */
export function buildBreadcrumbTrail(pathname) {
  if (typeof pathname !== "string") return [];

  // Drop any hash/query and split into non-empty segments.
  const path = pathname.split(/[?#]/)[0];
  const segments = path.split("/").filter(Boolean);

  if (segments.length < 2) return [];

  const crumbs = segments.map((segment, index) => ({
    label: labelFor(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isCurrent: index === segments.length - 1,
  }));

  return [{ label: "Home", href: "/", isCurrent: false }, ...crumbs];
}
