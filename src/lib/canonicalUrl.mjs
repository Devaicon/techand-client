// Resolves a page's canonical URL from an optional author override.
//
// Posts and CMS pages carry a free-text `canonicalUrl`. An override that names
// this site under a different host or scheme — "https://techand.ai/x" or
// "http://www.techand.ai/x" — is a redirect, not a destination: the bare domain
// 308s to www. A canonical that points at a redirect is reported against the
// page by every SEO crawler, so a same-site override is moved onto the canonical
// origin. An override for a different site (syndicated content) is kept as-is.

const bareHost = (hostname) => hostname.toLowerCase().replace(/^www\./, "");

/**
 * @param {string|undefined} override - the author's canonicalUrl, possibly empty
 * @param {string} path - the page's own path, e.g. "/insights/my-post"
 * @param {string} siteUrl - the canonical origin, e.g. "https://www.techand.ai"
 * @returns {string} an absolute canonical URL
 */
export function resolveCanonical(override, path, siteUrl) {
  const base = String(siteUrl || "").replace(/\/+$/, "");
  const own = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const value = String(override ?? "").trim();
  if (!value) return own;

  // A site-relative override ("/insights/other-post") is anchored to the origin.
  if (value.startsWith("/")) return `${base}${value}`;

  let target;
  let origin;
  try {
    target = new URL(value);
    origin = new URL(base);
  } catch {
    // Unparseable — the validator should have stopped it. Falling back to the
    // page's own URL beats emitting a canonical no crawler can follow.
    return own;
  }

  if (bareHost(target.hostname) !== bareHost(origin.hostname)) return value;

  return `${origin.origin}${target.pathname}${target.search}`.replace(
    /(?<=.)\/+$/,
    "",
  );
}
