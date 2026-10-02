// Turns an author-typed link into one a browser resolves the way the author
// meant.
//
// The navbar's link fields are free text, and "dynamics-365-project-operations-uae"
// — no leading slash — is a RELATIVE url. A browser resolves it against the
// current directory, so on /capabilities/data it pointed at
// /capabilities/dynamics-365-project-operations-uae, a 404. Because the navbar
// is on every page, that one row produced a broken link on every nested URL of
// the site.
//
// Rules, in order:
//   ""                          → ""   (caller decides what an empty link is)
//   "/x", "#x", "?x"            → unchanged (already site-anchored)
//   "https://…", "mailto:…", "//…" → unchanged (absolute, any scheme)
//   "./x", "../x"               → "/x" (nobody means "relative to this page")
//   "example.com/x"             → "https://example.com/x" (a bare host)
//   "some-page"                 → "/some-page"
export function siteHref(value) {
  const v = String(value ?? "").trim();
  if (v === "") return "";
  if (/^[/#?]/.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;

  if (v.startsWith(".")) return `/${v.replace(/^(\.\.?\/)+/, "")}`;

  // A first segment shaped like a hostname — labels separated by dots, an
  // optional port. "page.html" would match too, but no route on this site has
  // an extension, while a pasted "www.partner.com" is a common slip.
  const firstSegment = v.split(/[/?#]/)[0];
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/i.test(firstSegment)) {
    return `https://${v}`;
  }

  return `/${v}`;
}

/**
 * Applies siteHref to every link in the CMS navbar tree — the CTA, each item,
 * each column heading and each link inside a column. Returns a new tree; the
 * input is not mutated.
 */
export function normalizeNavbarHrefs(navbar) {
  if (!navbar || typeof navbar !== "object") return navbar;

  const fix = (row) =>
    row && typeof row.href === "string" ? { ...row, href: siteHref(row.href) } : row;

  return {
    ...navbar,
    ...(typeof navbar.ctaHref === "string"
      ? { ctaHref: siteHref(navbar.ctaHref) }
      : {}),
    items: (navbar.items || []).map((item) => ({
      ...fix(item),
      columns: (item?.columns || []).map((column) => ({
        ...fix(column),
        links: (column?.links || []).map(fix),
      })),
    })),
  };
}
