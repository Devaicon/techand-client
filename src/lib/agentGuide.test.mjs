import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildLlmsTxt,
  buildNotFoundMarkdown,
  SECTIONS,
  MACHINE_READABLE,
} from "./agentGuide.mjs";

const BASE = "https://techand.ai";

test("llms.txt opens with the llmstxt.org shape: H1 then a blockquote summary", () => {
  const lines = buildLlmsTxt({ baseUrl: BASE }).split("\n");

  assert.equal(lines[0], "# Tech&");
  assert.equal(lines[1], "");
  assert.match(lines[2], /^> /);
});

test("llms.txt carries when-to-use guidance, which is the point of the file", () => {
  const text = buildLlmsTxt({ baseUrl: BASE });

  assert.match(text, /^## When to use this site$/m);
  // Named jobs, not adjectives: the audit's complaint about generic marketing
  // copy is what this section exists to answer.
  assert.match(text, /Dynamics 365/);
  assert.match(text, /UAE|GCC/);
  // And an explicit boundary, so an agent can rule the site out too.
  assert.match(text, /Look elsewhere for:/);
  assert.match(text, /learn\.microsoft\.com/);
});

test("llms.txt tells an agent how to call the site", () => {
  const text = buildLlmsTxt({ baseUrl: BASE });

  assert.match(text, /^## How to call it$/m);
  assert.match(text, /Accept: text\/markdown/);
  assert.match(text, /sitemap\.xml/);
});

test("every section link is absolute", () => {
  const text = buildLlmsTxt({ baseUrl: BASE });

  for (const { path, title } of SECTIONS) {
    assert.match(
      text,
      new RegExp(`\\[${title.replace(/[&]/g, "\\&")}\\]\\(${BASE}${path}\\)`),
      `missing absolute link for ${path}`,
    );
  }
});

test("a trailing slash on the base URL never doubles up in a link", () => {
  const text = buildLlmsTxt({ baseUrl: "https://techand.ai/" });

  assert.doesNotMatch(text, /techand\.ai\/\//);
});

test("published CMS pages and articles are listed with their titles", () => {
  const text = buildLlmsTxt({
    baseUrl: BASE,
    cmsPages: [{ slug: "solutions/dynamics-365-uae", title: "Dynamics 365 UAE" }],
    posts: [
      { slug: "agentic-ai", title: "Agentic AI at scale", subtitle: "What it takes." },
    ],
  });

  assert.match(text, /^## Pages$/m);
  assert.match(
    text,
    /\[Dynamics 365 UAE\]\(https:\/\/techand\.ai\/solutions\/dynamics-365-uae\)/,
  );
  assert.match(text, /^## Insights$/m);
  assert.match(
    text,
    /\[Agentic AI at scale\]\(https:\/\/techand\.ai\/insights\/agentic-ai\): What it takes\./,
  );
});

test("an API outage shortens llms.txt rather than leaving empty headings", () => {
  // Both feeds return [] when the server is unreachable.
  const text = buildLlmsTxt({ baseUrl: BASE, cmsPages: [], posts: [] });

  assert.doesNotMatch(text, /## Pages/);
  assert.doesNotMatch(text, /## Insights/);
  // The guidance an agent actually needs is static, so it survives the outage.
  assert.match(text, /## When to use this site/);
  assert.match(text, /## Sections/);
});

test("entries without a slug are skipped, and a missing title falls back", () => {
  const text = buildLlmsTxt({
    baseUrl: BASE,
    cmsPages: [{ slug: "" }, { title: "orphan" }, { slug: "about" }],
    posts: [{ slug: "untitled" }],
  });

  assert.doesNotMatch(text, /orphan/);
  assert.match(text, /\[about\]\(https:\/\/techand\.ai\/about\)/);
  assert.match(text, /\[untitled\]\(https:\/\/techand\.ai\/insights\/untitled\)/);
});

test("the 404 body names the path and points somewhere useful", () => {
  const text = buildNotFoundMarkdown({ baseUrl: BASE, path: "/no/such/page" });

  assert.match(text, /^# 404 — Not found$/m);
  assert.match(text, /`\/no\/such\/page`/);
  // Recovery routes: the machine-readable files first, then the sections.
  for (const { path } of MACHINE_READABLE) {
    assert.ok(text.includes(`${BASE}${path}`), `404 body should link ${path}`);
  }
  assert.match(text, /^## Main sections$/m);
});

test("the 404 body is safe to render without a path", () => {
  const text = buildNotFoundMarkdown({ baseUrl: BASE });

  assert.match(text, /That path does not exist/);
  assert.doesNotMatch(text, /undefined/);
});

test("the 404 body stays short — it is a signpost, not the site guide", () => {
  const notFound = buildNotFoundMarkdown({ baseUrl: BASE, path: "/x" });
  const guide = buildLlmsTxt({ baseUrl: BASE });

  assert.ok(
    notFound.length < guide.length,
    "the 404 recovery card should be shorter than llms.txt",
  );
});
