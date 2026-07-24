import test from "node:test";
import assert from "node:assert/strict";

import { buildBreadcrumbTrail } from "./buildBreadcrumbTrail.mjs";

test("builds a full trail for a nested capabilities page", () => {
  assert.deepEqual(buildBreadcrumbTrail("/capabilities/data"), [
    { label: "Home", href: "/", isCurrent: false },
    { label: "Capabilities", href: "/capabilities", isCurrent: false },
    { label: "Data", href: "/capabilities/data", isCurrent: true },
  ]);
});

test("uses pretty labels for known what-we-do slugs", () => {
  assert.deepEqual(buildBreadcrumbTrail("/whatwedo/ai-automation"), [
    { label: "Home", href: "/", isCurrent: false },
    { label: "What We Do", href: "/whatwedo", isCurrent: false },
    { label: "AI & Automation", href: "/whatwedo/ai-automation", isCurrent: true },
  ]);
});

test("builds a trail for a blog post; the slug crumb is overridden in the UI", () => {
  // buildBreadcrumbTrail still title-cases the slug here; the reader page passes
  // the real post title via Breadcrumb's currentLabel prop.
  assert.deepEqual(buildBreadcrumbTrail("/insights/awd-blog"), [
    { label: "Home", href: "/", isCurrent: false },
    { label: "Insights", href: "/insights", isCurrent: false },
    { label: "Awd Blog", href: "/insights/awd-blog", isCurrent: true },
  ]);
});

test("returns empty for the homepage and top-level pages", () => {
  assert.deepEqual(buildBreadcrumbTrail("/"), []);
  assert.deepEqual(buildBreadcrumbTrail("/capabilities"), []);
  assert.deepEqual(buildBreadcrumbTrail("/industries"), []);
});

test("title-cases unknown slugs as a fallback", () => {
  const trail = buildBreadcrumbTrail("/capabilities/new-thing");
  assert.equal(trail.at(-1).label, "New Thing");
  assert.equal(trail.at(-1).isCurrent, true);
});

test("ignores a trailing hash or query string", () => {
  assert.deepEqual(
    buildBreadcrumbTrail("/capabilities/data#power-bi"),
    buildBreadcrumbTrail("/capabilities/data"),
  );
  assert.deepEqual(
    buildBreadcrumbTrail("/capabilities/data?ref=nav"),
    buildBreadcrumbTrail("/capabilities/data"),
  );
});

test("marks only the last crumb as current", () => {
  const trail = buildBreadcrumbTrail("/whatwedo/managed-services");
  const currentCount = trail.filter((c) => c.isCurrent).length;
  assert.equal(currentCount, 1);
  assert.equal(trail.at(-1).isCurrent, true);
});

test("returns empty for non-string input", () => {
  assert.deepEqual(buildBreadcrumbTrail(null), []);
  assert.deepEqual(buildBreadcrumbTrail(undefined), []);
});
