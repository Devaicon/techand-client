// Splits stored article HTML at inline-CTA markers.
//
// The body is one sanitized HTML string, but an inline CTA has to render as a
// real React component (with next/link routing and hover state), not as markup
// baked into the string. So we cut the string at each `<div data-cta-slot="…">`
// and hand back an ordered list of segments the reader interleaves.
//
// .mjs so it can be unit-tested with `node --test` — the rest of the client is
// bundled by Next and has no test harness.

const MARKER = /<div data-cta-slot="([^"]*)"><\/div>/g;

/**
 * @param {string} html
 * @returns {Array<{type: "html", html: string} | {type: "cta", key: string}>}
 */
export function splitCtaSlots(html) {
  if (!html || typeof html !== "string") return [];

  const segments = [];
  let cursor = 0;

  // Reset lastIndex: MARKER is a module-level global regex, so a previous call
  // would otherwise leave it mid-string and skip the first match.
  MARKER.lastIndex = 0;

  let match = MARKER.exec(html);
  while (match !== null) {
    const before = html.slice(cursor, match.index);
    if (before) segments.push({ type: "html", html: before });
    segments.push({ type: "cta", key: match[1] });
    cursor = match.index + match[0].length;
    match = MARKER.exec(html);
  }

  const rest = html.slice(cursor);
  if (rest) segments.push({ type: "html", html: rest });

  return segments;
}
