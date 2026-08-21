import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSitemap } from "./buildSitemap.mjs";

const ROUTES = [
  { path: "/", lastModified: "2026-07-25", changeFrequency: "weekly", priority: 1 },
  { path: "/insights", lastModified: "2026-08-15", changeFrequency: "weekly", priority: 0.8 },
];

const urls = (entries) => entries.map((e) => e.url);

test("the home route is the bare origin, not origin + slash", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    routes: [ROUTES[0]],
  });

  assert.deepEqual(urls(entries), ["https://techand.ai"]);
});

test("a trailing slash on the base URL never produces a doubled slash", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai/",
    routes: ROUTES,
    cmsPages: [{ slug: "solutions/dynamics-365-uae" }],
  });

  for (const url of urls(entries)) {
    assert.ok(
      !url.slice("https://".length).includes("//"),
      `doubled slash in ${url}`,
    );
  }
});

test("CMS pages and insight articles both reach the sitemap", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    routes: ROUTES,
    cmsPages: [{ slug: "solutions/dynamics-365-uae", updatedAt: "2026-08-01T10:00:00.000Z" }],
    posts: [{ slug: "agentic-ai", updatedAt: "2026-08-10T10:00:00.000Z" }],
  });

  assert.deepEqual(urls(entries), [
    "https://techand.ai",
    "https://techand.ai/insights",
    "https://techand.ai/solutions/dynamics-365-uae",
    "https://techand.ai/insights/agentic-ai",
  ]);
});

test("a nested CMS slug keeps its separators and escapes what is inside them", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    cmsPages: [{ slug: "solutions/r&d partners" }],
  });

  // The separator survives; the "&" that would break the XML document does not.
  assert.deepEqual(urls(entries), [
    "https://techand.ai/solutions/r%26d%20partners",
  ]);
});

test("a CMS page colliding with a code route does not produce a duplicate URL", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    routes: ROUTES,
    cmsPages: [{ slug: "insights", updatedAt: "2026-08-01T10:00:00.000Z" }],
  });

  assert.equal(urls(entries).filter((u) => u.endsWith("/insights")).length, 1);
  // The code route wins: Next serves the static segment, so its metadata is
  // the one that describes what a crawler will actually fetch.
  const insights = entries.find((e) => e.url.endsWith("/insights"));
  assert.equal(insights.priority, 0.8);
});

test("two CMS pages with the same slug collapse to one entry", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    cmsPages: [{ slug: "about" }, { slug: "about" }],
  });

  assert.equal(entries.length, 1);
});

test("dates are normalised to ISO, and an unusable one is omitted rather than faked", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    cmsPages: [
      { slug: "dated", updatedAt: "2026-08-01T10:00:00.000Z" },
      { slug: "undated" },
      { slug: "broken", updatedAt: "not a date" },
    ],
  });

  assert.equal(entries[0].lastModified, "2026-08-01T10:00:00.000Z");
  assert.equal("lastModified" in entries[1], false);
  assert.equal("lastModified" in entries[2], false);
});

test("empty and malformed slugs are dropped, not turned into the home page", () => {
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    cmsPages: [{ slug: "" }, { slug: null }, {}, { slug: "/" }],
    posts: [{ slug: "" }],
  });

  assert.deepEqual(entries, []);
});

test("an API outage degrades to the code routes rather than an empty sitemap", () => {
  // Both API calls returning [] is exactly what `sitemap-api.js` yields when the
  // server is unreachable. The document must still list the static site.
  const entries = buildSitemap({
    baseUrl: "https://techand.ai",
    routes: ROUTES,
    cmsPages: [],
    posts: [],
  });

  assert.deepEqual(urls(entries), [
    "https://techand.ai",
    "https://techand.ai/insights",
  ]);
});
