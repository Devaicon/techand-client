import { test } from "node:test";
import assert from "node:assert/strict";
import { extractMarkdown, pageToMarkdown } from "./htmlToMarkdown.mjs";

// A page shaped the way SiteChrome renders one: navbar and footer as siblings
// of <main>, content inside it.
const page = (main, { title = "Page | Tech&" } = {}) => `<!doctype html>
<html lang="en"><head><title>${title}</title></head>
<body>
  <nav><a href="/whatwedo">What we do</a><a href="/insights">Insights</a></nav>
  <main>${main}</main>
  <footer><a href="/privacy">Privacy</a></footer>
</body></html>`;

test("only <main> survives — the navbar and footer are dropped", () => {
  const { markdown } = extractMarkdown(
    page("<h1>What we do</h1><p>We build things.</p>"),
  );

  assert.match(markdown, /# What we do/);
  assert.match(markdown, /We build things\./);
  assert.doesNotMatch(markdown, /Privacy/);
  assert.doesNotMatch(markdown, /What we do\]\(/);
});

test("heading levels are preserved, not flattened", () => {
  const { markdown } = extractMarkdown(
    page("<h1>Top</h1><h2>Second</h2><h3>Third</h3>"),
  );

  assert.match(markdown, /^# Top$/m);
  assert.match(markdown, /^## Second$/m);
  assert.match(markdown, /^### Third$/m);
});

test("scripts, styles and decorative nodes never reach the output", () => {
  const { markdown } = extractMarkdown(
    page(
      `<h1>Hero</h1>
       <script>window.secret = 1;</script>
       <style>.x{color:red}</style>
       <div aria-hidden="true">gradient overlay</div>
       <svg><path d="M10 19l-7-7"/></svg>
       <p>Real copy.</p>`,
    ),
  );

  assert.doesNotMatch(markdown, /window\.secret/);
  assert.doesNotMatch(markdown, /color:red/);
  assert.doesNotMatch(markdown, /gradient overlay/);
  assert.doesNotMatch(markdown, /M10 19/);
  assert.match(markdown, /Real copy\./);
});

test("relative links become absolute so an agent can follow them", () => {
  const { markdown } = extractMarkdown(
    page('<h1>H</h1><p><a href="/contact-us">Talk to sales</a></p>'),
    { origin: "https://techand.ai" },
  );

  assert.match(markdown, /\[Talk to sales\]\(https:\/\/techand\.ai\/contact-us\)/);
});

test("an in-page anchor stays relative", () => {
  const { markdown } = extractMarkdown(
    page('<h1>H</h1><p><a href="#section-2">Jump</a></p>'),
    { origin: "https://techand.ai" },
  );

  assert.match(markdown, /\[Jump\]\(#section-2\)/);
});

test("a described image keeps its alt text; a decorative one is dropped", () => {
  const { markdown } = extractMarkdown(
    page(
      `<h1>H</h1>
       <img src="/hero.webp" alt="">
       <img src="/chart.webp" alt="Adoption curve">`,
    ),
    { origin: "https://techand.ai" },
  );

  assert.doesNotMatch(markdown, /hero\.webp/);
  assert.match(
    markdown,
    /!\[Adoption curve\]\(https:\/\/techand\.ai\/chart\.webp\)/,
  );
});

test("lists and emphasis survive the round trip", () => {
  const { markdown } = extractMarkdown(
    page(
      "<h1>H</h1><ul><li>One</li><li><strong>Two</strong></li></ul><ol><li>First</li></ol>",
    ),
  );

  assert.match(markdown, /One/);
  assert.match(markdown, /\*\*Two\*\*/);
  assert.match(markdown, /1\.\s+First/);
});

test("a page whose <main> has no <h1> still gets a title", () => {
  // The article template opens with a category chip, not a heading.
  const { markdown, title } = extractMarkdown(
    page("<span>Insights</span><p>Body copy.</p>", {
      title: "Agentic AI at scale | Tech&",
    }),
  );

  assert.equal(title, "Agentic AI at scale | Tech&");
  assert.match(markdown, /^# Agentic AI at scale \| Tech&/);
});

test("the page <h1> is preferred over the <title> suffix", () => {
  const { title } = extractMarkdown(
    page("<h1>Agentic AI at scale</h1>", {
      title: "Agentic AI at scale | Tech&",
    }),
  );

  assert.equal(title, "Agentic AI at scale");
});

test("a document with no <main> falls back to the body rather than erroring", () => {
  const { markdown } = extractMarkdown(
    "<html><body><h1>Bare</h1><p>No main here.</p></body></html>",
  );

  assert.match(markdown, /# Bare/);
  assert.match(markdown, /No main here\./);
});

test("empty and malformed input produce an empty document, not a throw", () => {
  assert.doesNotThrow(() => extractMarkdown(""));
  assert.doesNotThrow(() => extractMarkdown(null));
  assert.doesNotThrow(() => extractMarkdown("<main><p>unclosed"));
});

test("the response body carries a provenance footer", () => {
  const body = pageToMarkdown(page("<h1>H</h1><p>Copy.</p>"), {
    sourceUrl: "https://techand.ai/whatwedo",
  });

  assert.match(body, /^# H/);
  assert.match(body, /---\n\nSource: https:\/\/techand\.ai\/whatwedo\n$/);
});

test("blank lines never stack up where nodes were removed", () => {
  const body = pageToMarkdown(
    page(
      `<h1>H</h1>
       <div aria-hidden="true">x</div>
       <div aria-hidden="true">y</div>
       <img src="/a.webp" alt="">
       <p>After.</p>`,
    ),
    { sourceUrl: "https://techand.ai/x" },
  );

  assert.doesNotMatch(body, /\n{3,}/);
});

test("an <h1> that is not the first node does not get a duplicate title above it", () => {
  // The real shape of these pages: GenericHero renders a background image, then
  // the heading. Keying the title off the first line of output would emit "#
  // What We Do" twice.
  const { markdown } = extractMarkdown(
    page('<img src="/hero.webp" alt="What We Do"><h1>What We Do</h1><p>Copy.</p>', {
      title: "What We Do | Tech&",
    }),
    { origin: "https://techand.ai" },
  );

  const h1s = markdown.split("\n").filter((line) => line.startsWith("# "));
  assert.deepEqual(h1s, ["# What We Do"]);
});

test("a page with no <h1> anywhere still gets exactly one", () => {
  const { markdown } = extractMarkdown(
    page("<p>Body only.</p>", { title: "Bare page | Tech&" }),
  );

  const h1s = markdown.split("\n").filter((line) => line.startsWith("# "));
  assert.deepEqual(h1s, ["# Bare page | Tech&"]);
});
