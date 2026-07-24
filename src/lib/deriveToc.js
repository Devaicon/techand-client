// Client-side preview of the table of contents.
//
// The SERVER is authoritative: server/src/utils/toc.js re-derives the TOC on
// every save and its result overwrites whatever this produced. This exists only
// so the editor can show detected headings before the first save, instead of an
// empty panel. The two implementations must agree on the id scheme, or an
// override typed here would fail to match its entry after saving — hence the
// deliberately identical slug + dedupe rules below.

// Mirrors slugify(text, { lower: true, strict: true }) on the server: lowercase,
// strip anything that is not alphanumeric or whitespace, collapse whitespace
// runs to single hyphens.
const slugifyHeading = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";

export function deriveToc(html, overrides = []) {
  if (!html || typeof document === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h2, h3, h4");

  const overrideById = new Map(
    (overrides || []).filter((o) => o && o.id).map((o) => [o.id, o]),
  );

  const seen = new Map();

  return Array.from(headings).map((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    const base = slugifyHeading(text);

    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;

    const override = overrideById.get(id);
    return {
      id,
      text,
      level: Number(node.tagName.slice(1)),
      label: override?.label || "",
      hidden: Boolean(override?.hidden),
    };
  });
}
