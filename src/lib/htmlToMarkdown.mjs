// Turns a rendered page into the Markdown representation served under
// `Accept: text/markdown`.
//
// The input is this site's own HTML, fetched back by the Markdown route — not
// arbitrary web pages. That is what makes a single extraction rule enough:
// every public page renders its content inside one <main>, with the navbar,
// footer and partner card as siblings outside it (see SiteChrome), so taking
// <main> drops the chrome without a per-page allowlist.
//
// Pure apart from its two parsing dependencies, so the whole pipeline is
// testable from a string — see htmlToMarkdown.test.mjs.

import domino from "@mixmark-io/domino";
import TurndownService from "turndown";

// Elements that carry no reading content. Scripts and styles would otherwise
// arrive as literal text; `aria-hidden` is how this codebase marks the
// decorative gradient overlays and arrow glyphs that sit inside headings and
// buttons, so honouring it removes exactly the noise a screen reader also skips.
const STRIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "iframe",
  "canvas",
  "[aria-hidden='true']",
  "[hidden]",
].join(",");

const turndown = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  linkStyle: "inlined",
  emDelimiter: "_",
});

// A decorative image is one the page itself declares decorative, by giving it an
// empty alt. Emitting `![](https://res.cloudinary.com/…)` for each of those
// spends an agent's context on nothing; a described image keeps its alt text,
// which is the part worth reading.
turndown.addRule("decorativeImages", {
  filter: (node) =>
    node.nodeName === "IMG" && !String(node.getAttribute("alt") || "").trim(),
  replacement: () => "",
});

/**
 * Rewrites every relative href/src to an absolute URL.
 *
 * Markdown is consumed away from the page it came from, so a link to "/insights"
 * is unresolvable by the time an agent reads it. Anchors are left alone: they
 * point inside the document that is being produced.
 */
const absolutise = (root, origin) => {
  if (!origin) return;

  for (const [selector, attribute] of [
    ["a[href]", "href"],
    ["img[src]", "src"],
  ]) {
    for (const node of root.querySelectorAll(selector)) {
      const value = node.getAttribute(attribute);
      if (!value || value.startsWith("#")) continue;
      try {
        node.setAttribute(attribute, new URL(value, origin).toString());
      } catch {
        // A malformed href is left exactly as authored rather than dropped —
        // a visibly broken link is easier to trace than a silently missing one.
      }
    }
  }
};

// Turndown separates blocks with one blank line, but removing a decorative
// image or an aria-hidden span can leave two or three stacked. Collapsing them
// keeps the output stable enough to assert on.
const tidy = (markdown) =>
  markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/**
 * Extracts the readable body of a rendered page.
 *
 * @param {string} html - a full HTML document
 * @param {object} [options]
 * @param {string} [options.origin] - origin used to absolutise links
 * @returns {{title: string, markdown: string}}
 */
export function extractMarkdown(html, { origin } = {}) {
  const document = domino.createDocument(String(html || ""));

  // <title> carries the site suffix ("… | Tech&"), which is right for a browser
  // tab and redundant in a document whose own heading follows. The page's <h1>
  // is the better title when there is one.
  const documentTitle = String(document.title || "").trim();

  const root = document.querySelector("main") || document.body;
  if (!root) return { title: documentTitle, markdown: "" };

  for (const node of root.querySelectorAll(STRIP_SELECTOR)) node.remove();

  absolutise(root, origin);

  const heading = root.querySelector("h1");
  const title = heading?.textContent?.trim() || documentTitle;

  let markdown = tidy(turndown.turndown(root.innerHTML));

  // Every Markdown document needs an H1 — a page with none is precisely the
  // "flat structure" an agent cannot navigate. The test is whether the page HAS
  // an H1, not whether the document happens to START with one: most pages here
  // open with a hero image and put the heading just after it, so keying off the
  // first line would prepend a second copy of the title above the real one.
  if (!heading && title) {
    markdown = `# ${title}\n\n${markdown}`;
  }

  return { title, markdown };
}

/**
 * Renders the full Markdown response body for a page.
 *
 * @param {string} html - the page's rendered HTML
 * @param {object} options
 * @param {string} options.sourceUrl - the canonical URL this Markdown represents
 * @param {string} [options.origin] - origin used to absolutise links
 * @returns {string}
 */
export function pageToMarkdown(html, { sourceUrl, origin } = {}) {
  const { markdown } = extractMarkdown(html, { origin: origin || sourceUrl });

  // A short provenance footer rather than a YAML front-matter block: front
  // matter is a static-site convention that many agents surface as literal
  // text, whereas a trailing line reads correctly whatever consumes it.
  const footer = sourceUrl
    ? `\n\n---\n\nSource: ${sourceUrl}\n`
    : "\n";

  return `${markdown}${footer}`;
}
