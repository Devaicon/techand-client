// HTTP content negotiation for the two representations this site can produce:
// HTML for browsers, Markdown for agents.
//
// Implements the acceptmarkdown.com convention, which is RFC 9110 §12.5.1
// applied to `text/markdown`. Pure and dependency-free so the ranking rules can
// be tested directly — see negotiateAccept.test.mjs — rather than only through
// a running server.
//
// The rule that matters and is easiest to get wrong: a more specific media
// range overrides a less specific one REGARDLESS of q. `*/*;q=0.9, text/html`
// does not mean "html at 0.9"; it means html is an exact match at q=1 and
// everything else is 0.9. Sorting purely by q gets this backwards.

export const HTML = "html";
export const MARKDOWN = "markdown";

// What this site actually PUTS ON THE WIRE for each representation. The q that
// governs a choice is the q the client gave to the type it will really receive
// — not to some near-synonym — so each representation maps to exactly one type.
const RESPONSE_TYPE = {
  [HTML]: "text/html",
  [MARKDOWN]: "text/markdown",
};

// Spellings that mean the same thing as a response type, normalised on the way
// IN so they never become a second, independently-satisfiable way to ask for a
// representation. That distinction is not cosmetic: treating them as
// interchangeable aliases would let `Accept: text/html;q=0, */*` still resolve
// to HTML, because the refusal lands on one spelling while the wildcard
// satisfies another — quietly ignoring an explicit q=0.
//
// `text/markdown` is the registered type (RFC 7763) and the only one this site
// ever responds with; acceptmarkdown.com deprecates the other two. Reading them
// costs nothing and the intent is unambiguous.
const NORMALISE = {
  "text/x-markdown": "text/markdown",
  "application/markdown": "text/markdown",
  "application/xhtml+xml": "text/html",
};

// Ties go to HTML. Equal q means the client expressed no preference between the
// two and the server picks; HTML is what a browser landing here needs, and an
// agent that actually wants Markdown says so with `Accept: text/markdown`.
const PREFERENCE = [HTML, MARKDOWN];

/**
 * Parses one Accept header into media ranges.
 *
 * Media-range parameters (`text/markdown;variant=GFM`) are skipped rather than
 * matched on: this site produces one flavour of Markdown, so a variant request
 * is answered with what there is instead of being refused.
 */
const parseRanges = (header) =>
  String(header)
    .split(",")
    .map((part) => {
      const [rawType, ...params] = part.trim().split(";");
      const raw = rawType.trim().toLowerCase();
      if (!raw.includes("/")) return null;

      const type = NORMALISE[raw] || raw;
      const [type1, type2] = type.split("/", 2);

      // q defaults to 1 when absent or unparseable. RFC 9110 caps it at 1 and
      // floors it at 0; a value outside that range is a malformed header, not a
      // stronger preference.
      let q = 1;
      for (const param of params) {
        const [key, value] = param.split("=", 2);
        if (key?.trim().toLowerCase() !== "q") continue;
        const parsed = Number.parseFloat(value);
        q = Number.isNaN(parsed) ? 1 : Math.min(1, Math.max(0, parsed));
      }

      return {
        type: type1,
        subtype: type2,
        q,
        // 2 = exact, 1 = type/*, 0 = */*. Higher wins outright.
        specificity: type1 === "*" ? 0 : type2 === "*" ? 1 : 2,
      };
    })
    .filter(Boolean);

// The q the client assigned to one concrete media type: the q of the most
// specific range that matches it. Returns null when no range matches at all,
// which is different from a matching range with q=0 only in intent — both mean
// "not acceptable" — but keeps the two readable apart while debugging.
const qualityFor = (ranges, mediaType) => {
  const [type, subtype] = mediaType.split("/", 2);

  let best = null;
  for (const range of ranges) {
    const matches =
      range.specificity === 0 ||
      (range.specificity === 1 && range.type === type) ||
      (range.type === type && range.subtype === subtype);
    if (!matches) continue;

    // Strictly greater: the FIRST range at a given specificity wins, so a
    // header repeating a type does not silently upgrade it.
    if (!best || range.specificity > best.specificity) best = range;
  }

  return best ? best.q : null;
};

/**
 * Chooses a representation for an Accept header.
 *
 * @param {string|null|undefined} header - the raw Accept header
 * @returns {"html"|"markdown"|null} the representation to serve, or null when
 *   the client accepts neither — the caller's cue to answer 406.
 */
export function negotiate(header) {
  // No Accept header means no constraint (RFC 9110 §12.5.1), and so does an
  // empty one in practice. Both get the default representation. This is also
  // the path every Next.js RSC navigation takes, so it must never 406.
  if (!header || !String(header).trim()) return HTML;

  const ranges = parseRanges(header);
  if (ranges.length === 0) return HTML;

  const scored = PREFERENCE.map((representation) => ({
    representation,
    q: qualityFor(ranges, RESPONSE_TYPE[representation]) ?? 0,
  }));

  // q=0 is an explicit refusal, not a weak preference — a representation
  // scoring 0 is never served, even if it is the only one left.
  const acceptable = scored.filter((entry) => entry.q > 0);
  if (acceptable.length === 0) return null;

  // PREFERENCE order is preserved by the map above, and sort is stable, so
  // equal q leaves HTML first.
  acceptable.sort((a, b) => b.q - a.q);
  return acceptable[0].representation;
}
