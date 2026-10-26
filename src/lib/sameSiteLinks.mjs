// Turns links in stored article HTML that name this site by absolute URL into
// site-relative ones.
//
// Authors paste links copied from the address bar, and some of those were
// copied while the site still answered on the bare domain: a body linking
// "https://techand.ai/insights/…" sends every reader and crawler through the
// 308 to www. Search engines count each of those as a vote for the bare host,
// which is how Google ended up listing pages under https://techand.ai while
// every canonical names https://www.techand.ai.
//
// A relative href resolves against whichever origin served the page — always
// the canonical one — so it can never point at the wrong host again. Any
// scheme and either host variant is matched; other sites (including
// subdomains such as blog.techand.ai) are left alone.
//
// Done on read rather than at save time so posts already in the database are
// fixed without being re-saved. .mjs so it can be unit-tested with `node --test`.

const SAME_SITE_HREF = /(\shref\s*=\s*)(["'])https?:\/\/(?:www\.)?techand\.ai(?::\d+)?(?=[/?#"']|\2)([^"']*)\2/gi;

/**
 * @param {string} html - sanitized article HTML
 * @returns {string} the same HTML with same-site absolute hrefs made relative
 */
export function relativizeSameSiteLinks(html) {
  if (typeof html !== "string" || html === "") return html;

  return html.replace(SAME_SITE_HREF, (_match, attr, quote, rest) => {
    // "https://techand.ai" and "https://techand.ai/" both mean the home page;
    // a bare "?x" or "#x" left behind would resolve against the current page.
    const path = rest === "" || /^[?#]/.test(rest) ? `/${rest}` : rest;
    return `${attr}${quote}${path}${quote}`;
  });
}
